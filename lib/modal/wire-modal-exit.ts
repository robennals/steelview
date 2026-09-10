/**
 * The slice of `HTMLDialogElement` this module actually touches, so it can
 * be driven in a unit test by a plain object rather than a real `<dialog>`.
 */
export type ModalDialog = Pick<
  HTMLDialogElement,
  'open' | 'showModal' | 'addEventListener' | 'removeEventListener'
>;

/**
 * Opens `dialog` if it is not already open, and wires Escape (the `cancel`
 * event a `<dialog>` fires before it would otherwise close itself) to call
 * `leave` instead of closing natively.
 *
 * The whole point of this function being separate from the component that
 * calls it is idempotency: it must be safe to call, tear down and call again
 * on the same dialog without that churn ever invoking `leave`. React's
 * StrictMode does exactly that — mount, cleanup, mount — on every first
 * mount in development, and the modal this wires used to treat a `close`
 * *event* fired during that churn as the reader asking to leave, silently
 * navigating back to the topic page before the reader had touched anything.
 * `cancel` is prevented and never left to become a native `close`, so no DOM
 * event drives navigation — only an explicit call to `leave` from a real
 * user action does. See the regression test alongside this file for the
 * exact call sequence that broke it.
 *
 * Returns a cleanup that detaches only what this call attached; it does not
 * close the dialog, because a mount→cleanup→mount pair and a genuine unmount
 * are indistinguishable from in here.
 */
export function wireModalExit(dialog: ModalDialog, leave: () => void): () => void {
  const onCancel = (event: Event) => {
    event.preventDefault();
    leave();
  };

  dialog.addEventListener('cancel', onCancel);
  if (!dialog.open) dialog.showModal();

  return () => {
    dialog.removeEventListener('cancel', onCancel);
  };
}
