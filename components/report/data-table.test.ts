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
