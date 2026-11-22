import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardText, joinViewpoint, linkify, passageHash, splitPassages, unlinkify, viewpointLinksSchema } from './viewpoint-links';

test('unlinkify and linkify round-trip a passage, counting which appearance of a phrase is cited', () => {
  const linked = 'ID is common. [ID](#fact-a/x) laws vary, and [laws vary](#fact-a/y) widely.';
  const { text, citations } = unlinkify(linked);
  assert.equal(text, 'ID is common. ID laws vary, and laws vary widely.');
  assert.deepEqual(citations, [
    { phrase: 'ID', href: '#fact-a/x', occurrence: 2 },
    { phrase: 'laws vary', href: '#fact-a/y', occurrence: 2 },
  ]);
  assert.deepEqual(linkify(text, citations), { linked, errors: [] });
});

test('a citation whose phrase the text no longer holds renders as plain prose and is reported', () => {
  const { linked, errors } = linkify('The rolls were cleaned.', [{ phrase: 'rolls are stale', href: '#fact-a/x' }]);
  assert.equal(linked, 'The rolls were cleaned.');
  assert.deepEqual(errors, ['cites "rolls are stale", which the text does not contain']);
});

test('overlapping citations are reported, not nested', () => {
  const { errors } = linkify('one two three', [
    { phrase: 'one two', href: '#fact-a/x' },
    { phrase: 'two three', href: '#fact-a/y' },
  ]);
  assert.deepEqual(errors, ['cites "two three", which overlaps another citation']);
});

test('splitPassages keeps every character, so joining rebuilds the body', () => {
  const body = 'Lead.\n\n### First\n\nOne.\n\n### Second\nTwo.';
  const passages = splitPassages(body);
  assert.equal(passages.lead, 'Lead.\n\n');
  assert.deepEqual(passages.cards.map((c) => c.heading), ['First', 'Second']);
  const { body: joined } = joinViewpoint(body, 'Summary.', viewpointLinksSchema.parse({ cards: [{ heading: 'First' }, { heading: 'Second' }] }));
  assert.equal(joined, body);
});

test('a passage is verified only for the text it was checked on', () => {
  const body = 'Lead.\n\n### First\n\nOne in eight records is out of date.';
  const card = splitPassages(body).cards[0];
  const links = viewpointLinksSchema.parse({
    summary: { verification: { status: 'verified', textHash: passageHash('Summary.') } },
    lead: { verification: { status: 'verified', textHash: passageHash('Lead.') } },
    cards: [{ heading: 'First', citations: [{ phrase: 'One in eight', href: '#fact-a/x' }], verification: { status: 'verified', textHash: passageHash(cardText(card)) } }],
  });
  const checked = joinViewpoint(body, 'Summary.', links);
  assert.deepEqual(checked.unverified, []);
  assert.equal(checked.body, 'Lead.\n\n### First\n\n[One in eight](#fact-a/x) records is out of date.');

  const edited = joinViewpoint(body.replace('out of date', 'wrong'), 'Summary.', links);
  assert.deepEqual(edited.unverified, ['card "First" has changed since it was checked against its evidence']);
});

test('cards and links-file entries that do not match by heading are reported', () => {
  const links = viewpointLinksSchema.parse({ cards: [{ heading: 'Old heading' }] });
  const { linkErrors } = joinViewpoint('Lead.\n\n### New heading\n\nText.', 'Summary.', links);
  assert.deepEqual(linkErrors, [
    'card "New heading" has no entry in the links file',
    'the links file has an entry for "Old heading", which is no card\'s heading',
  ]);
});
