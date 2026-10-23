/**
 * Publication-time content integrity check.
 *
 * The application loader always verifies files can be parsed and rendered.
 * This command additionally checks relationships and editorial safeguards
 * across each complete topic, so authors can leave temporary gaps while
 * editing without breaking the dev server.
 */
import { ContentError, listTopicSlugs, loadTopic } from '../lib/content/load';

async function main(): Promise<void> {
  const slugs = await listTopicSlugs();
  const failures: string[] = [];

  console.log('Content integrity — publication-time cross-item checks.\n');

  for (const slug of slugs) {
    try {
      await loadTopic(slug, undefined, { validateIntegrity: true });
      console.log(`✓ ${slug}`);
    } catch (error) {
      const message = error instanceof ContentError ? error.message : String(error);
      failures.push(`${slug}: ${message}`);
      console.log(`✗ ${slug}`);
      console.log(`  ${message.replace(/\n/g, '\n  ')}`);
    }
  }

  console.log(`\n${failures.length === 0 ? 'PASS' : `FAIL — ${failures.length} topic(s) need attention`}`);
  process.exitCode = failures.length === 0 ? 0 : 1;
}

main();
