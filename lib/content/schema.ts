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
// imprecise ("2024-11" for a monthly release).
//
// YAML coerces bare scalars before we ever see them: `2024-11-28` arrives as
// a JS Date and `2024` as a number. Normalize both back to the string forms
// the content model uses, so authors never have to remember to quote a date.
const fromYamlScalar = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return String(value);
  return value;
};

// Bounded, not just positional: month must be 01-12 and day 01-31, so
// `2024-13-45` fails instead of passing on shape alone. A wrong date on a
// citation is exactly what this project is judged on.
const MONTH = '(0[1-9]|1[0-2])';
const DAY = '(0[1-9]|[12]\\d|3[01])';

const partialDate = z.preprocess(
  fromYamlScalar,
  z
    .string()
    .regex(new RegExp(`^\\d{4}(-${MONTH}(-${DAY})?)?$`), 'must be YYYY, YYYY-MM or YYYY-MM-DD')
);

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
  lastUpdated: z.preprocess(
    fromYamlScalar,
    z.string().regex(new RegExp(`^\\d{4}-${MONTH}-${DAY}$`), 'must be YYYY-MM-DD')
  ),
});
