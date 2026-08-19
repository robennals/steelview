import { z } from 'zod';

export const FACT_STATUSES = [
  'well-supported',
  'contested',
  'not-supported',
  'complicated',
  'unknown',
] as const;

export const SOURCE_STANCES = ['supports', 'contests', 'complicates'] as const;

export const CRUX_KINDS = ['prediction', 'assumption', 'tradeoff', 'priority'] as const;

// Dates are strings, not Date objects: frontmatter dates are deliberately
// imprecise ("2024-11" for a monthly release) and YAML would coerce a bare
// date into a Date in the wrong timezone.
const partialDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'must be YYYY, YYYY-MM or YYYY-MM-DD');

export const sourceSchema = z.object({
  stance: z.enum(SOURCE_STANCES),
  quote: z.string().min(1),
  title: z.string().min(1),
  url: z.string().regex(/^https?:\/\/\S+$/, 'must be an http(s) URL'),
  publisher: z.string().min(1),
  date: partialDate,
});

export const factFrontmatterSchema = z.object({
  claim: z.string().min(1),
  status: z.enum(FACT_STATUSES),
  sources: z.array(sourceSchema).default([]),
});

export const viewpointFrontmatterSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  citesFacts: z.array(z.string()).default([]),
  acknowledges: z.array(z.string()).default([]),
  setsAside: z.array(z.string()).default([]),
  principles: z.array(z.string()).default([]),
});

export const principleFrontmatterSchema = z.object({
  name: z.string().min(1),
  heldBy: z.array(z.string()).min(1, 'a principle nobody holds does not belong on the page'),
});

export const cruxPositionSchema = z.object({
  viewpoint: z.string().min(1),
  holds: z.string().min(1),
});

export const cruxFrontmatterSchema = z.object({
  question: z.string().min(1),
  kind: z.enum(CRUX_KINDS),
  divides: z.array(z.string()).min(2, 'a crux divides at least two viewpoints'),
  positions: z.array(cruxPositionSchema).min(2),
});

export const topicFrontmatterSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
});
