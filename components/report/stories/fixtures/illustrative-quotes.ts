/*
 * ILLUSTRATIVE DATA. Fictional speakers and parties, with invented words, to
 * show how the quote components handle political statements from several
 * sides. No quote here is attributed to a real person or party.
 */
import type { Quote } from '../../quote-attribution';

const illustrative = { label: 'Illustrative data' };

export const illustrativeDebateQuotes: Quote[] = [
  {
    id: 'speaker-a-2024-03',
    text: 'Every crossing is a journey nobody should have to make. The answer is safe, legal routes that are quick enough to be used, so that the boats stop being the only option people can see.',
    speaker: 'Speaker A',
    role: 'Party X spokesperson',
    position: 'Party X',
    tags: ['Channel crossings', 'Asylum'],
    date: '2024-03-12',
    context: 'Debate in the chamber',
    source: illustrative,
  },
  {
    id: 'speaker-b-2024-05',
    text: 'If the system cannot tell the difference between a refugee and someone who has paid a smuggler to skip the queue, the public will stop trusting it. Returns have to be swift and they have to be visible.',
    speaker: 'Speaker B',
    role: 'Party Y spokesperson',
    position: 'Party Y',
    tags: ['Channel crossings', 'Returns'],
    date: '2024-05-02',
    context: 'Radio interview',
    source: illustrative,
  },
  {
    id: 'speaker-c-2024-07',
    text: 'We will not fix this alone. Most people arriving by boat have passed through several countries first, and the only agreements that have ever worked have been ones where every country on the route carries part of the load. That means shared processing, shared intelligence on the gangs, and an honest conversation with our neighbours about what each of us will take on — not slogans that work for a news cycle and fall apart at the first legal challenge.',
    speaker: 'Speaker C',
    role: 'Party Z leader',
    position: 'Party Z',
    tags: ['Channel crossings', 'International cooperation'],
    date: '2024-07-18',
    context: 'Conference speech',
    source: illustrative,
  },
  {
    id: 'speaker-d-2024-09',
    text: 'The backlog is the problem underneath every other problem. Decide claims in weeks, not years, and you empty the hotels.',
    speaker: 'Speaker D',
    role: 'Party X backbencher',
    position: 'Party X',
    tags: ['Asylum'],
    date: '2024-09-04',
    context: 'Committee hearing',
    source: illustrative,
  },
  {
    id: 'speaker-e-2024-11',
    text: 'Deterrence only works if it is credible. A policy that is announced and never used deters nobody.',
    speaker: 'Speaker E',
    role: 'Party Y backbencher',
    position: 'Party Y',
    tags: ['Channel crossings', 'Returns'],
    date: '2024-11-20',
    context: 'Debate in the chamber',
    source: illustrative,
  },
  {
    id: 'speaker-f-2025-02',
    text: 'Councils are being asked to house people with no notice and no money. Whatever the national policy is, it has to come with a plan for the towns where people actually end up.',
    speaker: 'Speaker F',
    role: 'Party Z councillor',
    position: 'Party Z',
    tags: ['Asylum', 'Local services'],
    date: '2025-02-11',
    context: 'Local radio phone-in',
    source: illustrative,
  },
  {
    id: 'speaker-g-undated',
    text: 'We should measure success by lives saved at sea, not only by numbers arriving.',
    speaker: 'Speaker G',
    role: 'Independent member',
    tags: ['Channel crossings'],
    context: 'Written statement',
    source: illustrative,
  },
];

/** One answer per party to the same question, for QuoteComparison. */
export const illustrativeChannelAnswers: Quote[] = illustrativeDebateQuotes.filter(quote =>
  ['speaker-a-2024-03', 'speaker-b-2024-05', 'speaker-c-2024-07'].includes(quote.id ?? ''),
);
