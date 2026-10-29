import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWeeklyRows } from './brent-fixture';

test('EIA weekly rows become one dated point per reported weekday, across month ends and padded days', () => {
  const html = `<tr> <td class='B6'>&nbsp;&nbsp;2008 Jun-30 to Jul- 4</td> <td class='B3'>138.40</td> <td class='B3'>140.67</td> <td class='B3'>141.24</td> <td class='B3'>143.95</td> <td class='B3'></td> </tr>`;
  assert.deepEqual(parseWeeklyRows(html), [
    ['2008-06-30', 138.4],
    ['2008-07-01', 140.67],
    ['2008-07-02', 141.24],
    ['2008-07-03', 143.95],
  ]);
});
