# Approved-ZIP Meta conversions with unrestricted Route E intake

Verified October 28, 2026, approximately 8:48 AM America/New_York.

Production: https://a-wfencing.houzflow.com/e/

Initial verified deployment: https://aa99e312.client-a-w-fencing-quiz.pages.dev

Implementation commit: `3c840d3`.

## Released behavior

- Route E accepts all nonempty ZIP values and forwards them to the existing Make intake. Contact and consent requirements remain in place.
- Only an approved project ZIP authorizes browser Pixel Lead and server CAPI Lead events. ZIP+4 qualifies by its five-digit ZIP. Malformed and outside-area values never authorize Lead.
- The acceptance receipt signs the normalized ZIP and eligibility decision. CAPI rejects altered receipts, substituted ZIPs, and legacy unsigned-for-eligibility receipts. The browser uses the server decision.
- The build derives the server's 109 approved ZIPs from the existing public configuration. The same conversion rule applies to the shared quiz routes; Route D retains its existing ZIP-first submission gate.
- PageView, FunnelStep, attribution, deduplication IDs, and the thank-you experience remain enabled. HTML/config responses revalidate to pick up the new conversion logic.

## Fresh production API verification

Signed synthetic requests used the existing production Pages → Make → Houzflow ingestion chain. They return before database writes, routing, and notifications. Approved events used Meta Test Events, never ordinary production conversions.

| ZIP | Event ID | Intake | CAPI Lead result |
| --- | --- | --- | --- |
| 28031 | evt_awtest_zipmeta_1793191653438_0 | HTTP 200, accepted/test true | Meta events_received: 1 |
| 28031-1234 | evt_awtest_zipmeta_1793191654494_1 | HTTP 200, accepted/test true | Meta events_received: 1 |
| 90210 | evt_awtest_zipmeta_1793191655522_2 | HTTP 200, accepted/test true | Skipped, events_received: 0 |
| abcde | evt_awtest_zipmeta_1793191656280_3 | HTTP 200, accepted/test true | Skipped, events_received: 0 |

Changing either an unqualified receipt's eligibility or its event ZIP to an approved ZIP returned HTTP 403. An unsigned reserved synthetic intake ID also returned HTTP 403.

Supabase read-only verification found zero matching synthetic rows in `client_leads`, `client_lead_activity`, `client_lead_router_calls`, and `client_meta_event_outbox`.

## Make scenario and existing real-delivery evidence

Scenario `6584903` is active, valid, and reports zero incomplete executions. Its blueprint remained byte-for-byte equivalent as parsed JSON, with SHA-256 `a35993c3d4f1de8d5669b9614292054e81cd775a868d32044621c0d8e2beb2f0`. No scenario edits were needed: intake has no ZIP filter, and no separate Meta sending module exists.

The four new synthetic executions succeeded with three operations each: `080f0d3505794692ae37ea493a00993d`, `1fd6ac3a7a7a4f02be7198d9e733c1bf`, `ab10ed7fc1bf4bcbb40557a987ae4a68`, and `b0f54ec6eca84633a1b38756b7111adc`.

Resend, Sheets, and Slack latest execution IDs remained unchanged during the tests. Each reported status 1/success for existing real execution `031a707248df4261a5503e17e9064c48` at approximately 8:06 AM New York time. That run corresponds to an existing Route E CRM lead with ZIP 27295, outside the approved list. Another existing Route E lead with ZIP 27525 also persisted and has a successful six-operation Make run. This confirms current outside-area intake and notification processing without manufacturing a fresh real lead.

Fresh tests exercised the protected branch; persistence and notifications were not newly triggered. Existing provider/module success does not establish recipient opens or reads.

## Browser and local verification

- The deployed custom-domain HTML matched the released source and returned `Cache-Control: no-cache, must-revalidate`.
- At widths 390 and 1440, the deployed Route E UI accepted each ZIP above and reached thank-you without horizontal overflow. Intercepted intake/CAPI responses and a stubbed Pixel verified zero browser/server Lead calls for outside-area/text ZIPs and one matching-ID pair for approved ZIPs. These browser checks used mocks and sent no real conversion or lead.
- The deployed Route D UI still rejected outside-area ZIP 90210.
- `npm run check` passed all five tests, route generation, inline script syntax checks, and 26 configured asset references. Tests include all 109 approved ZIPs, ZIP+4, malformed values, receipt tampering, failed intake/retry, conversion failure, and production/test isolation.
- The unchanged receiving Worker's two focused `awLeadIntake` tests also passed.
- The local Windows workerd emulator failed to start after successfully compiling the bundle. Browser checks used a static local server and the deployed domain; deployed APIs were verified separately above.
