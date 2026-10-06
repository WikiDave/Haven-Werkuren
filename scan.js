/*
 * Tekst van een gefotografeerd papier omzetten naar bedragen.
 * De tekst komt van de tekstherkenning (Tesseract) op de gsm zelf; dit bestand zoekt erin:
 *  - loonbrief van Cewez: periode, basis RSZ, RSZ, belastbaar, voorheffing, netto, kledijsaldo
 *  - loonfiche 281.10: jaar, belastbaar loon (code 250), voorheffing (286), werkbonus (284)
 *  - aanslagbiljet: aanslagjaar en het bedrag dat je terugkrijgt of moet bijbetalen
 * Tekstherkenning maakt fouten: de gebruiker kijkt alles na voor het ingevuld wordt.
 */
(function (root) {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');

  // OCR verwart soms letters en cijfers in bedragen
  const fixDigits = (s) => s.replace(/[Oo](?=[\d.,])|(?<=[\d.,])[Oo]/g, '0').replace(/(?<=\d)[lI|]|[lI|](?=\d)/g, '1');

  // alle bedragen op een regel: 1.234,56 · 1 234,56 · -52,34 · 52,34- · € 239,84
  const AMOUNT = /(-\s?)?(?:€\s?)?(\d{1,3}(?:[. ]\d{3})+|\d+),(\d{2})(?!\d)(\s?-)?/g;
  function amountsIn(line) {
    const out = [];
    for (const m of fixDigits(line).matchAll(AMOUNT)) {
      const n = Number(m[2].replace(/[. ]/g, '') + '.' + m[3]);
      out.push((m[1] || m[4]) ? -n : n);
    }
    return out;
  }
  const parseAmount = (s) => amountsIn(String(s))[0];

  const linesOf = (text) => String(text || '').split(/\r?\n/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // laatste bedrag op de regel met dit label (of op de regel eronder als er daar geen staat)
  function amountAfter(lines, re, { skip } = {}) {
    for (let i = 0; i < lines.length; i++) {
      const l = norm(lines[i]);
      if (!re.test(l) || (skip && skip.test(l))) continue;
      const here = amountsIn(lines[i].slice(l.search(re)));
      if (here.length) return here[here.length - 1];
      const next = lines[i + 1] ? amountsIn(lines[i + 1]) : [];
      if (next.length) return next[next.length - 1];
    }
    return undefined;
  }

  // datums: 01/09/2026, 1-9-2026, 01.09.26
  function datesIn(text) {
    const out = [];
    for (const m of fixDigits(String(text)).matchAll(/(?<!\d)(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})(?!\d)/g)) {
      const d = Number(m[1]), mo = Number(m[2]);
      let y = Number(m[3]); if (y < 100) y += 2000;
      if (d < 1 || d > 31 || mo < 1 || mo > 12 || y < 2000 || y > 2100) continue;
      out.push(`${y}-${pad(mo)}-${pad(d)}`);
    }
    return out;
  }

  function detectKind(text) {
    const t = norm(String(text));
    if (/aanslagbiljet|aanslagjaar|in uw voordeel|terug te betalen|kohier/.test(t)) return 'aanslag';
    if (/281[.,]?\s?10|fiscale fiche|belastbaar tijdperk|\b(?:1)?250\b.*\b(?:1)?286\b/s.test(t)) return 'fiche';
    if (/basis ?rsz|belastbaar|netto|cewez|loonbrief|loonstrook/.test(t)) return 'loonbrief';
    return 'onbekend';
  }

  // halve maand uit de datums op de loonbrief: 1-15 of 16-einde
  function periodFrom(dates) {
    const sorted = [...new Set(dates)].sort();
    for (const a of sorted) {
      const day = Number(a.slice(8));
      if (day !== 1 && day !== 16) continue;
      const ym = a.slice(0, 7);
      const end = sorted.find((b) => b > a && b.startsWith(ym) && (day === 1 ? b.endsWith('-15') : Number(b.slice(8)) >= 28));
      if (end) return { start: a, end, half: day === 1 ? 'A' : 'B', key: `${ym}-${day === 1 ? 'A' : 'B'}` };
    }
    return null;
  }

  function parseLoonbrief(text) {
    const lines = linesOf(text);
    const r = {
      kind: 'loonbrief',
      period: periodFrom(datesIn(text)),
      basisRsz: amountAfter(lines, /basis\s*r\.?s\.?z/),
      rsz: amountAfter(lines, /(^|[^a-z])r\.?s\.?z\.?([^a-z]|$)/, { skip: /basis|geen/ }),
      belastbaar: amountAfter(lines, /belastba/),
      voorheffing: amountAfter(lines, /voorheffing/, { skip: /geen|zonder/ }),
      netto: amountAfter(lines, /^netto|netto\s*(te\s*betalen|bedrag|loon)?\s*[:€\d-]/),
      betaald: amountAfter(lines, /betaald|overgeschreven|uitbetaald/),
      kledij: undefined,
    };
    if (r.rsz !== undefined) r.rsz = Math.abs(r.rsz);
    if (r.voorheffing !== undefined) r.voorheffing = Math.abs(r.voorheffing);
    // kledijpunten: geheel getal na "kledij" of "punten"
    for (const l of lines) {
      const m = norm(fixDigits(l)).match(/(kledij|punten)[^\d-]*(-?\d{1,3})(?![\d,])/);
      if (m) { r.kledij = Number(m[2]); break; }
    }
    return r;
  }

  function codeAmount(lines, code) {
    // "250" of "1250" als losse code, met het bedrag op dezelfde regel
    const re = new RegExp(`(^|[^\\d,.])(1|2)?${code}(-\\d\\d)?([^\\d,.]|$)`);
    for (const l of lines) {
      const t = fixDigits(l);
      const m = t.match(re);
      if (!m) continue;
      const rest = t.slice(m.index + m[0].length - (m[4] ? m[4].length : 0));
      const a = amountsIn(rest);
      if (a.length) return Math.abs(a[a.length - 1]);
    }
    return undefined;
  }

  function parseFiche(text) {
    const lines = linesOf(text);
    const t = norm(String(text));
    const years = [...t.matchAll(/(?:inkomsten(?:jaar)?|jaar|tijdperk)\D{0,12}(20\d\d)/g)].map((m) => Number(m[1]));
    const anyYears = [...t.matchAll(/\b(20\d\d)\b/g)].map((m) => Number(m[1]));
    return {
      kind: 'fiche',
      year: years[0] || (anyYears.length ? Math.min(...anyYears) : undefined),
      holidayFund: /vakantie(fonds|kas|geld)/.test(t),
      income: codeAmount(lines, 250) ?? amountAfter(lines, /bezoldiging/),
      withholding: codeAmount(lines, 286) ?? amountAfter(lines, /bedrijfsvoorheffing/),
      workBonus: codeAmount(lines, 284) ?? amountAfter(lines, /werkbonus/),
    };
  }

  function parseAanslag(text) {
    const lines = linesOf(text);
    const t = norm(String(text));
    const aj = t.match(/aanslagjaar\D{0,6}(20\d\d)/);
    const refund = amountAfter(lines, /terug te betalen|in uw voordeel|terugbetaling|terug te krijgen/);
    const pay = amountAfter(lines, /(?<!terug )te betalen|bij te betalen|verschuldigd saldo/, { skip: /terug/ });
    let result;
    if (refund !== undefined) result = -Math.abs(refund);
    else if (pay !== undefined) result = Math.abs(pay);
    return { kind: 'aanslag', year: aj ? Number(aj[1]) - 1 : undefined, result };
  }

  function parse(text, kind = detectKind(text)) {
    if (kind === 'fiche') return parseFiche(text);
    if (kind === 'aanslag') return parseAanslag(text);
    if (kind === 'loonbrief') return parseLoonbrief(text);
    return { kind: 'onbekend' };
  }

  const api = { amountsIn, parseAmount, datesIn, detectKind, periodFrom, parseLoonbrief, parseFiche, parseAanslag, parse };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Scan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
