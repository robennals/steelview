import { feedbackDeps } from '@/lib/feedback/deps';
import { viewpointSuggestionsRoute } from '@/lib/feedback/handlers';

export const { POST } = viewpointSuggestionsRoute(feedbackDeps);
