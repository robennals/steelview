import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataCards, type DataCardsProps } from './data-cards';
import { DataTable, type DataTableRow } from './data-table';
import { isWholeQuote, splitQuoted } from './quoted-text';
import { sortRows } from './table-sort';

const nara = { label: 'NARA', href: '#source-laws-3', number: 3 };
const rows: DataTableRow[] = [
  { year: '1993', law: 'National Voter Registration Act', effect: { value: 'Motor-voter registration', sources: [nara] } },
  { year: '1965', law: 'Voting Rights Act', effect: { value: 'Bars racial discrimination', sources: [nara, { label: 'DOJ', href: '#source-laws-4', number: 4 }] } },
  { year: '2002', law: 'Help America Vote Act', effect: null },
];

test('a cited cell sorts by its value', () => {
  assert.deepEqual(sortRows(rows, 'effect', 'ascending').map(r => r.law), ['Voting Rights Act', 'National Voter Registration Act', 'Help America Vote Act']);
  assert.deepEqual(sortRows([{ n: { value: 10, sources: [] } }, { n: 9 }], 'n', 'ascending').map(r => r.n), [9, { value: 10, sources: [] }]);
});

test('a cited cell renders its text, then one footnote link per source', () => {
  const html = renderToStaticMarkup(createElement(DataTable, {
    caption: 'One row per law',
    columns: [{ key: 'year', label: 'Year', format: 'text' }, { key: 'law', label: 'Law', rowHeader: true }, { key: 'effect', label: 'Effect' }],
    rows,
    defaultSort: { key: 'year', direction: 'ascending' },
  }));
  assert.match(html, /Bars racial discrimination<span> <a class="sv-footnote" href="#source-laws-3" aria-label="Source: NARA \[3\]">\[3\]<\/a><\/span><span> <a class="sv-footnote" href="#source-laws-4"/);
  // The server renders the default order, so the table is right with JavaScript off.
  assert.ok(html.indexOf('Voting Rights Act') < html.indexOf('National Voter Registration Act'));
  assert.ok(html.indexOf('National Voter Registration Act') < html.indexOf('Help America Vote Act'));
});

test('the footer sits after the source line and before About this data', () => {
  const html = renderToStaticMarkup(createElement(DataTable, {
    caption: 'c',
    columns: [{ key: 'law', label: 'Law' }, { key: 'year', label: 'Year' }],
    rows,
    sources: [nara],
    note: 'A note.',
    footer: createElement('p', { id: 'observations' }, 'Observations'),
  }));
  assert.ok(html.indexOf('sv-chart__credit') < html.indexOf('id="observations"'));
  assert.ok(html.indexOf('id="observations"') < html.indexOf('About this data'));
});

const court = { label: 'Court', href: '#source-laws-3', number: 3 };
const props: DataCardsProps = {
  caption: 'One card per ruling',
  layout: 'timeline',
  leadColumn: 'says',
  dateColumn: 'year',
  columns: [
    { key: 'year', label: 'Year', format: 'text' },
    { key: 'name', label: 'Ruling', rowHeader: true },
    { key: 'says', label: 'What it says' },
    { key: 'status', label: 'Status' },
  ],
  rows: [
    { year: '2013', name: 'Inter Tribal', says: { value: 'Congress\'s power is "paramount"', sources: [court] }, status: null },
    { year: '1788', name: 'Elections Clause', says: '"prescribed in each state"', status: 'In force' },
  ],
};

test('a row is a card: the date, the title, the lead, then a labelled line per other column', () => {
  const html = renderToStaticMarkup(createElement(DataCards, props));
  assert.match(html, /<ol class="sv-cards__list" data-layout="timeline" aria-label="One card per ruling">/);
  assert.match(html, /<p class="sv-cards__date">2013<\/p><p class="sv-cards__title">Inter Tribal<\/p>/);
  assert.match(html, /<dt>Status<\/dt><dd>In force<\/dd>/);
  assert.doesNotMatch(html, /<dt>What it says<\/dt>/);
});

test('an empty cell or an author\'s dash drops its line', () => {
  const rows = [...props.rows, { year: '2020', name: 'Dashed', says: 'Words', status: '—' }];
  const html = renderToStaticMarkup(createElement(DataCards, { ...props, rows }));
  assert.equal(html.match(/<dt>Status<\/dt>/g)?.length, 1);
  assert.doesNotMatch(html, /—/);
});

