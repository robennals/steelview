// `pnpm build`, unless `.next` already holds a build of exactly these sources.
// E2E runs start here, so re-running a test does not rebuild an unchanged site.
// `--force` always builds, for `pnpm check`: the build also type-checks tests,
// which do not count as a change here because they cannot alter the site.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { z } from 'zod';

const STAMP_FILE = '.next/build-if-changed.json';
const CACHE_DIR = '.next/cache';
const BUILD_ID_FILE = '.next/BUILD_ID';

const StampSchema = z.object({ fingerprint: z.string(), buildId: z.string() });
type Stamp = z.infer<typeof StampSchema>;

/** False only for files the site cannot depend on; anything unsure counts. */
export function affectsBuild(file: string): boolean {
  return !/^(tests|docs|\.github)\/|\.(test|stories)\.tsx?$|^[^/]+\.md$/.test(file);
}

/** A hash of each file's name and contents, plus whatever else shapes the build. */
export function buildFingerprint(
  files: string[],
  read: (file: string) => Buffer | string | null,
  environment: string
): string {
  const hash = createHash('sha256').update(environment);
  for (const file of files) {
    const contents = read(file);
    // Each part is prefixed with its length, so no two file lists hash alike.
    hash.update(`${file.length}:${file}`);
    hash.update(contents === null ? 'deleted' : `${contents.length}:`);
    if (contents !== null) hash.update(contents);
  }
  return hash.digest('hex');
}

/**
 * The build ID is compared as well as the sources because `pnpm build` replaces
 * `.next` without recording anything, and may have built some other commit.
 */
export function isCurrent(stamp: Stamp | null, fingerprint: string, buildId: string | null): boolean {
  return stamp !== null && stamp.fingerprint === fingerprint && stamp.buildId === buildId;
}

function readOrNull(file: string): Buffer | null {
  try {
    return readFileSync(file);
  } catch {
    return null;
  }
}

function currentFingerprint(): string {
  const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
    .split('\0')
    .filter((file) => file && affectsBuild(file))
    .sort();
  return buildFingerprint(files, readOrNull, `${process.version} ${process.env.NEXT_PUBLIC_SITE_URL ?? ''}`);
}

function main(): void {
  const fingerprint = currentFingerprint();
  const stampText = readOrNull(STAMP_FILE)?.toString() ?? null;
  const stamp = stampText === null ? null : StampSchema.parse(JSON.parse(stampText));
  const buildId = readOrNull(BUILD_ID_FILE)?.toString() ?? null;
  if (!process.argv.includes('--force') && isCurrent(stamp, fingerprint, buildId)) {
    console.log('Build is up to date: nothing it depends on has changed.');
    return;
  }

  // A cache left by a build of an older commit can fail this one with "next/font/google
  // queries have exactly one entry" (Next 16.3.1). Starting without it costs about 4s.
  rmSync(CACHE_DIR, { recursive: true, force: true });
  const { status } = spawnSync('pnpm', ['build'], { stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
  // The fingerprint predates the build, so an edit made during it forces another.
  const stampAfter: Stamp = { fingerprint, buildId: readFileSync(BUILD_ID_FILE, 'utf8') };
  writeFileSync(STAMP_FILE, JSON.stringify(stampAfter));
}

// Run only as a script, so tests can import the pure functions above.
if (require.main === module) main();
