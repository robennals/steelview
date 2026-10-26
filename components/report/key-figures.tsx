import type { ReactNode } from 'react';
import { ReportFigure } from './figure';
import { formatDate, formatValue } from './format';
import type { PartialDate, SourceCredit, ValueFormat } from './types';

export type KeyFigureChange = {
  value: number;
  /** Defaults to a signed percentage. Use `{ unit: 'number', signed: true }` plus a "percentage points" comparison for changes in a rate. */
  format?: ValueFormat;
  /** What the change is against, completing the phrase: "on year ending March 2025". */
  comparison: string;
};

export type KeyFigure = {
  value: number;
  format?: ValueFormat;
  /** What the number is, in plain words: "people awaiting an initial asylum decision". */
  label: string;
  /** The period or date the figure is for — always shown, because a headline number without a date is the commonest way to mislead with a true one. */
  period: PartialDate;
  /** Overrides the formatted period, e.g. "year ending March 2026". */
  periodLabel?: string;
  change?: KeyFigureChange;
  source?: SourceCredit;
};

export type KeyFiguresProps = {
  figures: KeyFigure[];
  id?: string;
  title?: string;
  description?: ReactNode;
  sources?: SourceCredit[];
  note?: ReactNode;
};

/**
 * Two to four headline numbers set as type: a large serif figure, what it
 * counts, when, and — if given — the change against a named comparison.
 * No boxes and no up/down colours: a fall in asylum grants is not good or
 * bad news in this register, so direction is carried by the sign and the
 * words, never by green and red.
 */
export function KeyFigures({ figures, id, title, description, sources, note }: KeyFiguresProps) {
  return (
    <ReportFigure id={id} title={title} description={description} sources={sources} note={note} className="sv-key-figures">
      <div className="sv-key-figures__frame">
        <dl className="sv-key-figures__list" data-count={figures.length}>
          {figures.map((figure, i) => (
            <div key={`${figure.label}-${i}`} className="sv-key-figures__item">
              <dt className="sv-key-figures__label">{figure.label}</dt>
              <dd className="sv-key-figures__value">{formatValue(figure.value, figure.format)}</dd>
              <dd className="sv-key-figures__meta">
                <span className="sv-key-figures__period">{figure.periodLabel ?? formatDate(figure.period)}</span>
                {figure.source && (
                  <>
                    {' '}
                    <SourceMark source={figure.source} />
                  </>
                )}
              </dd>
              {figure.change && (
                <dd className="sv-key-figures__change">
                  {formatValue(figure.change.value, figure.change.format ?? { unit: 'percent', decimals: 0, signed: true })}{' '}
                  {figure.change.comparison}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </ReportFigure>
  );
}

function SourceMark({ source }: { source: SourceCredit }) {
  const text = source.number ? `[${source.number}]` : source.label;
  return source.href ? (
    <a className="sv-key-figures__source" href={source.href} aria-label={`Source: ${source.label}${source.number ? ` [${source.number}]` : ''}`}>
      {text}
    </a>
  ) : (
    <span className="sv-key-figures__source">{text}</span>
  );
}
