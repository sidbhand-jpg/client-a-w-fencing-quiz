# A & W Fencing Quiz Funnel

A config-driven, mobile-first estimate funnel for [A & W Fencing](https://www.a-wfencing.com/), deployed on Cloudflare Pages. The target custom domain is [a-wfencing.houzflow.com](https://a-wfencing.houzflow.com/).

## Included capabilities

- Three route-controlled funnel experiences: `/a`, `/b`, and `/c`
- Microsoft Clarity recordings, custom events, tags, and funnel-ready steps
- Hash-based step URLs for browser navigation and drop-off analysis
- Meta Pixel browser events with a unique deduplication event ID
- Meta Conversions API-ready server payload
- UTM, Meta click ID, `_fbp`, and `_fbc` attribution capture
- Required call and SMS consent
- Config-driven business copy, colors, assets, trust strip, service highlights, questions, proof, tracking IDs, and integrations
- Lead delivery to the Houzflow lead router with the `a_w_fencing` client profile

## Funnel variants

Variant behavior lives in `public/config.js` under `CONFIG.variants`.

| Route | Experience | Intended test |
| --- | --- | --- |
| `/a` | Lander followed by gallery and review/proof sections | Information-rich experience |
| `/b` or `/` | Lander only, with no information below the first fold | Focused landing experience |
| `/c` | Opens directly on question one | Lowest-friction experience |

All three routes use the same five questions, contact form, lead router, attribution payload, and success screen. Variant C intentionally omits the Back button on question one because it has no initial lander.

## Project structure

```text
public/
  index.html          Shared funnel runtime
  config.js           Client, variants, content, and tracking configuration
  assets/             Local logo and fencing imagery
scripts/
  build-pages.mjs     Builds root plus /a, /b, and /c route entries
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

Wrangler prints the local preview URL. Test all three routes:

- `http://localhost:8788/a`
- `http://localhost:8788/b`
- `http://localhost:8788/c`

VS Code Live Preview can also open `public/index.html`. The page includes a nested-path fallback for `public/config.js` and resolves local image URLs relative to that config file.

## Configuration

The main settings are in `public/config.js`:

```js
variants: {
  a: { name: "Lander + proof", showLander: true, showProof: true },
  b: { name: "Lander only", showLander: true, showProof: false },
  c: { name: "Direct to questions", showLander: false, showProof: false }
},

featureStrip: [
  { label: "Family-Owned", icon: "users" },
  { label: "Local North Carolina Team", icon: "map-pin" },
  { label: "Licensed & Insured", icon: "badge-check" }
],

lander: {
  serviceArea: "Serving Lake Norman & Surrounding Areas",
  highlights: [/* organized title, detail, and icon cards */]
},

clarityId: "ydufwdgd3z",
metaPixelId: "",

tracking: {
  eventPrefix: "quiz",
  metaFunnelStepEvent: "FunnelStep",
  metaLeadEvent: "Lead"
},

leadRouterUrl: "https://houzflow-lead-router.houzflow.workers.dev/api/quiz-lead",
leadProfile: "a_w_fencing"
```

The Clarity project ID and Meta Pixel ID are public browser configuration. API access tokens are secrets and must never be added to `public/config.js`, `public/index.html`, or any file published in `dist/`.

## Local secrets

The local `.env` file is ignored by Git and by the Pages build. Store server-side credentials there during local administration:

```dotenv
CLARITY_API_TOKEN=
META_CAPI_ACCESS_TOKEN=
META_PIXEL_ID=
META_TEST_EVENT_CODE=
```

`CLARITY_API_TOKEN` is a Clarity Data Export token. It can read recent analytics but cannot create or edit dashboard funnels. Dashboard funnels are created in the authenticated Clarity interface.

`META_CAPI_ACCESS_TOKEN` is a server-side credential. Never expose it to browser JavaScript. The production copy belongs in the server or automation that sends CAPI events—not in this static Pages project.

## Step-based URLs

Every screen updates the URL hash while preserving the `/a`, `/b`, or `/c` variant path and query-string attribution.

| Screen | Hash |
| --- | --- |
| Lander | `#start` |
| Fence type | `#step-1-fence_type` |
| Property type | `#step-2-property_type` |
| Top priority | `#step-3-top_priority` |
| Timeline | `#step-4-timeline` |
| Budget | `#step-5-budget` |
| Contact form | `#contact` |
| Accepted lead | `#thank-you` |

The Back button moves through the same step history. On variants A and B, Back from question one returns to the lander. Variant C starts at question one and has no first-question Back button.

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
```

Create three Clarity dashboard funnels under **Settings → Funnels → New funnel**, one for each sequence. Clarity must receive the API events before they become available as funnel steps. The dashboard may take several hours to display newly collected data.

The tracking runtime also sets `funnelName`, `funnelVariant`, `funnelVariantName`, and `funnelStep` tags.

## Meta Pixel and Conversions API

Add the public Meta Pixel ID to `CONFIG.metaPixelId` when it is available. The browser then emits:

| Event | When | Notes |
| --- | --- | --- |
| `PageView` | Page load | Standard browser event |
| `FunnelStep` | Each visited funnel screen | Includes step and variant |
| `Lead` | Only after the lead router accepts the request | Uses `lead_event_id` as the Pixel `eventID` |

The form payload includes a `capi` object with `event_name`, `event_id`, `event_time`, `action_source`, `event_source_url`, browser user agent, `_fbp`, and `_fbc`.

The server-side CAPI sender must use the same `event_id` as the browser Pixel event so Meta can deduplicate them. It should normalize and SHA-256 hash permitted customer identifiers server-side before sending them to Meta. CAPI is not active until the lead router or downstream automation is configured with the Pixel ID and access token and actually sends the server event.

Do not fire a browser `Lead` event or a server CAPI `Lead` event until the lead router accepts a real submission.

## Attribution and lead delivery

The funnel captures UTM values, Meta campaign IDs, `fbclid`, `_fbp`, `_fbc`, source URL, user agent, unique `lead_event_id`, variant, quiz answers, and explicit call/SMS consent.

Accepted submissions are sent to:

```text
https://houzflow-lead-router.houzflow.workers.dev/api/quiz-lead
```

with `quiz_profile: "a_w_fencing"`. The thank-you screen and conversion event appear only after the router returns a successful response. A failed request remains on the form and shows an error instead of creating a false conversion.

## Deployment

Build and validate before deployment:

```bash
npm run check
```

Deploy the production branch:

```bash
npm run deploy
```

- Cloudflare Pages project: `client-a-w-fencing-quiz`
- Target custom domain: `a-wfencing.houzflow.com`
- Required DNS record: proxied CNAME `a-wfencing` → `client-a-w-fencing-quiz.pages.dev`
- GitHub repository: `sidbhand-jpg/client-a-w-fencing-quiz`
- Production branch: `main`

## Launch checklist

- Confirm `/a`, `/b`, and `/c` render the intended experiences.
- Confirm every step updates the URL hash and Back navigation does not skip questions.
- Confirm Clarity requests use project `ydufwdgd3z`.
- Confirm all three Clarity event sequences appear before building dashboard funnels.
- Add the Meta Pixel ID to `CONFIG.metaPixelId`.
- Configure the server-side CAPI sender with secrets outside this static project.
- Verify Pixel/CAPI deduplication using Meta Test Events, then remove `META_TEST_EVENT_CODE` before production.
- Test lead-router rejection with incomplete data without creating a contact.
- Complete one authorized real lead test before declaring the full call/SMS workflow live.
- Confirm the custom domain serves the latest deployment over HTTPS.
- Keep `.env` ignored and confirm no secrets exist in `dist/` or Git.
