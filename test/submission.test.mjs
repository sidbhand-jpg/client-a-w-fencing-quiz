import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { onRequestPost as lead } from '../functions/api/lead.js';
import { onRequestPost as capi } from '../functions/api/capi.js';
import { sign, testMessage, issueReceipt } from '../functions/_lib/security.js';
import { normalizeZip, isMetaEligible } from '../functions/_lib/metaEligibility.js';
import { allowedZipCodes } from '../functions/_lib/serviceArea.js';

const env = { AW_MAKE_WEBHOOK_URL: 'https://mock-hook.example', AW_TEST_SIGNING_KEY: 'mock-signing', META_PIXEL_ID: 'mock-pixel', META_CAPI_ACCESS_TOKEN: 'mock-token', META_TEST_EVENT_CODE: 'TESTMOCK' };
const input = () => ({ name: 'Houzflow Synthetic Test', email: 'aw-test@example.com', phone: '2025550199', zip: '28031',
  lead_event_id: 'evt_awtest_local_123', submitted_at: new Date().toISOString(), funnel_variant: 'E', project_type: 'New fence', fence_type: 'Wood privacy fence', sms_consent: 'true', test_mode: 'true' });
function request(route, value, origin = 'https://quiz.example') {
  return new Request('https://quiz.example/api/' + route, { method: 'POST', headers: { origin, 'content-type': route === 'lead' ? 'application/x-www-form-urlencoded' : 'application/json' }, body: route === 'lead' ? new URLSearchParams(value) : JSON.stringify(value) });
}

test('lead proxy requires an explicit matching receipt and rejects unsigned tests before forwarding', async () => {
  const old = globalThis.fetch; let calls = 0;
  const value = input(); value.test_signature = await sign(testMessage(value), env.AW_TEST_SIGNING_KEY);
  globalThis.fetch = async url => { assert.equal(String(url), env.AW_MAKE_WEBHOOK_URL); calls++; return new Response(JSON.stringify({ accepted: true, test: true, duplicate: false, event_id: value.lead_event_id })); };
  try {
    const result = await lead({ request: request('lead', value), env });
    assert.equal(result.status, 200); assert.equal((await result.json()).lead_receipt.test, true); assert.equal(calls, 1);
    assert.equal((await lead({ request: request('lead', { ...value, test_signature: '' }), env })).status, 403);
    const stripped = { ...value }; delete stripped.test_mode; delete stripped.test_signature;
    assert.equal((await lead({ request: request('lead', stripped), env })).status, 403);
    assert.equal(calls, 1);
    const outside = { ...value, zip: '90210' }; outside.test_signature = await sign(testMessage(outside), env.AW_TEST_SIGNING_KEY);
    assert.equal((await lead({ request: request('lead', outside), env })).status, 200);
    assert.equal(calls, 2);
    globalThis.fetch = async () => new Response('Accepted');
    assert.equal((await lead({ request: request('lead', value), env })).status, 502);
    const originalTimer = globalThis.setTimeout;
    globalThis.setTimeout = (callback, ms) => { assert.equal(ms, 10000); queueMicrotask(callback); return 0; };
    globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('Timeout'))));
    try { assert.equal((await lead({ request: request('lead', value), env })).status, 502); }
    finally { globalThis.setTimeout = originalTimer; }
    assert.equal((await lead({ request: request('lead', value, 'https://other.example'), env })).status, 403);
    const normal = { ...value, lead_event_id: 'evt_production_mock' }; delete normal.test_mode; delete normal.test_signature;
    for (const duplicate of [false, true]) {
      globalThis.fetch = async () => new Response(JSON.stringify({ accepted: true, test: false, id: 'mock-lead', duplicate, event_id: normal.lead_event_id }));
      const response = await lead({ request: request('lead', normal), env });
      assert.equal((await response.json()).duplicate, duplicate);
    }
  } finally { globalThis.fetch = old; }
});

