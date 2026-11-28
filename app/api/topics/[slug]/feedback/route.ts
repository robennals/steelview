import { feedbackDeps } from '@/lib/feedback/deps';
import { topicFeedbackRoute } from '@/lib/feedback/handlers';

export const { GET } = topicFeedbackRoute(feedbackDeps);
