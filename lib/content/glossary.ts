/** Shared, plain-language definitions. Use [term](#glossary-id) in Markdown. */
export const glossary: Record<string, { title: string; definition: string }> = {
  'gross-arrivals': {
    title: 'Gross Arrivals',
    definition: 'The number of people moving into a country, before subtracting anyone leaving. In these UK charts, this means people moving to the UK for at least 12 months, including returning British citizens. It is the immigration line, not net migration.',
  },
  'net-migration': {
    title: 'Net Migration',
    definition: 'Immigration minus emigration: the number moving in, less the number moving out. Net migration can fall because fewer people arrive, more people leave, or both. It does not count births or deaths.',
  },
};
