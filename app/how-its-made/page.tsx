import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL, SOURCE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How Steelview is made',
  description: 'How each Steelview report is made: a person writes the viewpoints, and an AI finds the evidence and checks them.',
  alternates: { canonical: '/how-its-made' },
};

// Follows content/WORKFLOW.md (the stages) and the checks in the README; keep
// it in step with them when either changes.
export default function HowItsMadePage() {
  return (
    <main className="sv-wrap">
      <header className="sv-pagehead">
        <h1 className="sv-title">How Steelview is made</h1>
      </header>
      <div className="prose-body">
        <p>
          Every Steelview report is made by a person and an AI working together. The person chooses what to
          cover, writes every viewpoint, and approves everything before it is published. The AI does more
          research, analysis and checking than a person could do alone: reading the primary sources, gathering
          every relevant data series, verifying each figure against the source it came from, and checking that
          each viewpoint is a strong and faithful version of what its holders actually argue.
        </p>
        <p>
          Steelview is partly an experiment in how far that partnership can go. With AI doing the legwork, a
          report can go further into the data than has been practical for journalists in the past — showing a
          trend over its full history rather than a convenient window, setting a country beside every
          comparable country rather than a chosen few, and giving the context that stops a true number from
          misleading.
        </p>

        <h2>How a report is put together</h2>
        <ol>
          <li>
            <strong>A person chooses the topic</strong> and sets its limits: the decision people are actually
            fighting over, and what is deliberately left out.
          </li>
          <li>
            <strong>The person writes the viewpoints</strong>, one for each major side, each put the way its own
            holders would put it.
          </li>
          <li>
            <strong>The AI finds the evidence</strong> each viewpoint depends on, from official statistics,
            courts, academic studies and other primary sources, along with the context needed to judge it
            fairly: the longer run, comparable countries, the base rate.
          </li>
          <li>
            <strong>The AI builds the data reports</strong>, quoting the source for every figure, and the person
            reviews them.
          </li>
          <li>
            <strong>The AI checks each viewpoint</strong>: that the evidence backs up what it claims, that it
            admits the facts that cut against it, and that it is as strong a version of the argument as its
            holders make. The person revises it in response.
          </li>
          <li>
            <strong>The person approves publication</strong> once the report meets every rule below.
          </li>
        </ol>
        <p>
          <strong>A note on today’s reports.</strong> The viewpoints on the site now were drafted by AI while
          Steelview was being built. Each is being replaced with a human-written version, and this note will
          come down when they all have been.
        </p>

        <h2>The rules every report follows</h2>
        <ul>
          <li>
            <strong>Every fact has a quoted source.</strong> Nothing is presented as a fact without a quote from
            a source you can go and read.
          </li>
          <li>
            <strong>Every figure in the text is checked against those quotes.</strong> An automated audit finds
            every sum of money, percentage and large number written in a report, and the report cannot be
            published unless each one appears in a quoted source.
          </li>
          <li>
            <strong>Disputed evidence is labelled as disputed.</strong> A fact marked contested must cite
            sources on both sides of the dispute.
          </li>
          <li>
            <strong>Every viewpoint admits what cuts against it.</strong> Each one sets out the strongest
            evidence against its own case, and says why it still holds.
          </li>
          <li>
            <strong>No one decides which facts come first.</strong> The order is worked out from what every
            viewpoint relies on, taking turns between them, so no single side’s evidence leads the page.
          </li>
        </ul>

        <h2>Where it can still go wrong</h2>
        <p>
          AI makes mistakes, and so do people. The checks above exist so that mistakes are caught, and the
          sources are shown so that you can catch the ones that slip through. If you find one, please tell us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The full writing guide, the source of every
          report and the history of every change are <a href={SOURCE_URL}>public on GitHub</a>.
        </p>
        <p>
          <Link href="/about">About Steelview</Link>
        </p>
      </div>
    </main>
  );
}
