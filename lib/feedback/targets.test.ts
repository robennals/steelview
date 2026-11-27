import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTopic } from '@/lib/content/load';
import { viewpointWalkthrough } from '@/lib/content/walkthrough';
import { feedbackTargets } from './targets';

const TOPIC = 'uk-immigration';

test('a topic that does not exist has no targets', async () => {
  assert.equal(await feedbackTargets('no-such-topic'), null);
});

test('a topic’s targets are its title, each viewpoint’s name and card headings in order, and each crux’s title', async () => {
  const topic = await loadTopic(TOPIC);
  const targets = await feedbackTargets(TOPIC);
  assert.ok(targets);
  assert.equal(targets.title, topic.title);
  assert.deepEqual(
    [...targets.viewpoints],
    topic.viewpoints.map(v => [v.id, { name: v.name, headings: viewpointWalkthrough(topic, v).steps.map(step => step.heading) }]),
  );
  assert.ok([...targets.viewpoints.values()].every(v => v.headings.length > 0), 'every viewpoint has cards to suggest against');
  assert.deepEqual([...targets.cruxes], topic.cruxes.map(c => [c.id, c.title]));
});

test('each topic is read once', async () => {
  assert.equal(feedbackTargets(TOPIC), feedbackTargets(TOPIC));
});