test('CAPI supports all three events, hashes contact data, and isolates synthetic events', async () => {
  const old = globalThis.fetch; const sent = [];
  globalThis.fetch = async (url, options) => { assert.equal(new URL(url).hostname, 'graph.facebook.com'); sent.push(JSON.parse(options.body)); return new Response(JSON.stringify({ events_received: 1 })); };
  try {
    for (const event_name of ['PageView', 'FunnelStep']) {
      const result = await capi({ request: request('capi', { event_name, event_id: 'evt_mock_123', source_url: 'https://quiz.example/e/', step: 'contact', variant: 'E', fbp: 'fb.1.123456.7890' }), env });
      assert.equal(result.status, 200); assert.equal(sent.at(-1).test_event_code, undefined);
      assert.equal(sent.at(-1).data[0].event_name, event_name);
    }
    const value = input();
    const lead_receipt = await issueReceipt(value.lead_event_id, true, env.AW_TEST_SIGNING_KEY, value.zip);
    const result = await capi({ request: request('capi', { ...value, event_name: 'Lead', event_id: value.lead_event_id, lead_receipt }), env });
    assert.equal(result.status, 200); assert.equal(sent.at(-1).test_event_code, 'TESTMOCK');
    assert.match(sent.at(-1).data[0].user_data.em[0], /^[a-f0-9]{64}$/); assert.ok(!JSON.stringify(sent.at(-1)).includes(value.email));
    assert.equal((await capi({ request: request('capi', { event_name: 'Lead', event_id: value.lead_event_id }), env })).status, 403);
    assert.equal((await capi({ request: request('capi', { event_name: 'Purchase', event_id: value.lead_event_id }), env })).status, 400);
    assert.equal((await capi({ request: request('capi', null), env })).status, 400);
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { code: 100 } }), { status: 400 });
    assert.equal((await capi({ request: request('capi', { event_name: 'PageView', event_id: 'evt_mock_123' }), env })).status, 502);
  } finally { globalThis.fetch = old; }
});

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const configText = await readFile(new URL('../public/config.js', import.meta.url), 'utf8');
const context = { window: {}, document: { currentScript: { src: 'https://quiz.example/config.js' } }, URL };
runInNewContext(configText, context);
const config = context.window.CONFIG;
const handler = html.slice(html.indexOf('async function handleSubmit'), html.indexOf('function renderThanks'));

function formHarness(zip, accepted = true, variant = 'e', capiFails = false) {
  const requests = [], pixels = [], rendered = [];
  function field(name, value) { return { name, value, style: {}, addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() { this.focused = true; } }; }
  const fields = [field('name', 'Mock Contact'), field('email', 'mock@example.com'), field('phone', '2025550199'), field('zip', zip)];
  const elements = { '#zip-input': fields[3], '#submit-btn': { disabled: false }, '#btn-label': {}, '#spinner': { style: {} }, '#submission-error': {} };
  const form = { querySelectorAll: () => fields, querySelector: name => elements[name] || null };
  const scope = { C: config, trackingConfig: config.tracking, variantConfig: config.variants[variant], funnelVariant: variant, answers: { project_type: 'New fence', fence_type: 'Wood privacy fence' },
    window: { awAttribution: { lead_event_id: 'evt_mock_browser' }, location: { href: 'https://quiz.example/e/' } }, navigator: { userAgent: 'test' },
    sessionStorage: { getItem: () => null }, eventId: () => 'evt_fallback', browserIdentifiers: () => ({ fbp: 'fb.1.123.456', fbc: '' }),
    WEBHOOK_TIMEOUT_MS: 12000, CAPI_TIMEOUT_MS: 5000, THANKS_STEP: 4, currentStep: 3, URLSearchParams, console: { warn() {} },
    fbq: (...args) => pixels.push(args), renderStep: step => rendered.push(step),
    fetchWithTimeout: async (url, options) => { requests.push({ url, options }); return url === '/api/lead' ? new Response(JSON.stringify({ ok: accepted, accepted, test: false, lead_receipt: { meta_eligible: isMetaEligible(zip), signature: 'mock' } }), { status: accepted ? 200 : 502 }) : new Response('{}', { status: capiFails ? 502 : 200 }); },
  };
  const submit = runInNewContext(handler + '\nhandleSubmit', scope);
  return { submit: () => submit(form), fields, elements, requests, pixels, rendered };
}

