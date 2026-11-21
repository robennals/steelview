'use client';

import { useCallback, useId, useState } from 'react';
import { InfoSheet } from '@/components/topic/info-sheet';
import { useFeedback } from './feedback-context';
import { PostGate, useDraft } from './post-gate';

/**
 * The last row of the Viewpoints list: a way to suggest a view the page is
 * missing. It is usually not needed, since the view a reader holds is usually
 * already there to strengthen, so it sits quietly after the rest.
 */
export function SuggestViewpoint() {
  // The button that opened the sheet, which gets focus back when it closes; null while closed.
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setTrigger(null), []);
  return (
    <>
      <button type="button" className="sv-suggest-row" onClick={event => setTrigger(event.currentTarget)}>
        <span className="sv-suggest-row__title"><span aria-hidden="true">+</span> Suggest a viewpoint</span>
        <span className="sv-suggest-row__note">A view this page is missing</span>
      </button>
      {trigger && <SuggestViewpointSheet trigger={trigger} onClose={close} />}
    </>
  );
}

function SuggestViewpointSheet({ trigger, onClose }: { trigger: HTMLElement | null; onClose: () => void }) {
  const id = useId();
  const { slug, write } = useFeedback();
  const [title, setTitle] = useDraft(`${slug}/viewpoint/title`);
  const [steps, setSteps] = useDraft(`${slug}/viewpoint/steps`);
  const [holders, setHolders] = useDraft(`${slug}/viewpoint/holders`);
  const [sent, setSent] = useState(false);

  const post = async () => {
    const result = await write('POST', 'viewpoint-suggestions', { title, steps, holders });
    if (result.ok) {
      setTitle('');
      setSteps('');
      setHolders('');
      setSent(true);
    }
    return result;
  };

  return (
    <InfoSheet eyebrow="Suggest a viewpoint" labelledBy={`${id}-title`} trigger={trigger} onClose={onClose}>
      <div className="sv-feedback-sheet">
        <h2 id={`${id}-title`} className="sv-feedback-sheet__title">Suggest a viewpoint this page is missing</h2>
        <p className="sv-feedback-sheet__rule">
          Check first that it isn’t already here under another name: if it is, strengthen that one instead.
          Write it as someone who holds it would put it.
        </p>
        {sent ? (
          <p className="sv-compose__note" role="status">Thank you. An editor will read it, and add the viewpoint or say why not.</p>
        ) : (
          <div className="sv-compose sv-compose--fields">
            <label htmlFor={`${id}-name`}>The view, in one line</label>
            <input id={`${id}-name`} className="sv-compose__text" maxLength={300} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="A sentence someone would actually say" />
            <label htmlFor={`${id}-steps`}>Its argument, one step per line</label>
            <textarea id={`${id}-steps`} className="sv-compose__text" rows={5} value={steps} onChange={e => setSteps(e.target.value)}
              placeholder={'What is happening, and why it matters\nWhat causes it\nSo what should be done'} />
            <label htmlFor={`${id}-holders`}>Who holds it <span className="sv-compose__optional">optional</span></label>
            <input id={`${id}-holders`} className="sv-compose__text" maxLength={300} value={holders} onChange={e => setHolders(e.target.value)}
              placeholder="A party, a group, a writer or a campaign that argues it" />
            <PostGate label="Suggest" ready={!!title.trim() && !!steps.trim()} onPost={post} />
          </div>
        )}
      </div>
    </InfoSheet>
  );
}
