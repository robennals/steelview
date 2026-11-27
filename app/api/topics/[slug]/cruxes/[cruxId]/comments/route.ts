import { feedbackDeps } from '@/lib/feedback/deps';
import { cruxCommentsRoute } from '@/lib/feedback/handlers';

export const { POST } = cruxCommentsRoute(feedbackDeps);
