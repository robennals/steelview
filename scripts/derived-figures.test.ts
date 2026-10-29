import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDerivedFigures, verifiedDerivedFigures } from './derived-figures';

test('derived percentages require quoted inputs and correct arithmetic', () => {
  const data = { sources: [{ quote: '46,497 arrivals, against 813,000.' }], derivedFigures: [{ method: 'ratio-percent', figure: '5.7%', numerator: 46497, denominator: 813000, decimals: 1 }] };
  assert.deepEqual(verifiedDerivedFigures(data), ['5.7%']);
  assert.deepEqual(verifiedDerivedFigures({ ...data, sources: [] }), []);
  data.derivedFigures[0].figure = '7%';
  assert.throws(() => verifiedDerivedFigures(data), /Incorrect calculation/);
});
test('a derived figure whose input is not quoted is reported, not thrown', () => {
  const data = {
    sources: [{ quote: '46,497 arrivals; 40% were children' }],
    derivedFigures: [
      { method: 'ratio-percent', figure: '5.7%', numerator: 46497, denominator: 813000, decimals: 1 },
      { method: 'complement-percent', figure: '60%', percent: 40, decimals: 0 },
    ],
  };
  assert.deepEqual(checkDerivedFigures(data), { verified: ['60%'], unquoted: [{ figure: '5.7%', inputs: ['813000'] }] });
});
test('a historical mean must cover every year and match the chart', () => {
  const data = { derivedFigures: [{ method: 'series-mean', figure: '2,000', reading: 'people', line: 'Immigration', from: 2000, to: 2001, roundTo: 1000 }], series: { readings: [{ id: 'people', lines: [{ name: 'Immigration', points: [{ period: '2000', value: 1000 }, { period: '2001', value: 3000 }] }] }] } };
  assert.deepEqual(verifiedDerivedFigures(data), ['2,000']);
  data.series.readings[0].lines[0].points.pop();
  assert.throws(() => verifiedDerivedFigures(data), /Incomplete annual series/);
});
