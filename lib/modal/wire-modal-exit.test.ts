import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wireModalExit, type ModalDialog } from './wire-modal-exit';

/**
 * A dialog that is just enough of `HTMLDialogElement` to drive
 * `wireModalExit` without a browser: an `open` flag `showModal` sets, and a
 * real listener registry so `cancel` can actually be dispatched.
 */
function fakeDialog(): ModalDialog & { dispatch(type: string): void } {
  let open = false;
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
  return {
    get open() {
      return open;
    },
    showModal() {
      open = true;
    },
    addEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
      if (listener === null) return;
      const set = listeners.get(type) ?? new Set();
      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
      if (listener === null) return;
      listeners.get(type)?.delete(listener);
    },
    dispatch(type: string) {
      // A real, cancelable Event, so `preventDefault` behaves as it does in a browser.
      const event = new Event(type, { cancelable: true });
      for (const listener of listeners.get(type) ?? []) {
        if (typeof listener === 'function') listener(event);
        else listener.handleEvent(event);
      }
    },
  };
}

// The regression: React's StrictMode mounts an effect, cleans it up, and
// mounts it again on every first mount in development. The old
// implementation listened for the dialog's native `close` event to call
// `leave`, and that churn used to fire one, silently navigating the reader
// back to the topic page before they had touched anything.
test('mounting, cleaning up and mounting again does not call leave', () => {
  const dialog = fakeDialog();
  let leaveCalls = 0;
  const leave = () => {
    leaveCalls += 1;
  };

  const cleanupFromFirstMount = wireModalExit(dialog, leave);
  cleanupFromFirstMount();
  const cleanupFromSecondMount = wireModalExit(dialog, leave);

  assert.equal(leaveCalls, 0, 'mount -> cleanup -> mount must not navigate');
  assert.equal(dialog.open, true, 'the dialog should still be open after the churn');

  cleanupFromSecondMount();
});

test('the dialog opens on the first call and stays open on a second', () => {
  const dialog = fakeDialog();
  assert.equal(dialog.open, false);

  wireModalExit(dialog, () => {});
  assert.equal(dialog.open, true);

  // Idempotent: calling again while already open must not throw or re-invoke
  // showModal in a way that would matter — it simply stays open.
  wireModalExit(dialog, () => {});
  assert.equal(dialog.open, true);
});

test('Escape (the dialog cancel event) calls leave exactly once', () => {
  const dialog = fakeDialog();
  let leaveCalls = 0;
  wireModalExit(dialog, () => {
    leaveCalls += 1;
  });

  dialog.dispatch('cancel');
  assert.equal(leaveCalls, 1);
});

test('after cleanup, a cancel event no longer calls leave', () => {
  const dialog = fakeDialog();
  let leaveCalls = 0;
  const cleanup = wireModalExit(dialog, () => {
    leaveCalls += 1;
  });

  cleanup();
  dialog.dispatch('cancel');
  assert.equal(leaveCalls, 0);
});
