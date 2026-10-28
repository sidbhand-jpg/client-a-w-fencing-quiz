# A & W Fencing Quiz Funnel

A config-driven, mobile-first estimate funnel for [A & W Fencing](https://www.a-wfencing.com/), deployed on Cloudflare Pages at [a-wfencing.houzflow.com](https://a-wfencing.houzflow.com/).

## Included capabilities

- Five route-controlled funnel experiences: `/a`, `/b`, `/c`, ZIP-first `/d`, and contact-ZIP `/e`
- Microsoft Clarity recordings, custom events, tags, and funnel-ready steps
- Hash-based step URLs for browser navigation and drop-off analysis
- Meta Pixel browser events with a unique deduplication event ID
- Meta Conversions API-ready server payload
- UTM, Meta click ID, `_fbp`, and `_fbc` attribution capture
- Required contact consent
- Config-driven business copy, colors, assets, questions, proof, tracking IDs, and integrations
- Confirmed same-origin lead handoff to the server-configured Make webhook

## Funnel variants

Variant behavior lives in `public/config.js` under `CONFIG.variants`.

| Route       | Experience                                            | Intended test               |
| ----------- | ----------------------------------------------------- | --------------------------- |
| `/a`        | Lander followed by gallery and review/proof sections  | Information-rich experience |
| `/b` or `/` | Lander only, with no information below the first fold | Focused landing experience  |
| `/c`        | Opens directly on question one                        | Lowest-friction experience  |
| `/d`        | ZIP check, project type, fence type, then lead form | Short qualified-lead path |
| `/e`        | Project type, fence type, then contact details and ZIP | Short contact-detail path |

Routes A-C use the original five questions. Route D retains its ZIP-first service-area check, asks only whether the project is a new fence or repair/replacement, asks the fence type, and then opens the lead form. Route E is the active ad destination; it collects a ZIP without format or service-area restrictions. ZIP remains a required project-detail field in the browser. Variant C intentionally omits the Back button on question one because it has no initial lander.

## Project structure

```text
public/
  index.html          Shared funnel runtime
  config.js           Client, variants, content, and tracking configuration
  assets/             Local logo and fencing imagery
functions/api/
  capi.js              Same-origin PageView, FunnelStep, and Lead sender
  lead.js              Confirmed Make ingestion proxy
scripts/
  build-pages.mjs     Builds root plus /a, /b, /c, /d, and /e route entries
  check-site.mjs      Validates routes, assets, config, and tracking hooks
.env                  Local secrets only; ignored by Git
.env.example          Safe credential placeholders
dist/                 Generated Cloudflare Pages output; ignored by Git
```

`public/index.html` is shared by every variant. Make routine client changes in `public/config.js` rather than duplicating pages.

## Local development

```bash
npm install
npm run check
npm run dev
```

Wrangler prints the local preview URL. Test all five routes:

- `http://localhost:8788/a`
- `http://localhost:8788/b`
- `http://localhost:8788/c`
- `http://localhost:8788/d`
- `http://localhost:8788/e`

VS Code Live Preview can also open `public/index.html`. The page includes a nested-path fallback for `public/config.js` and resolves local image URLs relative to that config file.

## Configuration

The main settings are in `public/config.js`:

```js
variants: {
  a: { name: "Lander + proof", showLander: true, showProof: true },
  b: { name: "Lander only", showLander: true, showProof: false },
  c: { name: "Direct to questions", showLander: false, showProof: false },
  d: {
    name: "ZIP-first short form",
    showLander: false,
    showProof: false,
    zipFirst: true,
    questionIds: ["project_type", "fence_type"]
  }
},

zipVerification: {
  allowedZipCodes: "28031, 28035, 28036"
},

clarityId: "ydufwdgd3z",
metaPixelId: "",

tracking: {
  eventPrefix: "quiz",
  metaFunnelStepEvent: "FunnelStep",
  metaLeadEvent: "Lead"
},

leadEndpoint: "/api/lead"
```

The Clarity project ID and Meta Pixel ID are public browser configuration. API access tokens are secrets and must never be added to `public/config.js`, `public/index.html`, or any file published in `dist/`.

## Local secrets

The local `.env` file is ignored by Git and by the Pages build. Store server-side credentials there during local administration:

```javascript
CLARITY_API_TOKEN=
META_CAPI_ACCESS_TOKEN=
META_PIXEL_ID=
META_TEST_EVENT_CODE=
```

`CLARITY_API_TOKEN` is a Clarity Data Export token. It can read recent analytics but cannot create or edit dashboard funnels. Dashboard funnels are created in the authenticated Clarity interface.

`META_CAPI_ACCESS_TOKEN` is a server-side credential. Never expose it to browser JavaScript. The production copy belongs in the Cloudflare Pages Function environment. `META_TEST_EVENT_CODE` is used only for authenticated synthetic tests, even when configured in production.

## Step-based URLs

Every screen updates the URL hash while preserving the `/a`, `/b`, `/c`, or `/d` variant path and query-string attribution.

| Screen        | Hash                    |
| ------------- | ----------------------- |
| Lander        | `#start`                |
| Fence type    | `#step-1-fence_type`    |
| Property type | `#step-2-property_type` |
| Top priority  | `#step-3-top_priority`  |
| Timeline      | `#step-4-timeline`      |
| Budget        | `#step-5-budget`        |
| Contact form  | `#contact`              |
| Accepted lead | `#thank-you`            |

The Back button moves through the same step history. On variants A and B, Back from question one returns to the lander. Variant C starts at question one and has no first-question Back button.

Route D uses `#zip`, `#step-2-project_type`, `#step-3-fence_type`, `#contact`, and `#thank-you`. Its ZIP is captured once on the first screen and carried into the same flat webhook payload; it is not requested again on the lead form. Route D still validates against the 109-ZIP list in `CONFIG.zipVerification.allowedZipCodes`. Route E does not use that list to restrict submissions; the list also remains available for reporting.

## Microsoft Clarity

The configured project ID is `ydufwdgd3z`. Each screen sends both a `funnelStep` custom tag and a one-time Clarity API event. The route event fires when the page loads; `quiz_start` fires only when a visitor actually starts the quiz. This makes lander-to-quiz abandonment measurable.

Expected event sequences:

```text
Variant A or B
quiz_path_a (or quiz_path_b)
quiz_start
quiz_step_1_fence_type
quiz_step_2_property_type
quiz_step_3_top_priority
quiz_step_4_timeline
quiz_step_5_budget
quiz_contact
quiz_thank_you

Variant C
quiz_path_c
quiz_start
quiz_step_1_fence_type
quiz_step_2_property_type
quiz_step_3_top_priority
quiz_step_4_timeline
quiz_step_5_budget
quiz_contact
quiz_thank_you

Variant D
quiz_path_d
quiz_start
quiz_zip
quiz_step_2_project_type
quiz_step_3_fence_type
quiz_contact
quiz_thank_you
```

Four Clarity dashboard funnels are configured under **Settings → Funnels**: `A&W Quiz - Route A`, `A&W Quiz - Route B`, `A&W Quiz - Route C`, and `A&W Quiz - Route D`. They use route-specific URL/hash steps so each report shows completions and drop-offs without mixing variants or preview domains. Clarity may take several hours to display newly collected data.

The tracking runtime also sets `funnelName`, `funnelVariant`, `funnelVariantName`, and `funnelStep` tags.

## Meta Pixel and Conversions API

The public Meta Pixel ID in `CONFIG.metaPixelId` enables these browser events:

| Event        | When                                           | Notes                                       |
| ------------ | ---------------------------------------------- | ------------------------------------------- |
| `PageView`   | Page load                                      | Standard browser event                      |
| `FunnelStep` | Each visited funnel screen                     | Includes step and variant                   |
| `Lead`       | After ingestion acceptance, only for approved ZIPs | Uses `lead_event_id` as the Pixel `eventID` |

The flat form payload includes `capi_event_name`, `capi_event_id`, `capi_event_time`, and `capi_action_source`, plus the source URL, browser user agent, `_fbp`, and `_fbc` as separate values.

The same-origin `/api/capi` Pages Function uses the same event ID as the browser Pixel event so Meta can deduplicate them. It normalizes and SHA-256 hashes email, phone, first name, last name, ZIP, and country server-side; it also supplies available browser IDs, user agent, and Cloudflare client IP. Meta credentials never enter the built browser assets.

Both Lead senders require confirmed ingestion acceptance and an approved project ZIP. The Pages intake signs the normalized ZIP and `meta_eligible` result in a short-lived acceptance receipt; the browser only sends Lead when that signed result is true. CAPI verifies the receipt, matching ZIP, and current approved list before sending. An outside-area or malformed ZIP still reaches Make and thank-you, but produces no Pixel or CAPI Lead event. ZIP+4 qualifies using its five-digit prefix only when the complete input is a valid ZIP+4. `scripts/build-pages.mjs` generates the server list from `CONFIG.zipVerification.allowedZipCodes`, keeping the 109-ZIP configuration as the source of truth. Client-supplied eligibility flags and legacy receipts cannot authorize an event.

PageView and FunnelStep remain enabled for traffic analytics and use matching browser/server event IDs. The quiz Pages Function is the sole quiz CAPI sender; the Make intake contains no Meta relay. A&W dataset 2105161930386830 was disconnected and excluded from Meta’s automatic Conversions API relay to prevent a second quiz server sender.

## Attribution and lead delivery

The funnel captures UTM values, Meta campaign IDs, `fbclid`, `_fbp`, `_fbc`, source URL, user agent, unique `lead_event_id`, variant, `project_type`, other quiz answers, and explicit contact consent.

Submissions use same-origin `POST /api/lead`, forwarding the existing flat URL-encoded payload to the server-only webhook URL. Make returns an explicit matching ingestion receipt before the UI shows success or emits Lead. Network errors, rejections, and timeouts retain the form for retry.

As of October 28, 2026, Route E and the Pages submission function accept outside-area ZIPs, malformed ZIP values, and ZIP+4 as project details. Route E still requires the ZIP field. The approved ZIP list controls Meta Lead conversion eligibility separately from submission acceptance. Route D retains its original browser ZIP-first validation. Contact requirements, consent, signed-test isolation, duplicate handling, and confirmed acceptance receipts remain in place.

Make scenario 6584903 in the main account preserves HTTP ingestion, Gmail, Google Sheets, and Slack. Webhook Response follows ingestion; notifications require HTTP 201, `notify_eligible=yes`, and `test=false`. Duplicates and signed synthetic requests cannot notify. Normal newly persisted leads retain the existing router dispatch.

## Safe synthetic verification

Set `AW_TEST_SIGNING_KEY` identically in Pages and the A&W ingestion Worker. Test requests require `test_mode=true`, `evt_awtest_` event IDs, fixed synthetic contact values, a timestamp within five minutes, and an HMAC-SHA256 signature over the ordered fields in `functions/_lib/security.js`. Reserved `evt_awtest_` IDs also require signed test mode, even if the flags are stripped. Invalid markers/signatures never fall through to production ingestion. Valid tests return before any database write or router dispatch.

`AW_MAKE_WEBHOOK_URL`, `AW_TEST_SIGNING_KEY`, `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, and `META_TEST_EVENT_CODE` are encrypted Pages variables. Meta test codes apply only to authorized synthetic events; ordinary traffic never inherits them. Browser Lead checks use a local intercepted test harness. Production notification and persistence checks are mocked; do not describe those suppressed effects as live delivery.

## Deployment

Build and validate before deployment:

```bash
npm run check
```

Deploy the production branch:

```bash
npm run deploy
```

Configure the encrypted variables listed above before deploying. Never publish their values in browser assets.

- Cloudflare Pages project: `client-a-w-fencing-quiz`
- Production custom domain: `a-wfencing.houzflow.com`
- GitHub repository: `sidbhand-jpg/client-a-w-fencing-quiz`
- Production branch: `main`

## Launch checklist

- Confirm `/a`, `/b`, `/c`, and `/d` render the intended experiences.
- Confirm `/d` retains its ZIP-first service-area check and `/e` accepts outside-area ZIPs and ZIP+4.
- Confirm every step updates the URL hash and Back navigation does not skip questions.
- Confirm Clarity requests use project `ydufwdgd3z`.
- Confirm all four Clarity event sequences appear before building dashboard funnels.
- Confirm `CONFIG.metaPixelId` matches the A&W Fencing dataset.
- Configure the Pages Function with encrypted `META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN` values.
- Verify matching Pixel/CAPI event IDs and synthetic server Test Events receipts for approved ZIPs; verify outside-area/malformed ZIPs are accepted but emit neither Lead event.
- Confirm outside-area and ZIP+4 entries reach the same Make intake, preserving contact, quiz, attribution, consent, and CAPI fields as separate values.
- Run signed synthetic webhook tests and verify zero persistence or notification actions. Real delivery remains unverified until separately authorized.
- Confirm the custom domain serves the latest deployment over HTTPS.
- Keep `.env` ignored and confirm no secrets exist in `dist/` or Git.
