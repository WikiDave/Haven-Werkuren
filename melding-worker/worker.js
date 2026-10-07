/*
 * Cloudflare Worker: meldingen en voorstellen uit de app Haven Werkuren als GitHub-issue aanmaken,
 * zodat havenarbeiders geen GitHub-account nodig hebben.
 *
 * Instellingen (Cloudflare > Workers > deze worker > Settings > Variables and Secrets):
 *   GITHUB_TOKEN  (secret)  fine-grained token, alleen repo WikiDave/Cewez-Calculator, Issues: Read and write
 *   GITHUB_REPO   (tekst)   WikiDave/Cewez-Calculator
 *   ALLOWED_ORIGIN (tekst)  https://wikidave.github.io
 * Optioneel: een Rate Limiting-binding met de naam RL (zie README), anders geldt alleen de eenvoudige limiet hieronder.
 */
const KINDS = { bug: { label: 'bug', prefix: 'Fout' }, idea: { label: 'enhancement', prefix: 'Voorstel' } };
const recent = new Map(); // eenvoudige limiet per IP binnen dezelfde worker-instantie

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || 'https://wikidave.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
const json = (status, data, headers) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json(405, { ok: false, error: 'Alleen POST' }, headers);
    // enkel vanuit de app
    if (origin !== (env.ALLOWED_ORIGIN || 'https://wikidave.github.io')) return json(403, { ok: false, error: 'Niet toegelaten' }, headers);

    // niet te veel meldingen na elkaar van hetzelfde toestel/netwerk
    const ip = request.headers.get('CF-Connecting-IP') || 'onbekend';
    if (env.RL) {
      const { success } = await env.RL.limit({ key: ip });
      if (!success) return json(429, { ok: false, error: 'Te veel meldingen. Probeer het later opnieuw.' }, headers);
    } else {
      const now = Date.now();
      const list = (recent.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
      if (list.length >= 5) return json(429, { ok: false, error: 'Te veel meldingen. Probeer het later opnieuw.' }, headers);
      list.push(now); recent.set(ip, list);
    }

    let data;
    try { data = await request.json(); } catch { return json(400, { ok: false, error: 'Ongeldige melding' }, headers); }
    const kind = KINDS[data.kind];
    const title = String(data.title || '').trim().slice(0, 120);
    const body = String(data.body || '').trim().slice(0, 6000);
    if (!kind || !title || body.length < 5) return json(400, { ok: false, error: 'Melding is leeg' }, headers);
    if (data.website) return json(200, { ok: true }, headers); // honingpot: bots vullen dit veld in

    const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO || 'WikiDave/Cewez-Calculator'}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'haven-werkuren-melding',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.startsWith(kind.prefix) ? title : `${kind.prefix}: ${title}`,
        body: `${body}\n\n_Verstuurd via de app, zonder GitHub-account._`,
        labels: [kind.label],
      }),
    });
    if (!res.ok) return json(502, { ok: false, error: 'GitHub gaf een fout. Probeer het later opnieuw.' }, headers);
    const issue = await res.json();
    return json(200, { ok: true, number: issue.number, url: issue.html_url }, headers);
  },
};
