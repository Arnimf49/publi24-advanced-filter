# Instructions

Do the following in the loop:

1. Run npx tsx tests/nimfomane/mass-details-analyzer/showFlagged.ts {index}
2. Treat the flagged reason as an entry point, not a complete audit. Compare the entire extracted JSON with the source and identify every clear incorrect, unsupported, or missing extracted value that the extractor schema can represent.
3. Analyze every claim separately. A single flagged item can contain both valid and invalid claims, and recent extractor changes do not prove that all claims or all extracted fields are correct.
4. If the output includes "Recent changes on extractor code results in:", compare the diff with the source and extracted JSON. Skip only claims and fields that the diff demonstrably corrects; continue auditing and handling everything else.
   - **Mandatory diff gate:** Before classifying any claim or asking the user for approval, identify the exact extracted field(s) disputed by that claim and check the recent diff. If the diff changes the disputed field to a value supported by the source, mark that claim **already fixed** and stop handling it. Do not ask for approval, add or update a fixture, change extractor code, or create a test for that claim.
5. Distinguish the two kinds of unresolved claims explicitly:
     - An **extraction error** means the extractor assigned an incorrect value, omitted a source-supported value, or put a value in the wrong schema field. Add a regular `sampleN.txt` mock, add its corrected expected result to the normal `samples` array in the relevant unit file, and fix the extractor.
     - An **extraction false positive error** means the extractor produced details from text that is not talking about services or personal details at all. These are the only cases that use a `false-sampleN.txt` mock: the entire source must produce `null`, and the file must be added to the relevant false-sample loop. Fix the extractor so it stops extracting from that non-service/non-personal text.
     - Do not use a false sample for a service-related source that has valid extracted fields but one incorrect or over-inferred field. That remains an **extraction error** and uses a regular `sampleN.txt` fixture with the valid fields preserved.
     - A **flagger invalid claim** means the flagger's allegation is wrong and the current extraction is supported by the source. This needs no mock and no extractor change. Propose and, once accepted, apply a flagger fix (usually in flaggerPrompt.ts) that prevents the valid extraction from being flagged again.
6. For each unresolved claim that needs user confirmation, use the ask tool with exactly these four choices:
     1. **Approve proposed handling** — approve the handling described in the question.
     2. **[Alternative classification 1]** — the first of the other two classifications: extraction false positive error (false sample), extraction error (regular sample), or flagger invalid claim.
     3. **[Alternative classification 2]** — the second of the other two classifications.
     4. **Other** — the user must provide details; stop processing and wait for new user input.
   Replace the bracketed labels with the exact applicable classifications, and do not add, remove, or combine choices. For example, when proposing an extraction false positive error, choices 2 and 3 are **Normal extraction error** and **Flagger invalid claim**. When proposing an extraction error, they are **False-positive extraction error** and **Flagger invalid claim**. When proposing a flagger invalid claim, they are **False-positive extraction error** and **Normal extraction error**. Do not treat the entire item as valid or invalid when it contains mixed claims.
7. Once the user approves an unresolved extraction error or extraction false positive error, apply only the approved fixes.
     - For an **extraction error**, run `npx tsx tests/nimfomane/mass-details-analyzer/flaggedToMocks.ts {index} --kind {kind} --false-positive false`.
     - For an **extraction false positive error** involving non-service/non-personal text, run `npx tsx tests/nimfomane/mass-details-analyzer/flaggedToMocks.ts {index} --kind {kind} --false-positive true`.
     - The `--false-positive` boolean is about whether the entire source is a false extraction candidate: `false` creates a regular `sampleN.txt`; `true` creates a `false-sampleN.txt`. It does not mean that the flagger claim is invalid.
     Add regular extraction errors to the normal `samples` array; add extraction false positive errors to the false-sample loop in the respective unit test `extractPersonalDetails.unit.ts` or `extractServiceDetails.unit.ts`. Run
     the test and fix code until passes. Finally run the full suite of the specific unit file to ensure no regression.
     Unit tests never need global setup. Run the full unit file with the
     shortest dot reporter output:
     `SKIP_GLOBAL_SETUP=1 npx playwright test {unit-file} --project=nimfomane --workers=1 --reporter=dot`.
     When a regression appears, compare the changed extraction with the source
     before changing extractor code: if the source supports the new value, update
     the stale expected fixture; only change extractor code when the expectation
     is still supported and the extraction is actually incorrect.
8. If a confirmed extraction error is approved but another claim in the same item is a false-positive flagger claim, preserve the correct extraction behavior for the false-positive claim in the expected fixture; do not "fix" it in the extractor.
9. Repeat from step 1 increasing index until all are handled or the user asks to stop. Do not run the flagger to regenerate the queue unless the user explicitly asks.
10. Do not add a mock or unit-test case when the current extractor already handles the flagged case correctly, including when an approved fix from an earlier item already covers the same pattern. Add mocks and tests only for cases with a remaining confirmed extraction issue.

## Rules:

- Do not run the flagger again in any case. This costs money as it uses AI.
- Treat `op=true` as valid whenever `on=true`: the extractor intentionally assumes oral availability as a pair, even when the source only names unprotected oral. Do not create a fixture or extractor change for that distinction.
- Treat `sărutări pe gură` (kissing on the mouth) as French kissing (`fk`) for extraction auditing, including when it appears in a refusal list; do not flag `fk:false` for that wording.
