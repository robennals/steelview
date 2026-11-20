import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL, SOURCE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How Steelview is made',
  description: 'How a person and an AI research, write and check each Steelview report together.',
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
          Every Steelview report is made by a person and an AI working together. The person decides what to
          cover, judges whether each side has been treated fairly, and approves everything before it is
          published. The AI does more research, analysis and checking than a person could do alone: reading the primary sources, gathering every relevant data series, and verifying each figure
          against the source it came from.
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
            <strong>The AI outlines how each side argues it</strong>, and the person corrects the outline until
            every major viewpoint is there and each is put the way its own holders would put it.
          </li>
          <li>
            <strong>The AI finds the evidence</strong> each argument depends on, from official statistics,
            courts, academic studies and other primary sources, along with the context needed to judge it
            fairly: the longer run, comparable countries, the base rate.
          </li>
          <li>
            <strong>The AI builds the data reports</strong>, quoting the source for every figure, and the person
            reviews them.
          </li>
          <li>
            <strong>The two write the viewpoints together</strong>, each resting on what the evidence actually
            shows, and each admitting the facts that cut against it.
          </li>
          <li>
            <strong>The person approves publication</strong> once the automated checks below pass.
          </li>
        </ol>

        <h2>The checks every report passes</h2>
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
            <strong>Every viewpoint admits what cuts against it.</strong> Each must acknowledge at least one
            well-established fact that is inconvenient for it.
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