test('Route E collects ZIPs without format or service-area restrictions and preserves other contact routes', async () => {
  for (const variant of ['a', 'b', 'c', 'e']) {
    for (const zip of ['90210', 'abcde', '2803', '28031-1234', ' 28031 ']) {
      const h = formHarness(zip, true, variant); await h.submit();
      assert.equal(h.requests[0].url, '/api/lead');
      assert.equal(new URLSearchParams(h.requests[0].options.body).get('zip'), zip.trim());
      assert.equal(h.pixels.length, isMetaEligible(zip) ? 1 : 0); assert.equal(h.rendered.length, 1);
      assert.equal(h.requests.length, isMetaEligible(zip) ? 2 : 1);
      if (isMetaEligible(zip)) {
        assert.equal(JSON.parse(h.requests[1].options.body).event_id, h.pixels[0][3].eventID);
      }
    }
  }
  const empty = formHarness(''); await empty.submit(); assert.equal(empty.requests.length, 0);
  const failed = formHarness('28031', false); await failed.submit(); assert.equal(failed.requests.length, 1); assert.equal(failed.pixels.length, 0); assert.equal(failed.elements['#submit-btn'].disabled, false);
  failed.fields[3].value = '90210'; await failed.submit(); assert.equal(failed.requests.length, 2); assert.equal(failed.pixels.length, 0);
  const trackingFailed = formHarness('28031', true, 'e', true); await trackingFailed.submit();
  assert.equal(trackingFailed.rendered.length, 1); assert.equal(trackingFailed.pixels.length, 1);
});

test('server ZIP qualification matches all configured ZIPs without admitting malformed prefixes', () => {
  assert.deepEqual([...allowedZipCodes], config.zipVerification.allowedZipCodes.split(',').map(zip => zip.trim()));
  for (const zip of allowedZipCodes) {
    assert.equal(isMetaEligible(zip), true);
    assert.equal(isMetaEligible(' ' + zip + '-1234 '), true);
  }
  for (const zip of ['90210', '90210-1234', '', 'abcde', '2803', '280311234', '28031junk', '28031-123', '<b>28031</b>']) {
    assert.equal(isMetaEligible(zip), false, zip);
  }
  assert.equal(normalizeZip(' 28031-1234 '), '28031');
});

test('every ZIP reaches Make but only intake-signed approved ZIPs can reach Meta', async () => {
  const old = globalThis.fetch; const forwarded = [], meta = [];
  globalThis.fetch = async (url, options) => {
    if (String(url) === env.AW_MAKE_WEBHOOK_URL) {
      const body = Object.fromEntries(options.body); forwarded.push(body);
      return Response.json({ accepted: true, test: true, event_id: body.lead_event_id });
    }
    meta.push(JSON.parse(options.body)); return Response.json({ events_received: 1 });
  };
  try {
    for (const [index, zip] of ['28031', ' 28031 ', '28031-1234', '90210', '90210-1234', 'abcde', '2803', '', '28031junk'].entries()) {
      const value = { ...input(), zip, lead_event_id: 'evt_awtest_matrix_' + index, meta_eligible: 'true' };
      value.test_signature = await sign(testMessage(value), env.AW_TEST_SIGNING_KEY);
      const result = await lead({ request: request('lead', value), env });
      assert.equal(result.status, 200);
      const acceptance = await result.json();
      assert.equal(forwarded.at(-1).zip, zip.trim());
      assert.equal(acceptance.lead_receipt.meta_eligible, isMetaEligible(zip));
      const before = meta.length;
      const event = { ...value, event_name: 'Lead', event_id: value.lead_event_id, lead_receipt: acceptance.lead_receipt };
      const response = await capi({ request: request('capi', event), env });
      const receipt = await response.json();
      assert.equal(response.status, 200);
      assert.equal(receipt.events_received, isMetaEligible(zip) ? 1 : 0);
      assert.equal(meta.length - before, isMetaEligible(zip) ? 1 : 0);
      if (!isMetaEligible(zip)) {
        assert.equal(receipt.reason, 'zip_not_approved');
        assert.equal((await capi({ request: request('capi', { ...event, zip: '28031' }), env })).status, 403);
        assert.equal((await capi({ request: request('capi', { ...event, lead_receipt: { ...acceptance.lead_receipt, meta_eligible: true } }), env })).status, 403);
        assert.equal(meta.length, before);
      }
    }
    const value = input();
    const legacy = { event_id: value.lead_event_id, issued_at: Date.now(), test: true };
    legacy.signature = await sign(`aw-receipt-v1|${legacy.event_id}|${legacy.issued_at}|${legacy.test}`, env.AW_TEST_SIGNING_KEY);
    assert.equal((await capi({ request: request('capi', { ...value, event_name: 'Lead', event_id: value.lead_event_id, lead_receipt: legacy }), env })).status, 403);
    const production = { ...value, event_id: 'evt_production_qualified', event_name: 'Lead' };
    production.lead_receipt = await issueReceipt(production.event_id, false, env.AW_TEST_SIGNING_KEY, production.zip);
    assert.equal((await capi({ request: request('capi', production), env })).status, 200);
    assert.equal(meta.at(-1).test_event_code, undefined);
  } finally { globalThis.fetch = old; }
});
