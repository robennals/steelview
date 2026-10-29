'use client';

import type { ReactNode } from 'react';

/**
 * The two reader controls every interactive component uses, so a reader who
 * has learnt to slice one chart has learnt to slice them all.
 *
 * Both are rows of real `<button aria-pressed>`s inside a labelled group:
 * keyboard and screen-reader behaviour come from the platform, and the
 * pressed state is visible without relying on colour (it inverts to ink on
 * paper).
 */

export type Choice<T extends string> = { value: T; label: ReactNode };

/** Pick exactly one: "Break down by", "Show as", "Year". */
export function ChoiceGroup<T extends string>({
  label,
  choices,
  value,
  onChange,
  hideLabel = false,
}: {
  label: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  hideLabel?: boolean;
}) {
  return (
    <div className="sv-control" role="group" aria-label={label}>
      {!hideLabel && <span className="sv-control__label" aria-hidden="true">{label}</span>}
      <div className="sv-control__options">
        {choices.map(choice => (
          <button
            key={choice.value}
            type="button"
            className="sv-control__option"
            aria-pressed={choice.value === value}
            onClick={() => onChange(choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Pick any number: categories on a timeline, positions in a quote browser.
 * Nothing selected means everything shown — an empty filter that hides every
 * item is a dead end, not a view.
 */
export function FilterChips<T extends string>({
  label,
  choices,
  selected,
  onChange,
  hideLabel = false,
}: {
  label: string;
  choices: Array<Choice<T> & { count?: number; color?: string }>;
  selected: ReadonlySet<T>;
  onChange: (selected: Set<T>) => void;
  hideLabel?: boolean;
}) {
  const toggle = (value: T) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };
  return (
    <div className="sv-control" role="group" aria-label={label}>
      {!hideLabel && <span className="sv-control__label" aria-hidden="true">{label}</span>}
      <div className="sv-control__options" data-kind="chips">
        {choices.map(choice => (
          <button
            key={choice.value}
            type="button"
            className="sv-control__chip"
            aria-pressed={selected.has(choice.value)}
            onClick={() => toggle(choice.value)}
          >
            {choice.color && <i className="sv-control__swatch" style={{ background: choice.color }} aria-hidden="true" />}
            {choice.label}
            {choice.count !== undefined && <span className="sv-control__count">{choice.count}</span>}
          </button>
        ))}
        {selected.size > 0 && (
          <button type="button" className="sv-control__clear" onClick={() => onChange(new Set())}>
            Show all
          </button>
        )}
      </div>
    </div>
  );
}
