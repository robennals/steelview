import { feedbackDeps } from '@/lib/feedback/deps';
import { viewpointSuggestionRoute } from '@/lib/feedback/handlers';

export const { POST } = viewpointSuggestionRoute(feedbackDeps);
