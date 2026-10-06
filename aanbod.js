/*
 * Werkaanbod van Cewez lezen (cewez.be › Tekorten en Tewerkstelling).
 * De app haalt die pagina's op via de WordPress-API van cewez.be; dit bestand haalt de tabellen eruit.
 * Werkt zonder browser (geen DOMParser), zodat het met node getest kan worden.
 */
(function (root) {
  'use strict';

  const SOURCES = {
    tekorten: { api: 'https://cewez.be/wp-json/wp/v2/posts/545?_fields=modified,content', page: 'https://cewez.be/tekorten/' },
    tewerkstelling: { api: 'https://cewez.be/wp-json/wp/v2/posts/542?_fields=modified,content', page: 'https://cewez.be/tewerkstelling/' },
  };

  const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  const decode = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENT[e.toLowerCase()] ?? m;
  });
  // tekst van een stukje HTML; lijstjes worden aparte regels
  const text = (h) => decode(String(h)
    .replace(/<li[^>]*>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, ''))
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');

  function tables(html) {
    return [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((t) =>
      [...t[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) =>
        [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => text(c[1]))));
  }

  const pad = (n) => String(n).padStart(2, '0');
  // 06-10-2026, 6/10/2026 -> 2026-10-06
  function isoDate(s) {
    const m = String(s).match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
    return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}` : '';
  }

  function parseTekorten(html) {
    const all = text(html);
    const asOf = isoDate((all.match(/Tekorten op ([\d/.-]+)/i) || [])[1] || '');
    // de zinnen over hoe en wanneer de aanwerving verloopt (my.cewez.be, uren)
    const flat = all.replace(/\n/g, ' ');
    const info = ((flat.match(/De aanwerving verloopt[^.]*?\bvia de website[\s\S]*?\bMyJob\b[\s\S]*?start effectief om [\d.]+u\./i) || flat.match(/[^\n]*MyJob[^\n]*/i) || [''])[0])
      .replace(/\.(?=[A-Z])/g, '. ').replace(/\s+/g, ' ').trim();
    const t = tables(html).find((rows) => rows[0] && /firma/i.test(rows[0][0]) && rows[0].some((c) => /tekort/i.test(c))) || [];
    const head = (t[0] || []).map((c) => c.toLowerCase());
    const col = (re) => head.findIndex((c) => re.test(c));
    const ci = { firma: col(/firma/), date: col(/datum/), start: col(/aanvang|uur/), func: col(/functie/), vrij: col(/vrijstel/), count: col(/tekort/) };
    const rows = t.slice(1).map((r) => ({
      firma: r[ci.firma] || '',
      date: isoDate(r[ci.date] || ''),
      start: ((r[ci.start] || '').match(/\d{1,2}/) || [''])[0].padStart(2, '0'),
      func: r[ci.func] || '',
      vrij: (r[ci.vrij] || '').trim(),
      count: Number((r[ci.count] || '').replace(/\D/g, '')) || 0,
    })).filter((r) => r.firma && r.date && r.count > 0);
    return { asOf, info, rows, total: rows.reduce((t2, r) => t2 + r.count, 0) };
  }

  function parseTewerkstelling(html) {
    const ts = tables(html);
    const busyT = ts.find((rows) => rows[0] && /firma/i.test(rows[0][0]) && rows[0].some((c) => /maandag|dinsdag/i.test(c))) || [];
    const dateRow = busyT.find((r) => r.slice(1).some((c) => isoDate(c)));
    const days = dateRow ? dateRow.slice(1).map(isoDate) : [];
    const busy = busyT.filter((r) => r !== busyT[0] && r !== dateRow && r[0])
      .map((r) => ({ firma: r[0], levels: r.slice(1, days.length + 1).map((c) => c.toLowerCase()) }));
    const wantT = ts.find((rows) => rows[0] && /firma/i.test(rows[0][0]) && rows[0].some((c) => /aanbod/i.test(c))) || [];
    const wanted = wantT.slice(1).filter((r) => r[0]).map((r) => {
      const lines = (r[1] || '').split('\n');
      return {
        firma: r[0],
        offer: lines[0] || '',
        items: lines.slice(1),
        phones: (r[2] || '').split('\n').map((x) => x.trim()).filter((x) => /\d{3}/.test(x)),
      };
    });
    return { days, busy, wanted };
  }

  // naam zoals Cewez hem schrijft -> id van het bedrijf in de app
  const NAMES = [
    [/bnfw|sea-?invest/, 'sea-invest'], [/cldn/, 'cldn'], [/dp ?world/, 'dp-world'], [/\bico\b|international car/, 'ico'],
    [/ndq/, 'ndq'], [/^ww(l)?\b|wallenius/, 'wwl'], [/csp|cosco/, 'cosco'], [/p ?& ?o/, 'po-ferries'], [/psa/, 'psa'],
    [/seabridge/, 'seabridge'], [/ecs|2xl/, 'ecs'], [/borlix/, 'borlix'], [/depre/, 'depre'], [/hoppe/, 'hoppe'],
    [/intertrans/, 'intertrans'], [/logghe/, 'logghe'], [/minne/, 'minne'], [/ossco/, 'ossco'],
    [/sea port|\bsst\b/, 'sst'], [/vlist/, 'van-der-vlist'], [/verhelst/, 'verhelst'], [/zfl|food logistics/, 'zfl'],
  ];
  const companyIdFor = (name) => (NAMES.find(([re]) => re.test(String(name).toLowerCase().trim())) || [])[1] || '';

  const api = { SOURCES, text, tables, isoDate, parseTekorten, parseTewerkstelling, companyIdFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Aanbod = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
