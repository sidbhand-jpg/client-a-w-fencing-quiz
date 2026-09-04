# A & W Fencing Quiz

A standalone, mobile-first estimate quiz for [A & W Fencing](https://www.a-wfencing.com/), adapted from the Elite Glass & Window quiz funnel and deployed with Git-integrated Cloudflare Pages.

## Routes

- `/a` - concise landing page and quiz
- `/b` or `/` - landing page, fencing gallery, and quiz

Both routes use the same five-question estimate flow. The Pages build creates dedicated `/a` and `/b` route entries from the canonical `public/index.html`. The contact form requires explicit call/SMS consent and sends accepted submissions to the existing Houzflow lead router with `quiz_profile: "a_w_fencing"`. The success screen appears only after the router accepts the request.

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

The Pages project is `client-a-w-fencing-quiz`, connected to `sidbhand-jpg/client-a-w-fencing-quiz` on `main`. Cloudflare runs `npm run build` and publishes `dist/`; pushes to `main` deploy automatically.

## Content and assets

- `public/config.js` is the canonical business, color, questions, and integration configuration.
- `public/index.html` contains the reusable funnel interface.
- `public/assets/` contains the logo and fencing imagery used by the company's public website, copied locally so the funnel does not depend on remote image availability.
- Review cards are intentionally disabled until verified customer quotes are supplied.

No Cloudflare, Retell, Telnyx, or other provider secrets are stored in this repository.
