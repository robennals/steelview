# Source files

**Our copies of the data files that sources cite are in a git-ignored
`datasets/` folder in the main checkout on Rob's machine.** Use them to check a
figure or quote against the original without searching for it. They are not in
this repo, and they must never be committed: the repo is public and we don't
hold the rights to many of these files.

## Finding a file

Run this from any checkout or worktree to get the folder's path:

```bash
echo "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/datasets"
```

Two fields in a fact's frontmatter connect a source to its file. Readers never
see either of them.

- **`localFile`** is the path of our copy, relative to the main checkout, such
  as `datasets/ons.gov.uk/uk1.zip`.
- **`fileUrl`** is the exact file or query the copy came from.

To check a source, read `localFile` first. If it is missing, as it will be on
any other machine, use `fileUrl`. Searching `content/topics` for a `localFile`
shows every source that relies on that file.

## Adding a file

1. Save the exact file or query you read to `datasets/<host>/<filename>`, where
   `<host>` is the address it came from, without `www.`. Name the file after the
   original, adding just enough to tell it apart from its neighbours.
2. Set `fileUrl` and `localFile` on the source.
3. Point the source's `url` at the publisher's page. The build rejects a `url`
   that is a data file, and [`AUTHORING.md`](AUTHORING.md#what-needs-a-source)
   gives the rule.

PDFs that open in the browser don't need a copy, because they can simply be the
`url`.

## Limits of these copies

- **They can be newer than a quote.** Most were downloaded on 30 October 2026
  from `fileUrl`, not when the citation was written. The small boats time series
  is the 30 October edition, saved from the 23 October address. Nothing compares
  the copies with the quotes.
- **One came from an archive.** The OBR spreadsheet is an Internet Archive copy,
  because obr.uk refuses automated downloads.
- **Nothing checks them automatically.** They exist on one machine, so CI cannot
  confirm that a `localFile` exists, and there is no backup.