test('quoted words are marked, with footnotes after the text, and a lead that is all quotation is flagged', () => {
  const html = renderToStaticMarkup(createElement(DataCards, props));
  assert.match(html, /Congress&#x27;s power is <q>paramount<\/q><span> <a class="sv-footnote" href="#source-laws-3"/);
  assert.match(html, /<p class="sv-cards__lead" data-quote="true"><q>prescribed in each state<\/q><\/p>/);
});

test('cards keep the written order unless the figure sets a default sort', () => {
  const written = renderToStaticMarkup(createElement(DataCards, props));
  assert.ok(written.indexOf('Inter Tribal') < written.indexOf('Elections Clause'));
  const sorted = renderToStaticMarkup(createElement(DataCards, { ...props, defaultSort: { key: 'year', direction: 'ascending' } }));
  assert.ok(sorted.indexOf('Elections Clause') < sorted.indexOf('Inter Tribal'));
});

test('separates quoted words from the words around them', () => {
  assert.deepEqual(splitQuoted('It "places significant legal constraints" on policy'), [
    { text: 'It ', quoted: false },
    { text: 'places significant legal constraints', quoted: true },
    { text: ' on policy', quoted: false },
  ]);
});

test('reads curly quotation marks too', () => {
  assert.deepEqual(splitQuoted('“short-term stopover”'), [{ text: 'short-term stopover', quoted: true }]);
});

test('leaves a stray quotation mark in the plain text', () => {
  assert.deepEqual(splitQuoted('A 12" screen'), [{ text: 'A 12" screen', quoted: false }]);
});

test('a text of nothing but a quotation is a whole quote, closing punctuation aside', () => {
  assert.equal(isWholeQuote(splitQuoted('"about one-third".')), true);
});

test('a text with words of its own is not a whole quote', () => {
  assert.equal(isWholeQuote(splitQuoted('Yes, "legally pursuant to Article 58".')), false);
  assert.equal(isWholeQuote(splitQuoted('"One" and "two"')), false);
  assert.equal(isWholeQuote(splitQuoted('plain')), false);
});

test('a qualified cell reads in the source\'s words and sorts by its number, a range by its midpoint', () => {
  const qualified: DataTableRow[] = [
    { area: 'North', deaths: { value: 159, qualifier: 'at least', asPublished: 'At least 159' } },
    { area: 'East', deaths: { low: 60, high: 80 } },
    { area: 'South', deaths: { value: 90, qualifier: 'about' } },
    { area: 'Capital', deaths: 120 },
  ];
  assert.deepEqual(sortRows(qualified, 'deaths', 'descending').map(r => r.area), ['North', 'Capital', 'South', 'East']);
  const html = renderToStaticMarkup(createElement(DataTable, {
    caption: 'One row per area',
    columns: [{ key: 'area', label: 'Area', rowHeader: true }, { key: 'deaths', label: 'Deaths', format: { unit: 'count' } }],
    rows: qualified,
  }));
  assert.match(html, />At least 159</);
  assert.match(html, />60–80</);
  assert.match(html, />about 90</);
  assert.match(html, />120</);
});

test('a date column prints dates as words and sorts them by date, a coarser date first', () => {
  const dated: DataTableRow[] = [
    { law: 'C', passed: '2026-06-12' },
    { law: 'A', passed: '2025' },
    { law: 'D', passed: '2026-06' },
    { law: 'B', passed: 2026 },
    { law: 'E', passed: null },
  ];
  const html = renderToStaticMarkup(createElement(DataTable, {
    caption: 'One row per law',
    columns: [{ key: 'law', label: 'Law', rowHeader: true }, { key: 'passed', label: 'Passed', format: 'date' }],
    rows: dated,
    defaultSort: { key: 'passed', direction: 'ascending' },
  }));
  assert.deepEqual([...html.matchAll(/<th scope="row"[^>]*>([A-E])</g)].map(m => m[1]), ['A', 'B', 'D', 'C', 'E']);
  assert.match(html, />12 Jun 2026</);
  assert.match(html, />Jun 2026</);
  assert.match(html, /<td data-align="left">2026<\/td>/);
});

const manyRows = (n: number): DataTableRow[] => Array.from({ length: n }, (_, i) => ({ name: `Row ${i + 1}`, value: i + 1 }));
const render = (props: Partial<Parameters<typeof DataTable>[0]> & { rows: DataTableRow[] }) =>
  renderToStaticMarkup(createElement(DataTable, { caption: 'One row per thing', columns: [{ key: 'name', label: 'Name', rowHeader: true }, { key: 'value', label: 'Value' }], ...props }));

test('a table of up to fifteen rows renders in full, with no "Show all" button', () => {
  const html = render({ rows: manyRows(15) });
  assert.equal(html.match(/<tr/g)?.length, 16);
  assert.doesNotMatch(html, /data-beyond-preview|data-collapsed|Show all/);
});

test('a longer table has every row in its markup, marks those past the tenth, and offers "Show all N rows"', () => {
  const html = render({ rows: manyRows(20) });
  // With JavaScript off every row is in the page; CSS hides the marked ones only when scripting is on.
  assert.equal(html.match(/<tr/g)?.length, 21);
  assert.equal(html.match(/data-beyond-preview/g)?.length, 10);
  assert.match(html, /<tr data-row="Row 11" data-beyond-preview="true"><th scope="row" data-align="left">Row 11</);
  assert.match(html, /data-collapsed="true"/);
  const tbodyId = html.match(/<tbody id="([^"]+)"/)?.[1];
  assert.ok(tbodyId);
  assert.match(html, new RegExp(`<button type="button" class="sv-data__more" aria-expanded="false" aria-controls="${tbodyId}">Show all 20 rows</button>`));
  // A screen reader hears that only part of the table is showing.
  assert.match(html, /<caption class="sv-data__caption">One row per thing<span class="sv-data__shown sv-visually-hidden">, first 10 of 20 rows shown<\/span><\/caption>/);
});

test('a table with more than three columns is wide unless it says otherwise', () => {
  const columns = ['a', 'b', 'c', 'd'].map(key => ({ key, label: key.toUpperCase() }));
  const rows = [{ a: 'x', b: 1, c: 2, d: 3 }];
  assert.match(render({ rows, columns }), /<figure class="sv-chart sv-report sv-data sv-data--wide"/);
  assert.match(render({ rows, columns, width: 'text' }), /<figure class="sv-chart sv-report sv-data"/);
  assert.match(render({ rows, columns: columns.slice(0, 3) }), /<figure class="sv-chart sv-report sv-data"/);
  assert.match(render({ rows, columns: columns.slice(0, 3), width: 'wide' }), /sv-data--wide/);
});
