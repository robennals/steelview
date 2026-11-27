import { feedbackDeps } from '@/lib/feedback/deps';
import { usefulRoute } from '@/lib/feedback/handlers';

export const { PUT, DELETE } = usefulRoute(feedbackDeps);
