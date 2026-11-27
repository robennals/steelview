import { feedbackDeps } from '@/lib/feedback/deps';
import { commentRoute } from '@/lib/feedback/handlers';

export const { PATCH, DELETE } = commentRoute(feedbackDeps);
