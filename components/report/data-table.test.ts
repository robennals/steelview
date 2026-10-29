import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataTable, type DataTableRow } from './data-table';
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
