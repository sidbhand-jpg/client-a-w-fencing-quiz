# A & W Fencing Quiz

A standalone, mobile-first estimate quiz for [A & W Fencing](https://www.a-wfencing.com/), adapted from the Elite Glass & Window quiz funnel and deployed with Cloudflare Workers Static Assets.

## Routes

- `/a` - concise landing page and quiz
- `/b` or `/` - landing page, fencing gallery, and quiz

Both routes use the same five-question estimate flow. The contact form requires explicit call/SMS consent and sends accepted submissions to the existing Houzflow lead router with `quiz_profile: "a_w_fencing"`. The success screen appears only after the router accepts the request.

## Local development

```bash
npm install
npm run check
npm run dev
```

## Deployment

```bash
npm run deploy
```

The Worker name is `client-a-w-fencing-quiz`. Static assets are served from `public/`, and SPA fallback keeps `/a` and `/b` working as direct URLs.

## Content and assets

- `public/config.js` is the canonical business, color, questions, and integration configuration.
- `public/index.html` contains the reusable funnel interface.
- `public/assets/` contains the logo and fencing imagery used by the company's public website, copied locally so the funnel does not depend on remote image availability.
- Review cards are intentionally disabled until verified customer quotes are supplied.

No Cloudflare, Retell, Telnyx, or other provider secrets are stored in this repository.
