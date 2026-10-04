# Mass details analyzer

Run the extractor from the repository root:

```sh
npx tsx tests/nimfomane/mass-details-analyzer/extractor.ts
```

Configure `PROXY_SERVERS` (and optional `PROXY_USERNAME` / `PROXY_PASSWORD`) in
the repository `.env`; workers rotate through the configured proxies. The
default concurrency is twice the available CPU count.

To limit extraction to one profile:

```sh
npx tsx tests/nimfomane/mass-details-analyzer/extractor.ts --max-profiles 1
```

Each profile is saved as `output/<sanitized-name>-<stable-id>.json`; reruns
overwrite the same profile file. Sources without extracted details are omitted.

Set `OPENAI_API_KEY` in `.env` and run the flagger to check each extracted source
with a separate `gpt-5.6-luna` request using low reasoning effort:

```sh
npx tsx tests/nimfomane/mass-details-analyzer/flagger.ts
```

Each request sends one profile's name and URL plus one complete source object,
including its text and extracted values, to OpenAI.

Flagged source references and reasons are written to
`output/flagged-extractions.json`, replacing the previous result. All analysis
results are cached in `output/flagger-cache.json`; a cached result is reused
when the source text and extracted personal/service details have not changed.
Source references use a stable ID derived from the source kind and URL, so they
do not depend on source ordering. Use `--no-cache` to delete the cache before
running the normal flagger command again:

```sh
npx tsx tests/nimfomane/mass-details-analyzer/flagger.ts --no-cache
npx tsx tests/nimfomane/mass-details-analyzer/flagger.ts
```

The cache-clearing command does not modify `output/flagged-extractions.json`.

Each flagged item identifies its profile file, stable `sourceId`, and the
zero-based `sourceIndex` within that file's `sources` array.

To print one flagged source by its zero-based index in the flagged result:

```sh
npx tsx tests/nimfomane/mass-details-analyzer/showFlagged.ts 0
```

To copy a flagged source into the appropriate extractor mock directory, provide
its index, mock kind, and whether it is a false positive. The script chooses the
next available `sampleN.txt` or `false-sampleN.txt` name and prints that name:

```sh
npx tsx tests/nimfomane/mass-details-analyzer/flaggedToMocks.ts 0 --kind service --false-positive false
```
