<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Source data files

Copies of the data files behind our sources are in a git-ignored `datasets/` folder in the main checkout, not in this repo. Never commit one. `content/SOURCE-FILES.md` explains how to find and add them.

# Turn corrections into workflow fixes

When Rob gives directions for improving a particular topic, report, viewpoint
or chart, fix the thing in front of you, and also ask whether the correction
reveals a general mistake. If it does, the long-term fix belongs in the
workflow docs — [`content/WORKFLOW.md`](content/WORKFLOW.md) for the process,
[`content/AUTHORING.md`](content/AUTHORING.md) for what finished content must
look like — so the next topic gets it right without Rob having to ask again.

- **Keep a running list.** Note each correction that looks general, and the
  rule that would have prevented it.
- **Consult before editing the docs.** At a natural pause, propose the
  specific wording and where it would go, and say which corrections it covers.
  Rob decides what goes in; don't edit the workflow docs on your own.
- **Say when it's a one-off.** If a correction is specific to this topic, say
  so rather than turning it into a rule.
- **Check the docs first.** If the mistake breaks a rule the docs already
  state, the fix is to follow the rule, and perhaps make it easier to find —
  not to add a second copy.
