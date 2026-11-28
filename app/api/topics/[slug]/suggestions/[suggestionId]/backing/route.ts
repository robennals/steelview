import { feedbackDeps } from '@/lib/feedback/deps';
import { backingRoute } from '@/lib/feedback/handlers';

export const { PUT, DELETE } = backingRoute(feedbackDeps);
