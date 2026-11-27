import { feedbackDeps } from '@/lib/feedback/deps';
import { accountNameRoute } from '@/lib/feedback/handlers';

export const { PUT } = accountNameRoute(feedbackDeps);
