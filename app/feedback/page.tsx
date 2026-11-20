import type { Metadata } from 'next';
import Link from 'next/link';
import { FeedbackForm } from '@/components/feedback/feedback-form';

export const metadata: Metadata = {
  title: 'Feedback',
  description: 'Tell Steelview about a mistake, a missing viewpoint, or anything else.',
  alternates: { canonical: '/feedback' },
};

export default function FeedbackPage() {
  return (
    <main className="sv-wrap">
      <header className="sv-pagehead">
        <h1 className="sv-title">Feedback</h1>
      </header>
      <div className="prose-body">
        <p>
          Please write if you think a report gets something wrong, leaves out a viewpoint, or states one
          unfairly — or if anything was unclear, or there is a topic you would like Steelview to cover. Your
          message goes straight to Rob Ennals, who makes the site, and a copy comes back to you.
        </p>
        <p>
          If it is about a particular report, saying which part helps. Your details are used only to reply; see
          the <Link href="/privacy">privacy policy</Link>.
        </p>
        <FeedbackForm />
      </div>
    </main>
  );
}
