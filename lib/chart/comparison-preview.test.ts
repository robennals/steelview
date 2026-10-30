import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankOf } from './comparison-preview';

const values = [95, 70.8, 50.2, 34.7, 34.2, 33.4, 32.8, 30.8, 30, 27.2, 26.9, 26.5, 23.1, 21.2, 19, 18.6, 16, 12.9, 10.5, 9.9, 8.9, 5.6, 5.2, 4.6, 3.8, 2.9, 2.5, 1.26, 1.24, 1.25, 0.28, 0.03];

test('rankOf gives the highlighted item its place in the full distribution', () => {
  const items = values.map((value, i) => ({ label: i === 16 ? 'United Kingdom' : `Country ${i}`, value, highlight: i === 16 || undefined }));
  assert.deepEqual(rankOf(items), { label: 'United Kingdom', rank: 17, of: 32 });
});

test('rankOf returns null when nothing is highlighted', () => {
  assert.equal(rankOf([{ label: 'a', value: 2 }, { label: 'b', value: 1 }]), null);
});

test('rankOf gives tied items the better rank, whatever the input order', () => {
  const items = [{ label: 'b', value: 5 }, { label: 'a', value: 9 }, { label: 'UK', value: 5, highlight: true }];
  assert.deepEqual(rankOf(items), { label: 'UK', rank: 2, of: 3 });
});

test('rankOf names no rank when several items are highlighted', () => {
  assert.equal(rankOf([{ label: 'a', value: 3, highlight: true }, { label: 'b', value: 2, highlight: true }, { label: 'c', value: 1 }]), null);
});
