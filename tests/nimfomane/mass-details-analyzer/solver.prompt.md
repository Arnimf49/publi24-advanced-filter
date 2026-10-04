# Instructions

Do the following in the loop:

1. Run npx tsx tests/nimfomane/mass-details-analyzer/showFlagged.ts {index}
2. Treat the flagged reason as an entry point, not a complete audit. Compare the entire extracted JSON with the source and identify every clear incorrect, unsupported, or missing extracted value that the extractor schema can represent.
3. Analyze every claim separately. A single flagged item can contain both valid and invalid claims, and recent extractor changes do not prove that all claims or all extracted fields are correct.
4. If the output includes "Recent changes on extractor code results in:", compare the diff with the source and extracted JSON. Skip only claims and fields that the diff demonstrably corrects; continue auditing and handling everything else.
   - **Mandatory diff gate:** Before classifying any claim or asking the user for approval, identify the exact extracted field(s) disputed by that claim and check the recent diff. If the diff changes the disputed field to a value supported by the source, mark that claim **already fixed** and stop handling it. Do not ask for approval, add or update a fixture, change extractor code, or create a test for that claim.
5. Distinguish the two kinds of unresolved claims explicitly:
   - A **false-positive flagger claim** means the flagger says the extraction is wrong, but the extracted value is actually correct and supported by the source. For each false-positive flagger claim, do not add an extractor fixture or change extractor code. Propose and, once accepted, apply a flagger fix (usually in flaggerPrompt.ts) that prevents the correct extraction from being flagged again.
   - A **confirmed extraction error** means the flagger correctly identified a value that contradicts, misreads, or incorrectly assigns source text. This is a real issue. Do not fix it by changing the flagger prompt to suppress the finding.
6. For each unresolved confirmed extraction error, confirm with the user that it is a valid issue that needs to be handled. Do not treat the entire item as valid or invalid when it contains mixed claims.
7. Once the user approves an unresolved confirmed extraction error, apply only the approved fixes.
   - For valid claims run `npx tsx tests/nimfomane/mass-details-analyzer/flaggedToMocks.ts {index} --kind {kind} --false-positive {false|true}`
     and add to respective unit test `extractPersonalDetails.unit.ts` or `extractServiceDetails.unit.ts`. Run
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
