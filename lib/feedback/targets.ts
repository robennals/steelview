import { listTopicSlugs, loadTopic } from '@/lib/content/load';
import { viewpointWalkthrough } from '@/lib/content/walkthrough';

/** What a topic's feedback can be about: its title, each viewpoint's name and card headings in order, and each crux's title. */
export type FeedbackTargets = {
  title: string;
  viewpoints: Map<string, { name: string; headings: string[] }>;
  cruxes: Map<string, string>;
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
    title: topic.title,
    viewpoints: new Map(topic.viewpoints.map(v => [v.id, { name: v.name, headings: viewpointWalkthrough(topic, v).steps.map(step => step.heading) }])),
    cruxes: new Map(topic.cruxes.map(c => [c.id, c.title])),
  };
}
