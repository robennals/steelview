import { listTopicSlugs, loadTopic } from '@/lib/content/load';
import { viewpointWalkthrough } from '@/lib/content/walkthrough';

/** What a topic's feedback can be about: each viewpoint's card headings, in order, and its crux ids. */
export type FeedbackTargets = {
  viewpoints: Map<string, string[]>;
  cruxes: Set<string>;
};

const cache = new Map<string, Promise<FeedbackTargets | null>>();

/**
 * What feedback on the topic `slug` can be about, or null if there is no such
 * topic. Content only changes with a deploy, so each topic is read once.
 */
export function feedbackTargets(slug: string): Promise<FeedbackTargets | null> {
  let targets = cache.get(slug);
  if (!targets) {
    targets = read(slug);
    cache.set(slug, targets);
  }
  return targets;
}

async function read(slug: string): Promise<FeedbackTargets | null> {
  if (!(await listTopicSlugs()).includes(slug)) return null;
  const topic = await loadTopic(slug);
  return {
    viewpoints: new Map(topic.viewpoints.map(v => [v.id, viewpointWalkthrough(topic, v).steps.map(step => step.heading)])),
    cruxes: new Set(topic.cruxes.map(c => c.id)),
  };
}
