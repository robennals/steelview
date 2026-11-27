import { feedbackDeps } from '@/lib/feedback/deps';
import { suggestionRoute } from '@/lib/feedback/handlers';

export const { PATCH, DELETE } = suggestionRoute(feedbackDeps);
