// Haven Werkuren: de app zelf (uit index.html gehaald, zodat een strikte Content-Security-Policy kan).
// Versie van de app. Bij elke wijziging ophogen, samen met version.json en de ?v= van loon.js
// (een test controleert dat ze gelijk zijn).
const APP_VERSION = '2026-10-08.7';
(() => {
  // Nieuwere versie online? Dan opnieuw laden zonder de bewaarde (oude) kopie.
  // version.json wordt nooit uit de cache gehaald; de ?v= in de link omzeilt de oude pagina.
  async function checkForUpdate() {
    try {
      const res = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const { version } = await res.json();
      if (!version || version === APP_VERSION) return;
      // maar één keer per versie proberen, zodat een hardnekkige cache geen herlaad-lus geeft
      const key = 'haven-werkuren.reloadedFor';
      if (sessionStorage.getItem(key) === version) return;
      sessionStorage.setItem(key, version);
      location.replace(`${location.pathname}?v=${encodeURIComponent(version)}`);
    } catch { /* offline of geen version.json: gewoon verder met deze versie */ }
  }
  checkForUpdate();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });
})();
(() => {
  const DEFAULT_COMPANIES = [
    ['sea-invest', 'SEA-Invest BNFW', 'SEA-Invest'],
    ['van-der-vlist', 'Van der Vlist', 'Van der Vlist'],
    ['verhelst', 'Verhelst Port Operator', 'Verhelst'],
    ['zfl', 'Zeebrugge Food Logistics', 'ZFL', 'zeebrugge-food-logistics'],
    ['intertrans', 'Intertrans', 'Intertrans'],
    ['logghe', 'Logghe Brandstoffen', 'Logghe'],
    ['minne', 'Minne Port Agencies', 'Minne'],
    ['ndq', 'NDQ', 'NDQ'],
    ['ossco', 'OSSCO', 'OSSCO'],
    ['po-ferries', 'P&O Ferries', 'P&O Ferries'],
    ['psa', 'PSA', 'PSA'],
    ['sst', 'Sea Port Shipping & Trading', 'SST'],
    ['seabridge', 'Seabridge Logistics', 'Seabridge'],
    ['wwl', 'Wallenius Wilhelmsen Logistics Zeebrugge', 'WWL'],
    ['ico', 'ICO International Car Operations', 'ICO'],
    ['cldn', 'CLdN Ports C.RO', 'CLdN'],
    ['borlix', 'Borlix', 'Borlix'],
    ['cosco', 'CSP Cosco Shipping', 'Cosco'],
    ['depre', 'Depre Storage Handling', 'Depre'],
    ['dp-world', 'DP World', 'DP World'],
    ['ecs', 'ECS 2XL', 'ECS 2XL'],
    ['hoppe', 'Hoppe', 'Hoppe'],
  ].map(([id, name, short]) => ({ id, name, short })); // geen logo's van de bedrijven: die zijn van de bedrijven zelf
  // Plaatsen per bedrijf: [id, naam, adres]. Adressen uit de Codex (bijlage 12) en de sites van de
  // terminals; aanpasbaar in "Bedrijven beheren". Zet per plaats een spelt voor de juiste kaai.
  const DEFAULT_LOCATIONS = Object.fromEntries(Object.entries({
    'sea-invest': [['bnfw', 'Belgian New Fruit Wharf (kaai 404)', 'Kiwiweg 120, 8380 Zeebrugge']],
    'van-der-vlist': [['zetel', 'Van der Vlist Belgium', 'Koggenstraat 15, 8380 Zeebrugge']],
    verhelst: [['zetel', 'Verhelst Port Operators', 'Stationstraat 30, 8460 Oudenburg']],
    zfl: [['zetel', 'Zeebrugge Food Logistics', 'Noordzeestraat 201, 8380 Zeebrugge']],
    intertrans: [['zetel', 'Intertrans', 'Loodswezenstraat 1, 8380 Zeebrugge']],
    logghe: [['zetel', 'Logghe-Ve.co', 'Oudenburgsesteenweg 87, 8400 Oostende']],
    minne: [
      ['exploitatie', 'Exploitatie', 'Krakeleweg 40, 8000 Brugge'],
      ['zetel', 'Zetel', 'Sint-Hubertuslaan 49, 8200 Brugge'],
    ],
    ndq: [['zetel', 'NDQ', 'Koffieweg 2, 8380 Zeebrugge']],
    ossco: [['zetel', 'OSSCO', 'Slijkensesteenweg 2, 8400 Oostende']],
    'po-ferries': [['zetel', 'P&O North Sea Ferries', 'Leopold II-dam 13, 8380 Zeebrugge']],
    psa: [['zip', 'ZIP-terminal (kaai 140–143)', 'Caxtonweg, Kaai 140-143, 8380 Zeebrugge']],
    sst: [['zetel', 'Seaport Shipping & Trading', 'Britse Kaai 10, 8000 Brugge']],
    seabridge: [['zetel', 'Seabridge', 'Koffieweg 10, 8380 Zeebrugge']],
    wwl: [['k530', 'Terminal kaai 530', 'Alfred Ronsestraat 100, 8380 Zeebrugge']],
    ico: [
      ['noord', 'Noordelijke Insteek (kaai 405–410)', 'Noordelijke Insteek, 8380 Zeebrugge'],
      ['zuid', 'Zuidelijke Insteek (kaai 501–525)', 'Zuidelijke Insteek, 8380 Zeebrugge'],
      ['kantoor', 'Kantoor', 'Margaretha van Oostenrijkstraat 1, 8380 Zeebrugge'],
    ],
    cldn: [
      ['kantoor', 'Kantoor', 'Hendrik van Minderhoutstraat 50, 8380 Zeebrugge'],
      ['canadakaai', 'Canadakaai', 'Canadakaai, 8380 Zeebrugge'],
      ['britannia', 'Britannia-dok', 'Britannia-dok, 8380 Zeebrugge'],
      ['zweedse', 'Zweedse Kaai', 'Zweedse Kaai, 8380 Zeebrugge'],
      ['albert2', 'Albert II-dok', 'Albert II-dok, 8380 Zeebrugge'],
    ],
    borlix: [['zetel', 'Borlix', 'Lanceloot Blondeellaan 15, 8380 Zeebrugge']],
    cosco: [['k120', 'CSP-terminal (kaai 120)', 'Leopold II-dam, Kaai 120, 8380 Zeebrugge']],
    depre: [['zetel', 'Depre Storage & Handling', 'Britse Kaai 8, 8000 Brugge']],
    'dp-world': [['codex', 'Volgens Codex (Antwerpen, nakijken)', 'Molenweg-haven 1950, 9130 Kallo']],
    ecs: [['zetel', '2XL - ECS', 'Baron de Maerelaan 155, 8380 Zeebrugge']],
    hoppe: [['zetel', 'Hoppe Ship Agencies', 'Leopold II-dam 35, 8380 Zeebrugge']],
  }).map(([co, list]) => [co, list.map(([id, name, address]) => ({ id, name, address }))]));
  const SHOW_COMPANIES = 7; // zoveel bedrijven tonen voor "Alle bedrijven"
  const ROW_NAMES = { ZA: 'zaterdagtarief', ZO: 'zon- en feestdagtarief' };

  // --- opslag -------------------------------------------------------------
  const KEY_ENTRIES = 'haven-werkuren.entries';
  const KEY_PERIODS = 'haven-werkuren.ratePeriods';
  const KEY_CUSTOM_CO = 'haven-werkuren.customCompanies';
  const KEY_HIDDEN_CO = 'haven-werkuren.hiddenCompanies';
  const KEY_LAST_CO = 'haven-werkuren.lastCompany';
  const KEY_SETTINGS = 'haven-werkuren.settings';
  const KEY_HOLIDAYS = 'haven-werkuren.holidays';
  const KEY_MODE = 'haven-werkuren.showMode';
  const KEY_LAST_WORK = 'haven-werkuren.lastWork';
  const KEY_LAST_FUNC = 'haven-werkuren.lastFunction';
  const KEY_MEDICAL = 'haven-werkuren.medicalChecks';
  const KEY_LEAVE = 'haven-werkuren.leave';
  const KEY_PAYSLIPS = 'haven-werkuren.payslips';   // ingescande loonbrieven per periode
  const KEY_TAX_ACTUAL = 'haven-werkuren.taxActual'; // echte aanslag per inkomstenjaar
  const KEY_TAX_EXTRA = 'haven-werkuren.taxExtras';
  const KEY_TAX_REMOTE = 'haven-werkuren.taxTablesRemote'; // laatst opgehaalde belasting.json
  const KEY_TAX_USER = 'haven-werkuren.taxTablesUser';     // eigen aanpassingen per periode
  const KEY_PURCHASES = 'haven-werkuren.clothingPurchases';
  const KEY_CLOTH_START = 'haven-werkuren.clothingStart';
  const KEY_FOLDS = 'haven-werkuren.folds';
  const KEY_CO_ADDR = 'haven-werkuren.companyAddresses'; // oud: één adres per bedrijf
  const KEY_CO_LOCS = 'haven-werkuren.companyLocations';
  const KEY_LAST_LOC = 'haven-werkuren.lastLocation';
  const KEY_CO_PIN = 'haven-werkuren.companyPins';
  const KEY_CO_PHONE = 'haven-werkuren.companyPhones';
  const KEY_CO_NOTES = 'haven-werkuren.companyNotes'; // eigen notities per bedrijf
  const KEY_MARKAGE = 'haven-werkuren.markagePremie'; // premie markage per bedrijf, zelf ingevuld
  const KEY_LASH = 'haven-werkuren.lashPremie'; // premie lashing per bedrijf, zelf ingevuld
  const KEY_REPLY = 'haven-werkuren.replyTo'; // e-mail en gsm voor een antwoord op een bericht: { email, phone }
  const KEY_DOP = 'haven-werkuren.dop'; // dagen dop (werkloosheid): ['2026-10-08', …]
  const KEY_OTHER_DAYS = 'haven-werkuren.otherWork'; // dagen op een andere job (rode kaart)
  const KEY_OTHER_PAY = 'haven-werkuren.otherPay'; // loon andere job per maand: { '2026-10': { taxable, withholding } }
  const load = (k, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch { return fallback; }
  };
  const save = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch { alert('Opslaan mislukt: browseropslag niet beschikbaar.'); }
  };

  // oudere dagen: tarief 'ZA'/'ZO' zat vroeger in het startuur
  const migrateEntry = (e) => {
    const x = { kind: 'full', tariff: 'auto', ...e };
    if (x.code === 'ZA' || x.code === 'ZO') { x.tariff = x.code; x.code = '08'; }
    delete x.rate; delete x.label;
    return x;
  };
  // de geïndexeerde tabel stond eerst voorlopig op 1 oktober; hij geldt vanaf 7 juli 2026
  const migratePeriods = (list) => {
    const indexed = JSON.stringify(Loon.DEFAULT_RATE_PERIODS[1].values);
    for (const pr of list) if (pr.from === '2026-10-01' && JSON.stringify(pr.values) === indexed) pr.from = '2026-07-07';
    return list;
  };

  let entries = load(KEY_ENTRIES, []).map(migrateEntry);
  let periods = migratePeriods(load(KEY_PERIODS, null) || structuredClone(Loon.DEFAULT_RATE_PERIODS));
  let settings = { ...Loon.DEFAULT_SETTINGS, ...load(KEY_SETTINGS, {}) };
  let holidayOverrides = load(KEY_HOLIDAYS, {});
  let showMode = load(KEY_MODE, 'bruto');
  let purchases = load(KEY_PURCHASES, []);
  let medChecks = load(KEY_MEDICAL, []); // [{ id, date, note }]
  let payslips = load(KEY_PAYSLIPS, {}); // { '2026-09-B': { basisRsz, belastbaar, voorheffing, netto } }
  let taxActual = load(KEY_TAX_ACTUAL, {}); // { jaar: bedrag (min = terug) }
  let leave = load(KEY_LEAVE, []);       // [{ date, type, g }] één per verlofdag; g = samen aangevraagd
  let taxExtras = load(KEY_TAX_EXTRA, {}); // { jaar: { income, withholding } }
  let taxUser = load(KEY_TAX_USER, { withholding: {}, incomeTax: {} }); // { soort: { vanaf: bedragen } }
  // belastingbedragen: standaard < belasting.json (automatisch) < eigen aanpassingen
  function baseTaxTables() {
    const r = load(KEY_TAX_REMOTE, null);
    return {
      withholding: Loon.normalizeTable(r?.withholding) || Loon.DEFAULT_WITHHOLDING,
      incomeTax: Loon.normalizeTable(r?.incomeTax) || Loon.DEFAULT_INCOME_TAX,
      updated: r?.updated || '',
    };
  }
  function effectiveTaxTable(kind) {
    const map = new Map(baseTaxTables()[kind].map((x) => [x.from, x]));
    for (const [from, obj] of Object.entries(taxUser[kind] || {})) map.set(from, { ...obj, from });
    return Loon.normalizeTable([...map.values()]);
  }
  const applyTaxTables = () => Loon.setTaxTables({ withholding: effectiveTaxTable('withholding'), incomeTax: effectiveTaxTable('incomeTax') });
  // oudere instellingen omzetten naar eigen belastingbedragen
  (() => {
    let changed = false;
    if (Number(settings.bvTaxFree) > 0) {
      const base = baseTaxTables().withholding[0];
      taxUser.withholding[base.from] = { ...base, taxFree: Number(settings.bvTaxFree) };
      delete settings.bvTaxFree; save(KEY_SETTINGS, settings); changed = true;
    }
    for (const [y, d] of Object.entries(taxExtras)) {
      if (!(Number(d.taxFree) > 0 || Number(d.costMax) > 0)) continue;
      const from = `${y}-01-01`;
      const base = taxUser.incomeTax[from] || Loon.normalizeTable(baseTaxTables().incomeTax).filter((x) => x.from <= from).pop() || Loon.DEFAULT_INCOME_TAX[0];
      taxUser.incomeTax[from] = { ...base, from, ...(Number(d.taxFree) > 0 && { taxFree: Number(d.taxFree) }), ...(Number(d.costMax) > 0 && { costMax: Number(d.costMax) }) };
      delete d.taxFree; delete d.costMax; changed = true;
    }
    if (changed) { save(KEY_TAX_USER, taxUser); save(KEY_TAX_EXTRA, taxExtras); }
  })();
  applyTaxTables();
  // vroeger een apart vinkje "Rode kaart"; nu is dat het statuut
  if ('redCard' in settings) {
    if (settings.redCard) settings.status = 'gelegenheid';
    delete settings.redCard; save(KEY_SETTINGS, settings);
  }
  let taxYear = new Date().getFullYear();
  let clothingStart = load(KEY_CLOTH_START, { date: '', points: 0 });
  let companyLocations = load(KEY_CO_LOCS, {}); // door jou aangepaste plaatsen per bedrijf
  let companyPins = load(KEY_CO_PIN, {});         // spelden per plaats: "bedrijf/plaats"
  let lastLocation = load(KEY_LAST_LOC, {});      // laatst gekozen plaats per bedrijf
  let companyNotes = load(KEY_CO_NOTES, {});      // { bedrijf: tekst }
  let companyPhones = load(KEY_CO_PHONE, {});     // telefoonnummers per bedrijf: [{ id, label, number }]
  // oudere gegevens: één adres en één spelt per bedrijf omzetten naar de eerste plaats
  (() => {
    const old = load(KEY_CO_ADDR, null);
    for (const [co, address] of Object.entries(old || {})) {
      if (co in companyLocations) continue;
      const list = structuredClone(DEFAULT_LOCATIONS[co] || []);
      if (list.length) list[0].address = address;
      else if (address) list.push({ id: 'adres', name: 'Adres', address });
      companyLocations[co] = list;
    }
    for (const key of Object.keys(companyPins)) {
      if (key.includes('/')) continue;
      const first = (companyLocations[key] || DEFAULT_LOCATIONS[key] || [])[0];
      companyPins[`${key}/${first ? first.id : 'main'}`] = companyPins[key];
      delete companyPins[key];
    }
    if (old) { save(KEY_CO_LOCS, companyLocations); save(KEY_CO_PIN, companyPins); try { localStorage.removeItem(KEY_CO_ADDR); } catch {} }
  })();
  let editPeriod = periods.length - 1;
  let customCompanies = load(KEY_CUSTOM_CO, []);
  let hiddenCompanies = load(KEY_HIDDEN_CO, []);
  let showAllCompanies = false;
  let companyId = load(KEY_LAST_CO, '');
  let markagePremie = load(KEY_MARKAGE, {});
  let lashPremie = load(KEY_LASH, {});
  let dop = load(KEY_DOP, []);
  let otherDays = load(KEY_OTHER_DAYS, []);
  let otherPay = load(KEY_OTHER_PAY, {});
  let today = new Date(); // wordt bijgewerkt als de app na middernacht terug geopend wordt
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let holYear = viewYear;
  let selected = '';
  let calc = { periods: {}, shifts: {} }; // resultaat van Loon.calcAll, vernieuwd bij elke render

  // --- helpers ------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const eur = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' });
  const money = (n) => eur.format(n || 0);
  const round2 = Loon.round2;
  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(iso + 'T12:00').toLocaleDateString('nl-BE', opts);
  const ctx = () => ({ ratePeriods: periods, settings, holidays: holidayOverrides });
  const startLabel = (code) => Loon.START_HOURS.find((x) => x.id === code)?.label || code;

  // "1u30", "1:30", "1,5", "1.5", "90m" -> uren als getal
  function parseHours(str) {
    const s = String(str || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!s) return 0;
    let m = s.match(/^(\d+)(?:u|h|:)(\d{1,2})?$/);
    if (m) return Number(m[1]) + Number(m[2] || 0) / 60;
    m = s.match(/^(\d+)m(in)?$/);
    if (m) return Number(m[1]) / 60;
    const n = Number(s.replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  }
  // aantal uren, bv. "18 uur" of "1 uur 30" (niet te verwarren met een startuur)
  const fmtHours = (h) => {
    const mins = Math.round(h * 60), m = mins % 60;
    return `${Math.floor(mins / 60)} uur${m ? ' ' + pad(m) : ''}`;
  };
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const holidayName = (iso) => Loon.holidayOn(iso, holidayOverrides);
  // wettelijke feestdag op deze kalenderdatum die in het weekend valt (geen feestdagtarief)
  const movedHoliday = (iso) => Loon.holidays(Number(iso.slice(0, 4)), holidayOverrides)
    .find((h) => h.date === iso && h.effective !== iso);

  // omschrijving van een shift, bv. "08u00 (A) · zaterdagtarief"
  function entryTitle(e) {
    if (e.kind === 'afbestel') return 'Afbestelling weekend';
    const x = calc.shifts[e.id];
    const fn = Loon.functionOf(e.func);
    return [startLabel(e.code), fn.id !== 'alle' && fn.label, e.kind === 'half' && 'halve shift', x && ROW_NAMES[x.row]].filter(Boolean).join(' · ');
  }
  const shiftOf = (e) => calc.shifts[e.id] || { bruto: 0, netto: 0, lines: [] };
  const overtimeOf = (e) => (e.kind === 'afbestel' ? 0 : e.overtime || 0);

  // --- bedrijven -----------------------------------------------------------
  // ook verborgen bedrijven opzoeken, zodat oude dagen hun logo houden
  const companyById = (id) => DEFAULT_COMPANIES.find((c) => c.id === id) || customCompanies.find((c) => c.id === id);
  const visibleCompanies = () => [...DEFAULT_COMPANIES, ...customCompanies].filter((c) => !hiddenCompanies.includes(c.id));
  // --- telefoonnummers om te bellen voor werk ---
  // Nummers vult de gebruiker zelf in (Bedrijven beheren); de officiële lijst staat op cewez.be.
  const DEFAULT_PHONES = {};
  const phonesOf = (co) => companyPhones[co]
    || (DEFAULT_PHONES[co] || []).map(([label, number], i) => ({ id: 'd' + i, label, number }));
  const savePhones = (co, list) => { companyPhones[co] = list; save(KEY_CO_PHONE, companyPhones); };
  const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';
  const telHref = (n) => 'tel:' + String(n).replace(/[^\d+]/g, '');
  const callButtons = (co) => phonesOf(co).filter((p) => p.number).map((p) => `<a class="callbtn" href="${telHref(p.number)}">${PHONE_ICON}<span>${escapeHtml(p.label || 'Bellen')} <small>${escapeHtml(p.number)}</small></span></a>`).join('');
  // enkel een eigen foto als logo toelaten (zoals imageToLogo hem maakt), niets anders in het src-attribuut
  const safeLogo = (src) => typeof src === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(src);
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  // logo als <img>, of initialen als er geen logo is
  function logoHtml(id, name, cls = '') {
    const co = companyById(id);
    const n = co?.name || name || '';
    if (safeLogo(co?.logo)) return `<img class="logo ${cls}" src="${co.logo}" alt="${escapeHtml(n)}">`;
    return `<span class="logo ${cls}" title="${escapeHtml(n)}">${escapeHtml(initials(n))}</span>`;
  }

  const locationsOf = (co) => companyLocations[co] || DEFAULT_LOCATIONS[co] || [];
  const locationOf = (co, loc) => locationsOf(co).find((l) => l.id === loc);
  // gekozen plaats van het gekozen bedrijf (de laatst gebruikte, anders de eerste)
  const currentLoc = () => (locationOf(companyId, lastLocation[companyId]) || locationsOf(companyId)[0])?.id || 'main';
  const placeKey = (co, loc) => `${co}/${loc || 'main'}`;
  // route naar de spelt als die gezet is, anders naar het adres
  function routeUrl(co, loc) {
    const pin = companyPins[placeKey(co, loc)];
    if (pin) return `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`;
    const addr = locationOf(co, loc)?.address;
    return addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}` : '';
  }
  const routeLink = (co, loc) => (routeUrl(co, loc) ? `<a href="${routeUrl(co, loc)}" target="_blank" rel="noopener">Route</a>` : '');
  function saveLocations(co, list) {
    companyLocations[co] = list;
    save(KEY_CO_LOCS, companyLocations);
  }

  function renderCompanyPicker() {
    if (companyId && hiddenCompanies.includes(companyId)) companyId = '';
    // meest gebruikte bedrijven eerst
    const used = {};
    for (const e of entries) if (e.company) used[e.company] = (used[e.company] || 0) + 1;
    const all = visibleCompanies();
    const sorted = all.map((c, i) => ({ c, i })).sort((a, b) => (used[b.c.id] || 0) - (used[a.c.id] || 0) || a.i - b.i).map((x) => x.c);
    let shown = sorted;
    if (!showAllCompanies && sorted.length > SHOW_COMPANIES + 1) {
      shown = sorted.slice(0, SHOW_COMPANIES);
      const sel = companyById(companyId);
      if (sel && !shown.includes(sel)) shown[SHOW_COMPANIES - 1] = sel;
    }
    const toggle = shown.length < sorted.length
      ? `<button type="button" class="co add" id="coMore"><span class="logo">⋯</span><span>Alle bedrijven (${sorted.length})</span></button>`
      : sorted.length > SHOW_COMPANIES + 1 ? '<button type="button" class="co add" id="coMore"><span class="logo">−</span><span>Minder</span></button>' : '';
    $('cos').innerHTML = shown.map((c) => `<button type="button" class="co${c.id === companyId ? ' on' : ''}" data-co="${c.id}" title="${escapeHtml(c.name)}">
        ${logoHtml(c.id)}<span>${escapeHtml(c.short || c.name)}</span></button>`).join('')
      + toggle + '<button type="button" class="co add" id="coAdd"><span class="logo">+</span><span>Nieuw</span></button>';

    const sel = companyById(companyId);
    const locs = sel ? locationsOf(companyId) : [];
    const loc = currentLoc();
    $('locWrap').hidden = locs.length < 2;
    $('loc').innerHTML = locs.map((l) => `<option value="${escapeHtml(l.id)}">${escapeHtml(l.name)}</option>`).join('');
    if (locs.length) $('loc').value = loc;
    const place = locationOf(companyId, loc);
    const pinned = !!companyPins[placeKey(companyId, loc)];
    $('coWhere').hidden = !sel;
    $('coWhere').innerHTML = !sel ? ''
      : place?.address || pinned
        ? `${escapeHtml(place?.name || sel.name)}: ${escapeHtml(place?.address || 'eigen spelt op de kaart')}${pinned && place?.address ? ' · spelt gezet' : ''} · ${routeLink(companyId, loc)}`
        : `Nog geen adres voor ${escapeHtml(sel.name)}. Vul het in bij Bedrijven beheren, of zet een spelt op de kaart.`;
    $('coCalls').innerHTML = sel ? callButtons(companyId) : '';
    $('coCalls').hidden = !$('coCalls').innerHTML;
    $('mapBox').hidden = !sel;
    updateMap();

    $('coList').innerHTML = (all.length ? all.map((c) => `<li>${logoHtml(c.id, '', 'li-logo')}
        <div class="li-main"><div class="d">${escapeHtml(c.name)}</div>
          ${locationsOf(c.id).map((l) => `<div class="locrow">
            <input data-co="${c.id}" data-loc="${escapeHtml(l.id)}" data-field="name" value="${escapeHtml(l.name)}" placeholder="Naam (bv. kaai of terminal)" aria-label="Naam plaats">
            <input data-co="${c.id}" data-loc="${escapeHtml(l.id)}" data-field="address" value="${escapeHtml(l.address)}" placeholder="Adres" aria-label="Adres plaats">
            <button type="button" class="del" data-delloc="${escapeHtml(l.id)}" data-co="${c.id}" aria-label="Plaats verwijderen">✕</button>
          </div>`).join('')}
          <button type="button" class="linkbtn" data-addloc="${c.id}">+ Plaats toevoegen</button>
          ${phonesOf(c.id).map((ph) => `<div class="phonerow">
            <input data-pco="${c.id}" data-pid="${escapeHtml(ph.id)}" data-pfield="label" value="${escapeHtml(ph.label)}" placeholder="bv. Planning" aria-label="Naam nummer">
            <input type="tel" data-pco="${c.id}" data-pid="${escapeHtml(ph.id)}" data-pfield="number" value="${escapeHtml(ph.number)}" placeholder="bv. 050 12 34 56" aria-label="Telefoonnummer">
            <button type="button" class="del" data-delphone="${escapeHtml(ph.id)}" data-pco="${c.id}" aria-label="Nummer verwijderen">✕</button>
          </div>`).join('')}
          <button type="button" class="linkbtn" data-addphone="${c.id}">+ Telefoonnummer toevoegen</button></div>
        <button class="del" data-delco="${c.id}" aria-label="Bedrijf verwijderen">✕</button></li>`).join('')
      : '<li class="empty">Geen bedrijven.</li>');
    $('coRestore').hidden = !hiddenCompanies.length;
  }

  // foto verkleinen tot een rond logo van 96px (data-URL, zodat het in de browser bewaard kan worden)
  function imageToLogo(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = 96, side = Math.min(img.width, img.height);
        const cv = document.createElement('canvas');
        cv.width = cv.height = size;
        cv.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        URL.revokeObjectURL(img.src);
        resolve(cv.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  $('cos').addEventListener('click', (ev) => {
    const btn = ev.target.closest('.co');
    if (!btn) return;
    if (btn.id === 'coAdd') { $('newco').hidden = false; $('coName').focus(); return; }
    if (btn.id === 'coMore') { showAllCompanies = !showAllCompanies; renderCompanyPicker(); return; }
    companyId = btn.dataset.co === companyId ? '' : btn.dataset.co;
    save(KEY_LAST_CO, companyId);
    for (const k of Object.keys(PREMIES)) if ($(PREMIES[k].box).checked) fillPremie(k);
    renderCompanyPicker();
  });
  $('coCancel').addEventListener('click', () => { $('newco').hidden = true; $('coName').value = ''; $('coLogo').value = ''; });
  $('coSave').addEventListener('click', async () => {
    const name = $('coName').value.trim();
    if (!name) return alert('Geef het bedrijf een naam.');
    let logo = '';
    const file = $('coLogo').files[0];
    if (file) {
      try { logo = await imageToLogo(file); } catch { return alert('Deze afbeelding kon niet gelezen worden.'); }
    }
    const co = { id: 'co-' + Date.now().toString(36), name, logo };
    customCompanies.push(co);
    save(KEY_CUSTOM_CO, customCompanies);
    companyId = co.id; save(KEY_LAST_CO, companyId);
    $('coCancel').click();
    renderCompanyPicker();
  });
  $('coList').addEventListener('click', (ev) => {
    const id = ev.target.closest('[data-delco]')?.dataset.delco;
    if (!id || !confirm(`${companyById(id).name} uit de lijst halen?`)) return;
    hiddenCompanies.push(id);
    save(KEY_HIDDEN_CO, hiddenCompanies);
    renderCompanyPicker();
  });
  $('coList').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-field]');
    if (!el) return;
    const co = el.dataset.co;
    const list = structuredClone(locationsOf(co));
    const l = list.find((x) => x.id === el.dataset.loc);
    if (!l) return;
    l[el.dataset.field] = el.value.trim();
    saveLocations(co, list);
    renderCompanyPicker(); render();
  });
  $('coList').addEventListener('click', (ev) => {
    const add = ev.target.closest('[data-addloc]');
    const del = ev.target.closest('[data-delloc]');
    if (add) {
      const co = add.dataset.addloc;
      saveLocations(co, [...structuredClone(locationsOf(co)), { id: 'p' + Date.now().toString(36), name: '', address: '' }]);
      renderCompanyPicker();
      const inputs = $('coList').querySelectorAll(`[data-co="${co}"][data-field="name"]`);
      inputs[inputs.length - 1]?.focus();
    } else if (del) {
      const co = del.dataset.co, loc = del.dataset.delloc;
      const l = locationOf(co, loc);
      if (!confirm(`Plaats "${l?.name || 'zonder naam'}" verwijderen?`)) return;
      saveLocations(co, locationsOf(co).filter((x) => x.id !== loc));
      delete companyPins[placeKey(co, loc)];
      save(KEY_CO_PIN, companyPins);
      renderCompanyPicker(); render();
    }
  });
  $('coList').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-pfield]');
    if (!el) return;
    const co = el.dataset.pco;
    const list = structuredClone(phonesOf(co));
    const ph = list.find((x) => x.id === el.dataset.pid);
    if (!ph) return;
    const v = el.value.trim();
    if (el.dataset.pfield === 'number' && v && !/^[+\d][\d\s./()-]{5,}$/.test(v)) { alert('Dat lijkt geen telefoonnummer. Gebruik cijfers, spaties en eventueel + vooraan.'); el.value = ph.number; return; }
    ph[el.dataset.pfield] = v;
    savePhones(co, list);
    renderCompanyPicker();
  });
  $('coList').addEventListener('click', (ev) => {
    const add = ev.target.closest('[data-addphone]');
    const del = ev.target.closest('[data-delphone]');
    if (add) {
      const co = add.dataset.addphone;
      savePhones(co, [...structuredClone(phonesOf(co)), { id: 'n' + Date.now().toString(36), label: '', number: '' }]);
      renderCompanyPicker();
      const inputs = $('coList').querySelectorAll(`[data-pco="${co}"][data-pfield="number"]`);
      inputs[inputs.length - 1]?.focus();
    } else if (del) {
      const co = del.dataset.pco;
      const ph = phonesOf(co).find((x) => x.id === del.dataset.delphone);
      if (ph?.number && !confirm(`Nummer ${ph.number} verwijderen?`)) return;
      savePhones(co, phonesOf(co).filter((x) => x.id !== del.dataset.delphone));
      renderCompanyPicker();
    }
  });
  // bellen voor werk: alle bedrijven met hun nummers
  function renderCallList() {
    const used = {};
    for (const e of entries) if (e.company) used[e.company] = (used[e.company] || 0) + 1;
    const list = visibleCompanies().map((c, i) => ({ c, i, n: phonesOf(c.id).filter((p) => p.number).length }))
      .sort((a, b) => (b.n > 0) - (a.n > 0) || (used[b.c.id] || 0) - (used[a.c.id] || 0) || a.i - b.i);
    $('callList').innerHTML = list.map(({ c, n }) => `<li><div class="callhead">${logoHtml(c.id, '', 'li-logo')}<span>${escapeHtml(c.name)}</span></div>
      ${n ? `<div class="calls">${callButtons(c.id)}</div>` : '<div class="none">Nog geen nummer.</div>'}</li>`).join('');
  }
  $('callOpen').addEventListener('click', () => {
    renderCallList();
    if (typeof $('callDialog').showModal === 'function') $('callDialog').showModal();
    else $('callDialog').setAttribute('open', '');
  });
  $('callEdit').addEventListener('click', () => {
    $('callDialog').close?.();
    document.querySelector('[data-fold="instellingen"]').open = true;
    document.querySelector('[data-fold="bedrijven"]').open = true;
    $('coList').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('coRestore').addEventListener('click', () => {
    hiddenCompanies = [];
    save(KEY_HIDDEN_CO, hiddenCompanies);
    renderCompanyPicker();
  });

  // --- kaai op de kaart (Leaflet) ------------------------------------------
  const PORT_CENTER = [51.335, 3.205]; // haven van Zeebrugge
  // vaste paden voor de spelt (Leaflet raadt ze anders af uit de css, wat niet overal lukt)
  const PIN_ICONS = {
    icon: 'vendor/leaflet/images/marker-icon.png',
    retina: 'vendor/leaflet/images/marker-icon-2x.png',
    shadow: 'vendor/leaflet/images/marker-shadow.png',
  };
  let tilesFailed = false;
  let map = null, marker = null, mapPlace = null;
  function ensureMap() {
    if (map || !window.L) return !!map;
    map = L.map('map', { zoomControl: true }).setView(PORT_CENTER, 13);
    const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap',
    });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Esri, Maxar, Earthstar Geographics',
    });
    // één mislukt kaartbeeld kan altijd; enkel melden als er helemaal niets laadt
    let tilesLoaded = 0;
    for (const layer of [streets, satellite]) {
      layer.on('tileload', () => {
        tilesLoaded++;
        if (tilesFailed) { tilesFailed = false; updateMap(); }
      });
      layer.on('tileerror', () => {
        if (tilesLoaded || tilesFailed) return;
        tilesFailed = true;
        $('mapHint').textContent = 'De kaartbeelden konden niet geladen worden. Controleer je internetverbinding. Een spelt zetten lukt wel.';
      });
    }
    satellite.addTo(map);
    L.control.layers({ Satelliet: satellite, Kaart: streets }, null, { position: 'topright' }).addTo(map);
    map.on('click', (ev) => setPin(ev.latlng));
    return true;
  }
  function setPin(latlng) {
    if (!companyId) return;
    companyPins[placeKey(companyId, currentLoc())] = { lat: Number(latlng.lat.toFixed(6)), lng: Number(latlng.lng.toFixed(6)) };
    save(KEY_CO_PIN, companyPins);
    renderCompanyPicker(); render();
  }
  function updateMap() {
    const sel = companyById(companyId);
    const loc = currentLoc();
    const key = placeKey(companyId, loc);
    const pin = companyPins[key];
    const where = locationOf(companyId, loc)?.name || sel?.name || '';
    if (!tilesFailed) $('mapHint').textContent = !sel ? ''
      : pin ? `Sleep de spelt om de plaats van ${where} te verbeteren.`
      : `Tik op de kaart waar je moet zijn (${where}). Daarna kun je de spelt verslepen.`;
    $('pinRoute').href = routeUrl(companyId, loc) || '#';
    $('pinRoute').setAttribute('aria-disabled', String(!pin));
    $('pinClear').disabled = !pin;
    if (!$('mapBox').open || !ensureMap()) return;
    map.invalidateSize();
    if (pin) {
      if (!marker) {
        const icon = L.icon({
          iconUrl: PIN_ICONS.icon, iconRetinaUrl: PIN_ICONS.retina, shadowUrl: PIN_ICONS.shadow,
          iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
        });
        marker = L.marker([pin.lat, pin.lng], { draggable: true, icon }).addTo(map);
        marker.on('dragend', () => setPin(marker.getLatLng()));
      } else marker.setLatLng([pin.lat, pin.lng]);
    } else if (marker) { marker.remove(); marker = null; }
    // alleen opnieuw centreren als je van bedrijf of plaats wisselt
    if (mapPlace !== key) {
      map.setView(pin ? [pin.lat, pin.lng] : PORT_CENTER, pin ? 17 : 13);
      mapPlace = key;
    }
  }
  $('mapBox').addEventListener('toggle', () => {
    if ($('mapBox').open && !window.L) $('mapHint').textContent = 'De kaart kon niet geladen worden. Ben je offline?';
    mapPlace = null;
    updateMap();
  });
  $('pinClear').addEventListener('click', () => {
    if (!companyId || !confirm('Spelt voor deze plaats wissen?')) return;
    delete companyPins[placeKey(companyId, currentLoc())];
    save(KEY_CO_PIN, companyPins);
    renderCompanyPicker(); render();
  });

  $('loc').addEventListener('change', () => {
    lastLocation[companyId] = $('loc').value;
    save(KEY_LAST_LOC, lastLocation);
    renderCompanyPicker();
  });

  // --- formulier ----------------------------------------------------------
  function fillCodes() {
    $('code').innerHTML = Loon.START_HOURS.map((r) => `<option value="${r.id}">${r.label}</option>`).join('');
    $('code').value = '08';
  }

  function readForm() {
    return {
      id: '__preview',
      date: $('date').value, code: $('code').value, kind: $('kind').value, tariff: $('tariff').value, work: $('work').value, func: $('func').value,
      wijziging: $('wijziging').checked, markage: premieAmount('markage'), lash: premieAmount('lash'),
      company: companyId, companyName: companyById(companyId)?.name || '', kaai: $('kaai').value.trim(),
      loc: companyId ? currentLoc() : '', locName: (companyId && locationsOf(companyId).length > 1 && locationOf(companyId, currentLoc())?.name) || '',
      overtime: parseHours($('ot').value), note: $('note').value.trim(),
    };
  }

  // premies die per bedrijf verschillen: de gebruiker vult het bedrag in, de app onthoudt het per bedrijf
  const PREMIES = {
    markage: { box: 'markage', amt: 'markageAmt', eur: 'markageEur', key: KEY_MARKAGE, store: () => markagePremie, label: 'premie markage', applies: () => Loon.isMarkeerder($('func').value) },
    lash: { box: 'lash', amt: 'lashAmt', eur: 'lashEur', key: KEY_LASH, store: () => lashPremie, label: 'premie lashing', applies: () => true },
  };
  // bedrag van een premie: undefined = niet aangevinkt, 0 = aangevinkt maar geen geldig bedrag
  function premieAmount(k) {
    const p = PREMIES[k];
    if (!$(p.box).checked || !p.applies()) return undefined;
    const n = Number($(p.eur).value.trim().replace(/\s|€/g, '').replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }
  // vakje voor het bedrag tonen, ingevuld met wat de gebruiker vorige keer bij dit bedrijf invulde
  function fillPremie(k) {
    const p = PREMIES[k];
    $(p.amt).hidden = !$(p.box).checked;
    const known = p.store()[companyId || ''];
    $(p.eur).value = known ? known.toFixed(2).replace('.', ',') : '';
  }
  for (const k of Object.keys(PREMIES)) {
    $(PREMIES[k].box).addEventListener('change', () => { fillPremie(k); updatePreview(); });
    $(PREMIES[k].eur).addEventListener('input', updatePreview);
  }

  function updatePreview() {
    const e = readForm();
    $('workFields').hidden = e.kind === 'afbestel';
    $('workMore').hidden = e.kind === 'afbestel';
    const auto = Loon.tariffRow(e.date, e.code, holidayOverrides, 'auto');
    $('tariffHint').textContent = e.tariff === 'auto'
      ? `Automatisch: ${ROW_NAMES[auto] || 'weekdagtarief'}`
      : `Automatisch zou ${ROW_NAMES[auto] || 'weekdagtarief'} zijn.`;
    const fn = Loon.functionOf(e.func);
    $('funcHint').textContent = Loon.FUNCTION_GROUPS[fn.group].kader ? `Loon ${fn.label.toLowerCase()} volgens de loontabel van Cewez (shift, uur en overuren).`
      : fn.group === 'alle' ? '' : Loon.FUNCTION_GROUPS[fn.group].label.replace(/^[^(]*\(/, 'Loon alle werk (').replace(/\)$/, ')');
    $('markageWrap').hidden = !Loon.isMarkeerder(fn.id);
    if (Number.isNaN(e.overtime)) { $('preview').textContent = '—'; $('previewNet').textContent = ''; return; }
    // netto van deze shift: bereken de uitbetaling opnieuw met deze shift erbij
    const key = Loon.periodOf(e.date).key;
    const same = entries.filter((x) => Loon.periodOf(x.date).key === key);
    const x = Loon.calcAll([...same, e], ctx()).shifts[e.id];
    $('preview').textContent = money(x.bruto);
    $('previewNet').textContent = `netto ± ${money(x.netto)}`;
  }

  function addEntry() {
    const e = readForm();
    if (!e.date) return alert('Kies een datum.');
    if (Number.isNaN(e.overtime)) return alert('Overuren niet herkend. Schrijf bv. 1u30 of 1,5.');
    for (const [k, p] of Object.entries(PREMIES)) {
      if (e[k] === 0) { $(p.eur).focus(); return alert(`Vul het bedrag van de ${p.label} in (staat op je loonbrief), of vink de premie uit.`); }
    }
    for (const [k, p] of Object.entries(PREMIES)) {
      if (e[k]) { p.store()[e.company || ''] = e[k]; save(p.key, p.store()); }
      if (e[k] === undefined) delete e[k];
    }
    e.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (e.kind === 'afbestel') { e.overtime = 0; e.wijziging = false; }
    entries.push(e);
    save(KEY_ENTRIES, entries);
    save(KEY_LAST_WORK, e.work);
    save(KEY_LAST_FUNC, e.func);
    $('ot').value = ''; $('note').value = ''; $('kaai').value = ''; $('wijziging').checked = false; $('markage').checked = false; $('markageAmt').hidden = true; $('lash').checked = false; $('lashAmt').hidden = true;
    $('kind').value = 'full'; $('tariff').value = 'auto';
    renderCompanyPicker();
    render();
  }

  // --- overzicht ----------------------------------------------------------
  const monthEntries = (y, m) => {
    const prefix = `${y}-${pad(m + 1)}`;
    return entries.filter((e) => e.date.startsWith(prefix)).sort((a, b) => a.date.localeCompare(b.date));
  };

  function totals(list) {
    return list.reduce((t, e) => {
      const x = shiftOf(e);
      t.bruto = round2(t.bruto + x.bruto); t.netto = round2(t.netto + x.netto);
      t.otH += overtimeOf(e);
      t.shifts += e.kind === 'afbestel' ? 0 : 1;
      return t;
    }, { bruto: 0, netto: 0, otH: 0, shifts: 0 });
  }
  const shown = (t) => (showMode === 'netto' ? t.netto : t.bruto);

  // korte aanduiding in de kalender: startuur
  const shortCode = (e) => (e.kind === 'afbestel' ? 'Afb.' : e.code === '18' ? '18u+' : Number(e.code) + 'u');
  const dayEntries = (iso) => entries.filter((e) => e.date === iso);

  function selectDay(iso, scroll) {
    selected = iso;
    $('date').value = iso;
    const d = new Date(iso + 'T12:00');
    viewYear = d.getFullYear(); viewMonth = d.getMonth();
    render();
    if (scroll) {
      $('dayCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // uitbetalingen die in deze maand vallen: { datum: [periode, …] }
  function paydaysIn(y, m) {
    const out = {};
    for (const delta of [-1, 0]) {
      const d = new Date(y, m + delta, 1);
      const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      for (const day of ['01', '16']) {
        const per = Loon.periodOf(`${ym}-${day}`);
        const pay = Loon.paymentDate(per, holidayOverrides);
        if (pay.date.slice(0, 7) === `${y}-${pad(m + 1)}`) (out[pay.date] ||= []).push({ per, pay, r: calc.periods[per.key] });
      }
    }
    return out;
  }
  const payTitle = (x) => `uitbetaling ${rangeText([x.per.start, x.per.end])}${x.r ? `: ${money(x.r.netto)}` : ''}${x.pay.approx ? ' (ongeveer)' : ''}`;

  function renderCalendar() {
    const paydays = paydaysIn(viewYear, viewMonth);
    const first = new Date(viewYear, viewMonth, 1);
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    const lead = (first.getDay() + 6) % 7; // maandag eerst
    const todayIso = isoDate(today);
    let html = '<button class="pad" tabindex="-1" aria-hidden="true"></button>'.repeat(lead);
    for (let day = 1; day <= days; day++) {
      const iso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
      const list = dayEntries(iso);
      const wd = (lead + day - 1) % 7;
      const lv = leaveOn(iso);
      const pay = paydays[iso];
      const cls = [wd >= 5 && 'we', holidayName(iso) && 'hol', list.length && 'work', lv && 'leave', !list.length && !lv && dopOn(iso) && 'dop', !list.length && !lv && !dopOn(iso) && otherOn(iso) && 'other', pay && 'paid', iso === todayIso && 'today', iso === selected && 'sel']
        .filter(Boolean).join(' ');
      let inner = `<span class="n">${day}</span>`;
      if (medChecks.some((m) => m.date === iso)) inner += '<span class="medmark" title="medische controle">+</span>';
      else if (iso === nextMedDate()) inner += '<span class="medmark due" title="medische controle: ten laatste vandaag">+</span>';
      else if (iso === medFromDate()) inner += '<span class="medmark from" title="medische controle: kan vanaf vandaag">+</span>';
      if (list.length) {
        const t = totals(list);
        const withCo = list.filter((e) => e.company || e.companyName);
        const mark = withCo.length
          ? `<span class="logos">${withCo.map((e) => logoHtml(e.company, e.companyName)).join('')}</span>`
          : `<span class="c">${list.map(shortCode).join('+')}</span>`;
        inner += `${mark}<span class="a">${Math.round(shown(t))}</span>`;
        if (t.otH) inner += '<span class="dot" title="overuren"></span>';
      } else if (lv) inner += `<span class="lv">${{ herverdeling: 'HV', recup: 'recup' }[lv.type] || 'verlof'}</span>`;
      else if (dopOn(iso)) inner += '<span class="lv dop">dop</span>';
      else if (otherOn(iso)) inner += '<span class="lv dop">job</span>';
      if (pay) inner += `<span class="pay" title="${escapeHtml(pay.map(payTitle).join(', '))}">€</span>`;
      html += `<button class="${cls}" data-date="${iso}">${inner}</button>`;
    }
    $('cal').innerHTML = html;
  }

  function renderDay() {
    const hol = holidayName(selected);
    const moved = movedHoliday(selected);
    $('dayTitle').textContent = fmtDate(selected, { weekday: 'long', day: 'numeric', month: 'long' }) + (hol ? ` · ${hol}` : '')
      + (medChecks.some((m) => m.date === selected) ? ' · medische controle'
        : selected === nextMedDate() ? ' · medische controle ten laatste'
        : selected === medFromDate() ? ' · medische controle kan vanaf nu' : '');
    $('dayNote').hidden = !moved;
    const lv = leaveOn(selected);
    const dp = !lv && dopOn(selected);
    const ow = !lv && !dp && otherOn(selected);
    const part = dp ? dopPart(selected) : 0;
    $('dayLeaveNote').hidden = !lv && !dp && !ow;
    $('dayLeaveNote').classList.toggle('dop', !!(dp || ow));
    if (lv) $('dayLeaveNote').textContent = `Verlof: ${LEAVE_TYPES[lv.type] || 'verlof'}`;
    else if (dp) $('dayLeaveNote').textContent = 'Dop (werkloosheid)' + (part === 0.5 ? ': halve dag, naast je halve shift' : part === 0 ? ': telt niet mee, want er staat een volle shift' : '');
    else if (ow) $('dayLeaveNote').textContent = 'Ander werk (andere job)';
    $('dayOff').hidden = !!(lv || dp || ow);
    document.querySelectorAll('#dayOffBtns [data-lv]').forEach((b) => { b.hidden = !leaveEnabled(); });
    document.querySelectorAll('#dayOffBtns [data-rk]').forEach((b) => { b.hidden = settings.status !== 'gelegenheid'; });
    $('dayOffDel').hidden = !(lv || dp || ow);
    $('dayOffDel').textContent = lv ? 'Verlof op deze dag weghalen' : dp ? 'Dop op deze dag weghalen' : 'Ander werk op deze dag weghalen';
    $('lgLeave').hidden = !leaveEnabled();
    const pays = paydaysIn(Number(selected.slice(0, 4)), Number(selected.slice(5, 7)) - 1)[selected];
    $('dayPayNote').hidden = !pays;
    if (pays) $('dayPayNote').textContent = pays.map((x) => payTitle(x).replace(/^u/, 'U')).join(' · ');
    if (moved) {
      $('dayNote').textContent = moved.effective
        ? `${moved.name} valt in het weekend en wordt gevierd op ${fmtDate(moved.effective, { weekday: 'long', day: 'numeric', month: 'long' })}.`
        : `${moved.name} valt in het weekend: hier geldt het gewone weekendtarief. Vul de vervangingsdag in bij Feestdagen.`;
    }
    const list = dayEntries(selected);
    $('list').innerHTML = list.map((e) => {
      const x = shiftOf(e);
      const ot = x.lines.find((l) => l.key === 'overuren');
      const detail = [
        e.overtime && e.kind !== 'afbestel' ? `<span class="ot">${fmtHours(e.overtime)} overuren (${money(ot?.amount)})</span>` : '',
        e.wijziging ? 'wijzigingsvergoeding' : '',
        `netto ± ${money(x.netto)}`,
        clothingLabel(e),
        e.locName ? escapeHtml(e.locName) : '',
        e.kaai ? `kaai ${escapeHtml(e.kaai)}` : '',
        e.company ? routeLink(e.company, e.loc) : '',
        e.note ? escapeHtml(e.note) : '',
      ].filter(Boolean).join(' · ');
      const co = e.company || e.companyName;
      return `<li>${co ? logoHtml(e.company, e.companyName, 'li-logo') : ''}
        <div class="li-main"><div class="d">${co ? escapeHtml(companyById(e.company)?.name || e.companyName) + ' · ' : ''}${escapeHtml(entryTitle(e))}</div>
        <div class="m">${detail}</div></div>
        <div class="li-amt">${money(x.bruto)}</div>
        <button class="del" data-id="${e.id}" aria-label="Verwijderen">✕</button></li>`;
    }).join('');
    $('list').hidden = !list.length;
    $('add').textContent = list.length ? 'Nog een shift toevoegen' : 'Opslaan';
    updatePreview();
  }

  // loonbrief per uitbetalingsperiode, in de volgorde van de Cewez-loonbrief
  function slipHtml(half) {
    const key = `${viewYear}-${pad(viewMonth + 1)}-${half}`;
    const r = calc.periods[key];
    const last = new Date(viewYear, viewMonth + 1, 0).getDate();
    const month = fmtDate(`${viewYear}-${pad(viewMonth + 1)}-01`, { month: 'long' });
    const title = half === 'A' ? `1–15 ${month}` : `16–${last} ${month}`;
    if (!r) return `<div class="slip"><div class="slip-h"><b>${title}</b><span>geen shiften</span></div></div>`;
    const pay = r.payment.approx ? `uitbetaling rond ${fmtDate(r.payment.date, { day: 'numeric', month: 'short' })}`
      : `uitbetaling uiterlijk ${fmtDate(r.payment.date, { weekday: 'short', day: 'numeric', month: 'short' })}`;
    const row = (label, amount, cls = '') => `<tr class="${cls}"><td>${label}</td><td>${money(amount)}</td></tr>`;
    const est = r.estimate ? ' <span class="est">schatting</span>' : '';
    const rows = [
      row('Basis RSZ', r.basisRsz),
      row('RSZ', -r.rsz),
      row('Werkbonus', r.werkbonus),
      row('Belastbaar', r.belastbaar, 'mid'),
      r.withholdingCalculated || r.voorheffing ? row('Voorheffing', -r.voorheffing) : '<tr><td>Voorheffing</td><td>niet berekend</td></tr>',
      row('Geen RSZ, geen voorheffing', r.D),
      row('Speciale bijdrage', -r.special),
      row('Groepsverzekering', -r.groupInsurance),
      row('Inhouding maaltijdcheques', -r.mtc),
      r.otherDeductions ? row('Voorschot, loonbeslag, afhoudingen', -r.otherDeductions) : '',
      `<tr class="tot"><td>Netto${est}</td><td>${money(r.netto)}</td></tr>`,
      row('Betaald', r.betaald, 'sub'),
    ].join('');
    const lines = {};
    for (const l of r.lines) {
      const g = (lines[l.label] ||= { ...l, amount: 0, n: 0 });
      g.amount = round2(g.amount + l.amount);
      g.n++;
    }
    const detail = Object.values(lines).map((l) => `<tr><td>${escapeHtml(l.label)}${l.n > 1 ? ` (${l.n}×)` : ''} <span class="net">type ${l.type}</span></td><td>${money(l.type === 'M' ? -l.amount : l.amount)}</td></tr>`).join('');
    const warn = r.withholdingCalculated ? ''
      : '<p class="warn">Voorheffing niet berekend: de schatting werkt enkel voor een alleenstaande zonder personen ten laste. Het netto is daardoor te hoog.</p>';
    const ps = payslips[key];
    const cmp = (label, mine, app) => {
      if (!Number.isFinite(mine)) return '';
      const d = round2(app - mine);
      return `<div>${label}: loonbrief ${money(mine)} · app ${money(app)} · <b class="${Math.abs(d) < 0.01 ? 'ok' : 'off'}">${Math.abs(d) < 0.01 ? 'klopt' : `verschil ${money(d)}`}</b></div>`;
    };
    const check = ps ? `<div class="slipcheck"><div><b>Vergeleken met je loonbrief</b></div>${[
      cmp('Basis RSZ', ps.basisRsz, r.basisRsz), cmp('Belastbaar', ps.belastbaar, r.belastbaar),
      cmp('Voorheffing', ps.voorheffing, r.voorheffing), cmp('Netto', ps.netto, r.netto)].join('')}
      <button type="button" class="linkbtn" data-unslip="${key}">Loonbrief weghalen</button></div>` : '';
    return `<div class="slip">
      <div class="slip-h"><b>${title}</b><span>${pay}</span></div>
      <table class="slip-t">${rows}</table>${warn}${check}
      <details><summary>Detail (${r.shifts.length} shift${r.shifts.length === 1 ? '' : 'en'})</summary><table class="slip-t">${detail}</table></details>
    </div>`;
  }

  function render() {
    calc = Loon.calcAll(entries, ctx());
    const title = fmtDate(`${viewYear}-${pad(viewMonth + 1)}-01`, { month: 'long', year: 'numeric' });
    $('monthTitle').textContent = title;
    $('sumTitle').textContent = 'Overzicht ' + title;
    document.querySelectorAll('#showMode button').forEach((b) => b.classList.toggle('on', b.dataset.m === showMode));
    const list = monthEntries(viewYear, viewMonth);
    const t = totals(list);
    const anyEstimate = list.some((e) => calc.periods[Loon.periodOf(e.date).key]?.estimate);
    $('sumLabel').innerHTML = showMode === 'netto' ? `Totaal netto${anyEstimate ? ' <span class="est">schatting</span>' : ''}` : 'Totaal bruto';
    $('tTotalTop').textContent = money(shown(t));
    $('tTotal').textContent = money(t.bruto);
    $('tNet').textContent = money(t.netto);
    $('tNetEst').hidden = !anyEstimate;
    $('tShifts').textContent = t.shifts;
    $('tOtH').textContent = fmtHours(t.otH);

    const per = {};
    for (const e of list) {
      const key = e.company || e.companyName || '';
      (per[key] ||= { e, list: [] }).list.push(e);
    }
    const groups = Object.values(per).sort((a, b) => b.list.length - a.list.length);
    $('perCo').innerHTML = list.length && (groups.length > 1 || groups[0].e.company || groups[0].e.companyName)
      ? groups.map(({ e, list: l }) => {
          const gt = totals(l);
          const has = e.company || e.companyName;
          const name = has ? (companyById(e.company)?.name || e.companyName) : 'Geen bedrijf gekozen';
          return `<li>${has ? logoHtml(e.company, e.companyName, 'li-logo') : '<span class="logo li-logo">?</span>'}
            <div class="li-main"><div class="d">${escapeHtml(name)}</div>
            <div class="m">${gt.shifts} shift${gt.shifts === 1 ? '' : 'en'}${gt.otH ? ` · ${fmtHours(gt.otH)} overuren` : ''} · netto ± ${money(gt.netto)}</div></div>
            <div class="li-amt">${money(gt.bruto)}</div></li>`;
        }).join('')
      : '';
    $('perCo').hidden = !$('perCo').innerHTML;

    $('slips').innerHTML = slipHtml('A') + slipHtml('B');
    renderClothing();
    renderMedical();
    renderLeave();
    renderDop();
    renderOther();
    $('wkMyJob').hidden = settings.status === 'gelegenheid'; // rode kaart heeft geen account op my.cewez.be
    renderTax();
    renderDash();
    renderCoInfo();
    renderKaaien();

    renderCalendar();
    renderDay();

    const yt = totals(entries.filter((e) => e.date.startsWith(String(viewYear))));
    $('yearLine').textContent = `Heel ${viewYear}: ${money(yt.bruto)} bruto, ± ${money(yt.netto)} netto, ${fmtHours(yt.otH)} overuren.`;
  }

  $('showMode').addEventListener('click', (ev) => {
    const m = ev.target.closest('[data-m]')?.dataset.m;
    if (!m) return;
    showMode = m; save(KEY_MODE, m); render();
  });

  // --- belastingbrief (schatting) -------------------------------------------
  const numIn = (v) => (String(v ?? '').trim() ? Number(String(v).replace(',', '.')) : 0);
  const numOut = (n) => (n ? String(n).replace('.', ',') : '');
  const TAX_FIELDS = ['ficheIncome', 'ficheWithholding', 'workBonus', 'holidayPay', 'holidayWithholding', 'income', 'withholding', 'kidsUnder3',
    'partnerIncome', 'partnerWithholding', 'pension', 'otherReductions', 'realCosts'];
  const CIVIL_NAMES = { ongehuwd: 'ongehuwd', gehuwd: 'gehuwd', 'wettelijk-samenwonend': 'wettelijk samenwonend', gescheiden: 'gescheiden', weduwe: 'weduwe / weduwnaar' };
  function renderTax() {
    const y = String(taxYear);
    $('taxYear').textContent = `${y} · brief in ${taxYear + 1}`;
    const periodsOfYear = Object.values(calc.periods).filter((r) => r.period.start.startsWith(y));
    const d = taxExtras[y] || {};
    const has = (k) => Number(d[k]) > 0 || (k.startsWith('fiche') && String(d[k] ?? '') !== '' && Number(d[k]) === 0);
    const appTaxable = round2(periodsOfYear.reduce((t, r) => t + r.belastbaar, 0));
    const appWithheld = round2(periodsOfYear.reduce((t, r) => t + r.voorheffing, 0));
    const useFiche = has('ficheIncome');
    const ow = otherPayYear(y); // loon van een andere job (vakje Ander werk)
    const taxable = (useFiche ? Number(d.ficheIncome) : appTaxable) + (Number(d.holidayPay) || 0) + (Number(d.income) || 0) + ow.taxable;
    const withheld = (has('ficheWithholding') ? Number(d.ficheWithholding) : appWithheld)
      + (Number(d.holidayWithholding) || 0) + (Number(d.withholding) || 0) + ow.withholding;
    const r = Loon.estimateAnnualTax({ belastbaar: taxable, voorheffing: withheld, year: taxYear, settings, details: d });

    // formulier invullen
    for (const k of TAX_FIELDS) $('tx-' + k).value = numOut(d[k]);
    $('taxPartner').hidden = !r.couple;
    $('taxFamily').textContent = `Je gezinssituatie stel je in bij Instellingen › Netto-instellingen. Nu: ${CIVIL_NAMES[settings.civil] || settings.civil}, `
      + `${Number(settings.kids) || 0} kind(eren) ten laste, ${Number(settings.others) || 0} andere persoon/personen ten laste.`
      + (r.couple ? ' Vul hieronder het inkomen van je partner in (gezamenlijke aanslag).' : '');

    const row = (label, amount, cls = '') => `<tr class="${cls}"><td>${label}</td><td>${money(amount)}</td></tr>`;
    if (!periodsOfYear.length && !taxable) {
      $('taxResult').className = 'taxresult';
      $('taxResult').textContent = `Nog geen gegevens voor ${y}.`;
      $('taxTable').innerHTML = '';
    } else {
      const diff = r.difference;
      $('taxResult').className = 'taxresult' + (diff < -0.5 ? ' back' : diff > 0.5 ? ' pay' : '');
      $('taxResult').textContent = diff < -0.5 ? `Je krijgt ongeveer ${money(-diff)} terug.`
        : diff > 0.5 ? `Je moet ongeveer ${money(diff)} bijbetalen.`
        : 'Ongeveer € 0: je voorheffing dekt je belasting.';
      $('taxTable').innerHTML = [
        useFiche ? row('Belastbaar loon (loonfiche)', Number(d.ficheIncome))
          : row(`Belastbaar loon in de app (${periodsOfYear.length} uitbetaling${periodsOfYear.length === 1 ? '' : 'en'})`, appTaxable),
        d.holidayPay ? row('Vakantiegeld (vakantiefonds)', Number(d.holidayPay)) : '',
        ow.taxable ? row(`Andere job (${ow.months.length} ${ow.months.length === 1 ? 'maand' : 'maanden'} ingevuld)`, ow.taxable) : '',
        d.income ? row('Ander inkomen', Number(d.income)) : '',
        row(r.realCosts ? 'Werkelijke beroepskosten' : 'Forfaitaire beroepskosten', -r.costs),
        row('Netto belastbaar inkomen', r.netTaxable, 'mid'),
        r.couple ? row('Netto inkomen partner', r.partnerNet) : '',
        r.quotient ? row('Huwelijksquotiënt (naar laagste inkomen)', r.quotient, 'sub') : '',
        row('Belasting volgens de schalen', r.grossTax),
        row(`Belastingvrije som (${money(r.taxFree)})`, -r.taxFreeReduction),
        row('Belasting (federaal en Vlaams)', r.stateTax, 'mid'),
        r.pension ? row('Vermindering pensioensparen', -Math.min(r.pension, r.reductions)) : '',
        r.otherReductions ? row('Andere verminderingen', -Math.max(0, r.reductions - r.pension)) : '',
        row(`Gemeentebelasting ${String(r.municipalRate).replace('.', ',')}%`, r.municipal),
        r.kidsCredit ? row('Belastingkrediet kinderen', -r.kidsCredit) : '',
        r.workBonus ? row('Fiscale werkbonus', -r.workBonus) : '',
        row('Totaal verschuldigd', r.total, 'mid'),
        row(r.couple && d.partnerWithholding ? 'Al betaalde voorheffing (jullie samen)' : 'Al betaalde voorheffing', -r.voorheffing),
        `<tr class="tot"><td>${diff < 0 ? 'Terug te krijgen' : 'Bij te betalen'} <span class="est">schatting</span></td><td>${money(Math.abs(diff))}</td></tr>`,
      ].join('');
    }
    const act = taxActual[y];
    $('taxActual').hidden = !Number.isFinite(act);
    if (Number.isFinite(act)) {
      $('taxActual').innerHTML = `Echte aanslag: ${act < 0 ? `je krijgt <b>${money(-act)}</b> terug` : `je moet <b>${money(act)}</b> bijbetalen`}.`
        + (periodsOfYear.length || taxable ? ` De app schatte ${r.difference < 0 ? `${money(-r.difference)} terug` : `${money(r.difference)} bijbetalen`}.` : '');
    }
    const missing = [!useFiche && 'je loonfiche', !d.holidayPay && 'je vakantiegeld', !d.workBonus && 'de fiscale werkbonus',
      otherDays.some((x) => x.startsWith(y)) && !ow.months.length && 'het loon van je andere job'].filter(Boolean);
    $('taxHint').textContent = `Schatting van je aanslag personenbelasting (inkomstenjaar ${y}, aanslagjaar ${taxYear + 1}). `
      + (missing.length ? `Hoe meer je invult bij "Jouw gegevens" (bv. ${missing.slice(0, -1).join(', ')}${missing.length > 1 ? ' en ' : ''}${missing[missing.length - 1]}), hoe nauwkeuriger. ` : '')
      + (!useFiche && settings.withholdingMode !== 'percentage' ? 'De voorheffing in de app is zelf ook een schatting. ' : '')
      + 'Je echte aanslag kan verschillen.';
  }
  $('taxExtraBox').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-tx]');
    if (!el) return;
    const n = numIn(el.value);
    if (!Number.isFinite(n) || n < 0) { renderTax(); return alert('Vul een geldig bedrag in.'); }
    const d = { ...(taxExtras[taxYear] || {}) };
    if (el.value.trim() === '') delete d[el.dataset.tx]; else d[el.dataset.tx] = n;
    taxExtras[taxYear] = d;
    save(KEY_TAX_EXTRA, taxExtras);
    renderTax();
  });
  $('taxClear').addEventListener('click', () => {
    if (!confirm(`Alle ingevulde gegevens voor ${taxYear} wissen?`)) return;
    delete taxExtras[taxYear];
    save(KEY_TAX_EXTRA, taxExtras);
    renderTax();
  });
  $('taxPrev').addEventListener('click', () => { taxYear--; renderTax(); });
  $('taxNext').addEventListener('click', () => { taxYear++; renderTax(); });

  // --- medische controle (1 keer per jaar) --------------------------------
  const MED_WARN_DAYS = 30;
  const lastMedCheck = () => medChecks.map((m) => m.date).sort().pop() || '';
  // de volgende controle mag ten vroegste 10 maanden en moet ten laatste 12 maanden na de vorige
  const MED_FROM_MONTHS = 10, MED_DUE_MONTHS = 12;
  function addMonthsIso(iso, n) {
    const d = new Date(iso + 'T12:00');
    const day = d.getDate();
    d.setDate(1); d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); // 31 -> laatste dag van de maand
    return isoDate(d);
  }
  const nextMedDate = () => (lastMedCheck() ? addMonthsIso(lastMedCheck(), MED_DUE_MONTHS) : '');
  const medFromDate = () => (lastMedCheck() ? addMonthsIso(lastMedCheck(), MED_FROM_MONTHS) : '');
  const daysUntil = (iso) => Math.round((new Date(iso + 'T12:00') - new Date(isoDate(today) + 'T12:00')) / 86400000);
  function medState() {
    const next = nextMedDate();
    if (!next) return { level: 'none', next };
    const days = daysUntil(next);
    const from = medFromDate();
    const open = daysUntil(from) <= 0;
    return { level: days < 0 ? 'bad' : days <= MED_WARN_DAYS ? 'warn' : open ? 'open' : 'ok', next, from, days, fromDays: daysUntil(from) };
  }
  const dayWord = (n) => `${n} ${Math.abs(n) === 1 ? 'dag' : 'dagen'}`;
  function renderMedical() {
    const st = medState();
    const when = st.next ? fmtDate(st.next, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const from = st.from ? fmtDate(st.from, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    $('medStatus').className = 'medstatus' + (st.level === 'warn' ? ' warn' : st.level === 'bad' ? ' bad' : '');
    $('medStatus').textContent = st.level === 'none' ? 'Nog geen controle ingevuld. Vul de datum van je laatste controle in.'
      : st.level === 'bad' ? `Je medische controle is te laat: die moest voor ${when} (${dayWord(-st.days)} geleden).`
      : st.level === 'warn' ? `Binnenkort: je volgende controle moet voor ${when} (nog ${dayWord(st.days)}).`
      : st.level === 'open' ? `Je volgende controle kan nu: ten laatste op ${when} (nog ${dayWord(st.days)}).`
      : `Volgende controle tussen ${from} en ${when} (kan over ${dayWord(st.fromDays)}).`;
    $('medBanner').hidden = !['open', 'warn', 'bad'].includes(st.level);
    $('medBanner').className = 'medbanner' + (st.level === 'bad' ? ' bad' : st.level === 'open' ? ' open' : '');
    $('medBanner').textContent = st.level === 'bad'
      ? `Medische controle te laat (sinds ${when}). Tik voor details.`
      : st.level === 'open' ? `Medische controle kan nu, ten laatste op ${when}.`
      : `Medische controle binnenkort: ten laatste op ${when} (nog ${dayWord(st.days || 0)}).`;
    const list = [...medChecks].sort((a, b) => b.date.localeCompare(a.date));
    $('medList').innerHTML = list.map((m) => `<li>
      <div class="li-main"><div class="d">${fmtDate(m.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        ${m.note ? `<div class="m">${escapeHtml(m.note)}</div>` : ''}</div>
      <button class="del" data-mid="${m.id}" aria-label="Verwijderen">✕</button></li>`).join('');
    $('medList').hidden = !list.length;
  }
  $('medAdd').addEventListener('click', () => {
    const date = $('medDate').value;
    if (!date) return alert('Kies de datum van je controle.');
    if (medChecks.some((m) => m.date === date)) return alert('Deze datum staat er al.');
    medChecks.push({ id: 'm' + Date.now().toString(36), date, note: $('medNote').value.trim() });
    save(KEY_MEDICAL, medChecks);
    $('medNote').value = '';
    render();
  });
  $('medList').addEventListener('click', (ev) => {
    const id = ev.target.closest('[data-mid]')?.dataset.mid;
    if (!id || !confirm('Deze controle verwijderen?')) return;
    medChecks = medChecks.filter((m) => m.id !== id);
    save(KEY_MEDICAL, medChecks);
    render();
  });
  $('medBanner').addEventListener('click', () => {
    document.querySelector('[data-fold="medisch"]').open = true;
    $('medCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // --- verlof ---------------------------------------------------------------
  const LEAVE_TYPES = { vakantie: 'jaarlijkse vakantie', 'anciënniteit': 'anciënniteitsverlof', herverdeling: 'herverdelingsdag (HV)', recup: 'recuperatiedag (recup)', ander: 'ander verlof' };
  const hvStats = () => Loon.hvLedger(entries, leave, settings.hvStart || {}, isoDate(today));
  const leaveEnabled = () => settings.status !== 'gelegenheid'; // rode kaart: geen verlof, wel Alfapas-teller
  const leaveOn = (iso) => (leaveEnabled() ? leave.find((l) => l.date === iso) : undefined);
  const newGroupId = () => 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const saveLeave = () => { leave.sort((a, b) => a.date.localeCompare(b.date)); save(KEY_LEAVE, leave); };
  // samen aangevraagde dagen als één blok tonen
  function leaveGroups() {
    const map = new Map();
    for (const l of [...leave].sort((a, b) => a.date.localeCompare(b.date))) {
      if (!map.has(l.g)) map.set(l.g, { g: l.g, type: l.type, days: [] });
      map.get(l.g).days.push(l.date);
    }
    return [...map.values()];
  }
  function leaveStats() {
    const todayIso = isoDate(today);
    const y = todayIso.slice(0, 4);
    const year = leave.filter((l) => l.date.startsWith(y) && l.type !== 'herverdeling' && l.type !== 'recup'); // HV en recup tellen niet als verlofdagen
    const quota = Number(settings.leaveQuota) || 0;
    const next = leaveGroups().find((g) => g.days[g.days.length - 1] >= todayIso);
    return { y, count: year.length, taken: year.filter((l) => l.date < todayIso).length, quota, left: quota ? quota - year.length : null, next };
  }
  const dayCount = (n) => `${n} ${n === 1 ? 'dag' : 'dagen'}`;
  const rangeText = (days, opts = { day: 'numeric', month: 'short' }) => (days.length === 1
    ? fmtDate(days[0], { weekday: 'short', ...opts })
    : `${fmtDate(days[0], opts)} – ${fmtDate(days[days.length - 1], opts)}`);
  function renderLeave() {
    const on = leaveEnabled();
    $('leaveCard').hidden = !on;
    if (!on) return;
    const st = leaveStats();
    const todayIso = isoDate(today);
    $('lvStatus').className = 'medstatus' + (st.left !== null && st.left < 0 ? ' warn' : '');
    $('lvStatus').textContent = `${st.y}: ${dayCount(st.count)} verlof aangevraagd`
      + (st.left !== null ? (st.left >= 0 ? `, nog ${dayCount(st.left)} over (van ${st.quota}).` : `, ${dayCount(-st.left)} meer dan je ${st.quota}.`) : '.')
      + (st.next ? ` Volgende: ${rangeText(st.next.days, { day: 'numeric', month: 'long' })}.` : '');
    // eerst wat nog komt (vroegste bovenaan), daarna wat voorbij is
    const all = leaveGroups().filter((g) => g.days[g.days.length - 1] >= `${st.y}-01-01`);
    const groups = [...all.filter((g) => g.days[g.days.length - 1] >= todayIso), ...all.filter((g) => g.days[g.days.length - 1] < todayIso).reverse()];
    $('lvList').innerHTML = groups.map((g) => {
      const past = g.days[g.days.length - 1] < todayIso;
      return `<li>
      <div class="li-main"><div class="d">${rangeText(g.days, { day: 'numeric', month: 'long' })}</div>
        <div class="m">${dayCount(g.days.length)} · ${LEAVE_TYPES[g.type] || 'verlof'}${past ? ' · voorbij' : ''}</div></div>
      <button class="del" data-lg="${g.g}" aria-label="Verwijderen">✕</button></li>`;
    }).join('');
    $('lvList').hidden = !groups.length;
    $('lvQuota').value = settings.leaveQuota || '';
    const hv = hvStats();
    const st0 = settings.hvStart || {};
    $('hvStatus').className = 'medstatus' + (hv.balance < 0 ? ' warn' : '');
    $('hvStatus').textContent = `Tegoed: ${dayCount(hv.balance)} HV`
      + (hv.planned ? ` (en ${hv.planned} gepland)` : '')
      + ` · nog ${hv.toNext} shift${hv.toNext === 1 ? '' : 'en'} tot je volgende (${hv.progress}/${hv.per}).`
      + (st0.date ? '' : ' Vul je tegoed van Cewez in, dan klopt het.');
    $('hvBal').value = st0.balance ?? '';
    $('hvCnt').value = st0.count ?? '';
    $('hvDate').value = st0.date || '';
  }
  function addLeave(from, to, type, saturdays) {
    const days = Loon.leaveDays(from, to, { saturdays, overrides: holidayOverrides }).filter((d) => !leave.some((l) => l.date === d));
    if (!days.length) return 0;
    const g = newGroupId();
    leave.push(...days.map((date) => ({ date, type, g })));
    saveLeave();
    return days.length;
  }
  $('lvAdd').addEventListener('click', () => {
    const from = $('lvFrom').value;
    const to = $('lvTo').value || from;
    if (!from) return alert('Kies de eerste verlofdag.');
    if (to < from) return alert('De laatste dag ligt voor de eerste dag.');
    const busy = entries.filter((e) => e.date >= from && e.date <= to).length;
    if (busy && !confirm(`Er staan al ${busy} shift(en) in die periode. Toch verlof opslaan?`)) return;
    const n = addLeave(from, to, $('lvType').value, $('lvSat').checked);
    if (!n) return alert('Geen nieuwe verlofdagen: zondagen en feestdagen tellen niet mee, en dagen die al verlof zijn ook niet.');
    $('lvFrom').value = ''; $('lvTo').value = '';
    render();
  });
  $('lvFrom').addEventListener('change', () => { if (!$('lvTo').value || $('lvTo').value < $('lvFrom').value) $('lvTo').value = $('lvFrom').value; });
  $('lvList').addEventListener('click', (ev) => {
    const g = ev.target.closest('[data-lg]')?.dataset.lg;
    if (!g || !confirm('Dit verlof verwijderen?')) return;
    leave = leave.filter((l) => l.g !== g);
    saveLeave();
    render();
  });
  $('hvStartBox').addEventListener('change', () => {
    const bal = numIn($('hvBal').value), cnt = numIn($('hvCnt').value);
    if (!Number.isFinite(bal) || bal < 0 || !Number.isFinite(cnt) || cnt < 0 || cnt >= 25) { renderLeave(); return alert('Vul een geldig tegoed in, en een teller van 0 tot 24 shiften.'); }
    settings.hvStart = { balance: Math.round(bal), count: Math.round(cnt), date: $('hvDate').value || isoDate(today) };
    save(KEY_SETTINGS, settings);
    render();
  });
  $('lvQuota').addEventListener('change', () => {
    const n = numIn($('lvQuota').value);
    if (!Number.isFinite(n) || n < 0) { renderLeave(); return alert('Vul een geldig aantal dagen in.'); }
    settings.leaveQuota = Math.round(n);
    save(KEY_SETTINGS, settings);
    render();
  });
  // niet gewerkt: verlof, HV of recup (niet voor rode kaart), of dop
  $('dayOffBtns').addEventListener('click', (ev) => {
    const type = ev.target.closest('[data-off]')?.dataset.off;
    if (!type) return;
    if (type === 'dop') {
      if (!dopPart(selected)) return alert('Op een dag met een volle shift (of afbestelling) is er geen dop. Bij een halve shift kan wel een halve dop.');
      dop.push(selected); saveDop();
    } else if (type === 'ander') {
      otherDays.push(selected); saveOther();
    } else {
      if (dayEntries(selected).length && !confirm('Op deze dag staat al een shift. Toch verlof zetten?')) return;
      leave.push({ date: selected, type, g: newGroupId() });
      saveLeave();
    }
    render();
  });
  $('dayOffDel').addEventListener('click', () => {
    if (leaveOn(selected)) { leave = leave.filter((l) => l.date !== selected); saveLeave(); }
    else if (dopOn(selected)) { dop = dop.filter((d) => d !== selected); saveDop(); }
    else { otherDays = otherDays.filter((d) => d !== selected); saveOther(); }
    render();
  });

  // --- dop (werkloosheid) -------------------------------------------------------
  const saveDop = () => { dop = [...new Set(dop)].sort(); save(KEY_DOP, dop); };
  const dopOn = (iso) => dop.includes(iso);
  // deel van een dag dop: wat er overblijft naast de shiften (volle shift of afbestelling = 1, halve = ½)
  const dopPart = (iso) => Math.max(0, 1 - dayEntries(iso).reduce((t, e) => t + (e.kind === 'half' ? 0.5 : 1), 0));
  function dopStats(prefix) {
    const n = dop.filter((d) => d.startsWith(prefix)).reduce((t, d) => t + dopPart(d), 0);
    const per = Number(settings.dopDay) || 0;
    return { n, per, amount: n * per };
  }
  const dopDays = (n) => `${String(n).replace('.', ',')} ${n === 1 ? 'dag' : 'dagen'} dop`;
  const dopText = (st) => dopDays(st.n) + (st.per && st.n ? ` · ± ${money(st.amount)}` : '');
  function renderDop() {
    const ym = `${viewYear}-${pad(viewMonth + 1)}`;
    const month = dopStats(ym);
    const year = dopStats(String(viewYear));
    const mName = fmtDate(`${ym}-01`, { month: 'long' });
    $('dopStatus').textContent = dop.length
      ? `${mName[0].toUpperCase() + mName.slice(1)}: ${dopText(month)}. Heel ${viewYear}: ${dopText(year)}.` + (year.per ? '' : ' Vul het bedrag per dag in om te zien wat je ongeveer krijgt.')
      : 'Nog geen dop. Tik in de kalender op een dag en kies Dop.';
    if (document.activeElement !== $('dopDay')) $('dopDay').value = settings.dopDay ? settings.dopDay.toFixed(2).replace('.', ',') : '';
    $('dopHint').textContent = settings.status === 'gelegenheid'
      ? 'Als gelegenheidshavenarbeider (rode kaart) ben je geen erkende havenarbeider: dop krijg je via de gewone werkloosheid van de RVA, als je daar recht op hebt. Op je controlekaart duid je de dagen aan waarop je in de haven werkte. Hier hou je bij op welke dagen je dop had en wat je ongeveer krijgt.'
      : settings.status === 'timetable'
        ? 'Time table: vraag dop aan in MyJob, tussen 01u00 en 12u30. Hier hou je bij op welke dagen je dop had en wat je ongeveer krijgt.'
        : 'Losse pool: meld je vóór 12u15 aan op MyJob. Word je niet aangeworven, dan krijg je dop. Hier hou je bij op welke dagen je dop had en wat je ongeveer krijgt.';
    $('dopLine').hidden = !month.n;
    $('dopLine').textContent = `Daarnaast ${dopText(month)} (niet meegeteld in bruto en netto).`;
  }
  $('dopCalc').addEventListener('click', () => {
    const paid = numIn($('dopPaid').value.replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, ''));
    const days = numIn($('dopPaidDays').value);
    if (!(paid > 0) || !(days > 0)) return alert('Vul het bedrag en het aantal dagen in.');
    settings.dopDay = Math.round((paid / days) * 100) / 100;
    save(KEY_SETTINGS, settings);
    $('dopPaid').value = ''; $('dopPaidDays').value = '';
    $('dopCalcBox').open = false;
    render();
  });

  // --- ander werk (rode kaart met een andere job) ----------------------------------
  const saveOther = () => { otherDays = [...new Set(otherDays)].sort(); save(KEY_OTHER_DAYS, otherDays); };
  const otherOn = (iso) => otherDays.includes(iso);
  // loon van de andere job in een jaar, uit de ingevulde maanden
  function otherPayYear(y) {
    const months = Object.keys(otherPay).filter((m) => m.startsWith(y + '-')).sort();
    return {
      months,
      taxable: round2(months.reduce((t, m) => t + (Number(otherPay[m].taxable) || 0), 0)),
      withholding: round2(months.reduce((t, m) => t + (Number(otherPay[m].withholding) || 0), 0)),
    };
  }
  const monthName = (ym) => fmtDate(`${ym}-01`, { month: 'long', year: 'numeric' });
  function fillOwMonths() {
    const opts = [];
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 0; i < 24; i++) {
      const ym = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      opts.push(`<option value="${ym}">${monthName(ym)}</option>`);
      d.setMonth(d.getMonth() - 1);
    }
    const cur = $('owMonth').value;
    $('owMonth').innerHTML = opts.join('');
    if (cur) $('owMonth').value = cur;
  }
  function renderOther() {
    const on = settings.status === 'gelegenheid' || otherDays.length > 0 || Object.keys(otherPay).length > 0;
    $('otherCard').hidden = !on;
    if (!on) return;
    if (!$('owMonth').options.length) fillOwMonths();
    const ym = `${viewYear}-${pad(viewMonth + 1)}`;
    const n = otherDays.filter((d) => d.startsWith(ym)).length;
    const yr = otherPayYear(String(viewYear));
    const mName = fmtDate(`${ym}-01`, { month: 'long' });
    $('owStatus').textContent = `${mName[0].toUpperCase() + mName.slice(1)}: ${n} ${n === 1 ? 'dag' : 'dagen'} ander werk. `
      + (yr.months.length ? `${viewYear}: loon van ${yr.months.length} ${yr.months.length === 1 ? 'maand' : 'maanden'} ingevuld (belastbaar ${money(yr.taxable)}), dat telt mee in je belastingbrief.`
        : `${viewYear}: nog geen loon van je andere job ingevuld.`);
    const sel = otherPay[$('owMonth').value] || {};
    for (const [id, k] of [['owTaxable', 'taxable'], ['owWithholding', 'withholding']]) {
      if (document.activeElement !== $(id)) $(id).value = sel[k] ? sel[k].toFixed(2).replace('.', ',') : '';
    }
    const months = Object.keys(otherPay).sort().reverse().slice(0, 12);
    $('owList').innerHTML = months.map((m) => `<li><div class="li-main"><div class="d">${monthName(m)}</div>
      <div class="m">belastbaar ${money(otherPay[m].taxable || 0)} · voorheffing ${money(otherPay[m].withholding || 0)}</div></div>
      <button type="button" class="linkbtn" data-owedit="${m}">aanpassen</button></li>`).join('');
    $('owList').hidden = !months.length;
  }
  $('owMonth').addEventListener('change', renderOther);
  for (const [id, k] of [['owTaxable', 'taxable'], ['owWithholding', 'withholding']]) {
    $(id).addEventListener('change', () => {
      const v = $(id).value.trim();
      const n = v ? numIn(v.replace(/\s|€/g, '').replace(/\.(?=\d{3}(\D|$))/g, '')) : 0;
      if (!Number.isFinite(n) || n < 0) { renderOther(); return alert('Vul een geldig bedrag in, bv. 1.234,56.'); }
      const m = $('owMonth').value;
      const e = { ...(otherPay[m] || {}) };
      if (n) e[k] = round2(n); else delete e[k];
      if (Object.keys(e).length) otherPay[m] = e; else delete otherPay[m];
      save(KEY_OTHER_PAY, otherPay);
      render();
    });
  }
  $('owList').addEventListener('click', (ev) => {
    const m = ev.target.closest('[data-owedit]')?.dataset.owedit;
    if (!m) return;
    if (![...$('owMonth').options].some((o) => o.value === m)) $('owMonth').insertAdjacentHTML('beforeend', `<option value="${m}">${monthName(m)}</option>`);
    $('owMonth').value = m;
    renderOther();
    $('owTaxable').focus();
  });

  $('dopDay').addEventListener('change', () => {
    const v = $('dopDay').value.trim();
    const n = v ? Number(v.replace(/\s|€/g, '').replace(',', '.')) : 0;
    if (!Number.isFinite(n) || n < 0) { $('dopDay').value = ''; return alert('Vul een geldig bedrag in, bv. 62,50.'); }
    settings.dopDay = Math.round(n * 100) / 100;
    save(KEY_SETTINGS, settings);
    render();
  });

  // oud: bewaard werkaanbod van cewez.be opruimen (de app haalt het niet meer op)
  try { localStorage.removeItem('haven-werkuren.werkaanbod'); } catch { /* geen opslag */ }
  // bleef de app open staan tot een andere dag, dan "vandaag" opnieuw bepalen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const now = new Date();
    if (now.toDateString() === today.toDateString()) return;
    const wasToday = selected === isoDate(today);
    today = now;
    if (wasToday) selectDay(isoDate(today), false); else render();
  });

  // --- kaaien ----------------------------------------------------------------------
  // onthaalbrochures van de havenfirma's (cewez.be › Wegwijs in de haven)
  const BROCHURES = {
    'sea-invest': 'https://cewez.be/wp-content/uploads/2026/02/onthaal-brochure-BNFW.pdf',
    cldn: 'https://cewez.be/wp-content/uploads/2025/07/Onthaalbrochure-havenarbeiders-Zeebrugge-CLDN.pdf',
    cosco: 'https://cewez.be/wp-content/uploads/2026/05/Onthaalbrochure-CSP.pdf',
    'dp-world': 'https://cewez.be/wp-content/uploads/2025/12/onthaalbrochure-HA-DPW-Zeebrugge-2025.pdf',
    depre: 'https://cewez.be/wp-content/uploads/2025/06/DSH-Onthaalbrochure-2024.pdf',
    hoppe: 'https://cewez.be/wp-content/uploads/2026/04/Hoppe-onthaalbrochure-2026.pdf',
    ico: 'https://cewez.be/wp-content/uploads/2025/04/Onthaalbrochure-ICO.pdf',
    intertrans: 'https://cewez.be/wp-content/uploads/2025/07/Onboardingsbrochure_havenarbeiders-intertrans.pdf',
    ndq: 'https://cewez.be/wp-content/uploads/2025/06/NDQ-20250516-NDQ-2D05-onthaalbrochure_2.pdf',
    ossco: 'https://cewez.be/wp-content/uploads/2025/06/OSSCO-Onthaalbrochure-nieuwe-medewerkers-20231130.pdf',
    'po-ferries': 'https://cewez.be/wp-content/uploads/2025/07/Onthaal-PO-ferries-versie-2025-Reyn-Hungenaert_.pdf',
    psa: 'https://cewez.be/wp-content/uploads/2025/09/20250731-v19-PSAZ-Onthaalbrochure-havenarbeid.pdf',
    seabridge: 'https://cewez.be/wp-content/uploads/2025/04/Onthaalbrochure-Seabridge.pdf',
    'van-der-vlist': 'https://cewez.be/wp-content/uploads/2025/06/Vandervlist-Onthaalbrochure-2024.pdf',
    wwl: 'https://cewez.be/wp-content/uploads/2025/06/EU_ZEE_HRM_01.002-Welkom-brochure-arbeiders-WW.pdf',
  };
  // terminalplannen (met parkings) in de onthaalbrochures: [bedrijf, naam, bladzijde, uitleg]
  const TERMINAL_PLANS = [
    ['ico', 'ICO Noordelijk Insteekterminal (NIT)', 22, 'parkings in zones, gates'],
    ['ico', 'ICO Bastenaken terminal', 23, 'alle parkingrijen'],
    ['ico', 'ICO Hanze terminal (K519-525)', 24, 'parkingrijen langs de kaai'],
    ['ico', 'ICO Toyota terminal', 25, 'parkingrijen en vakken'],
    ['cldn', 'CLdN terminals in Zeebrugge', 8, 'Albert II-dok, Britanniadok, Hermeskaai, Minerva (autoparking), Canadakaai (autoschepen, parking)'],
    ['cldn', 'CLdN Britanniadok', 9, 'car deck voor 4.000 auto\'s, parking havenarbeiders'],
    ['cldn', 'CLdN Canadakaai', 11, 'terreinen voor 23.000 auto\'s, parking havenarbeiders'],
    ['cosco', 'CSP terminal (plattegrond)', 5, 'met personeelsparking'],
    ['depre', 'Depre (DSH) grondplan', 7, 'loodsen, kantoor, parking'],
  ].map(([co, name, page, note]) => ({ co, name, page, note, url: `${BROCHURES[co]}#page=${page}` }));
  function renderKaaien() {
    $('planList').innerHTML = TERMINAL_PLANS.map((t) => `<li>${logoHtml(t.co, '', 'li-logo')}
      <div class="li-main"><div class="d">${escapeHtml(t.name)}</div>
        <div class="m">${escapeHtml(t.note)} · blz. ${t.page}</div>
        <div class="navbtns"><a href="${t.url}" target="_blank" rel="noopener">Plan openen</a></div></div></li>`).join('');
  }

  // --- bedrijven: extra info per bedrijf ------------------------------------------
  const openInfo = new Set(); // welke vakken open staan, blijft zo na opnieuw tekenen
  function renderCoInfo() {
    const todayIso = isoDate(today);
    const year = todayIso.slice(0, 4);
    const used = {};
    for (const e of entries) if (e.company) used[e.company] = (used[e.company] || 0) + 1;
    const list = visibleCompanies().map((c, i) => ({ c, i })).sort((a, b) => (used[b.c.id] || 0) - (used[a.c.id] || 0) || a.c.name.localeCompare(b.c.name)).map((x) => x.c);
    $('coInfo').innerHTML = list.map((c) => {
      const mine = entries.filter((e) => e.company === c.id);
      const mineYear = mine.filter((e) => e.date.startsWith(year));
      const t = totals(mineYear);
      const last = mine.map((e) => e.date).sort().pop();
      const funcs = [...new Set(mine.map((e) => Loon.functionOf(e.func).label))];
      const places = locationsOf(c.id).map((l) => `<p class="ci-place"><b>${escapeHtml(l.name || c.name)}</b><br>${escapeHtml(l.address || 'geen adres')} ${routeLink(c.id, l.id)}</p>`).join('');
      const calls = callButtons(c.id);
      return `<details class="coinfo" data-ci="${c.id}"${openInfo.has(c.id) ? ' open' : ''}>
        <summary>${logoHtml(c.id, '', 'li-logo')}<span class="ci-name"><b>${escapeHtml(c.name)}</b>
          <small>${mine.length ? `${mine.length} shift${mine.length === 1 ? '' : 'en'} gewerkt` : 'nog niet gewerkt'}</small></span></summary>
        <div class="ci-body">
          <div><h4>Adres</h4>${places || '<p>Nog geen adres. Vul het in bij Instellingen › Bedrijven beheren.</p>'}</div>
          <div><h4>Bellen</h4>${calls ? `<div class="calls">${calls}</div>` : '<p>Nog geen nummer.</p>'}</div>
          ${TERMINAL_PLANS.some((t) => t.co === c.id) ? `<div><h4>Terminalplannen</h4><div class="navbtns">${TERMINAL_PLANS.filter((t) => t.co === c.id).map((t) => `<a href="${t.url}" target="_blank" rel="noopener">${escapeHtml(t.name.replace(/^(ICO|CLdN|CSP|Depre \(DSH\)) /, ''))} · blz. ${t.page}</a>`).join('')}</div></div>` : ''}
          ${BROCHURES[c.id] ? `<div><h4>Onthaalbrochure</h4><div class="navbtns"><a href="${BROCHURES[c.id]}" target="_blank" rel="noopener">Brochure openen (PDF)</a></div></div>` : ''}
          <div><h4>Jouw shiften</h4>${mine.length ? `<div class="ci-stats">
              <div><b>${mineYear.length}</b><span>shiften ${year}</span></div>
              <div><b>${money(t.bruto).replace(/,\d\d$/, '')}</b><span>bruto ${year}</span></div>
              <div><b>${last ? fmtDate(last, { day: 'numeric', month: 'short' }) : '–'}</b><span>laatst gewerkt</span></div></div>
              ${funcs.length ? `<p style="margin-top:6px">Functies: ${funcs.map(escapeHtml).join(', ')}</p>` : ''}` : '<p>Je hebt hier nog geen shiften ingevuld.</p>'}
              ${markagePremie[c.id] ? `<p style="margin-top:6px">Premie markage: ${money(markagePremie[c.id])} (zelf ingevuld)</p>` : ''}
              ${lashPremie[c.id] ? `<p style="margin-top:6px">Premie lashing: ${money(lashPremie[c.id])} (zelf ingevuld)</p>` : ''}</div>
          <div><h4>Mijn notities</h4><textarea data-cinote="${c.id}" rows="3" placeholder="bv. naam ploegbaas, parking, kantine, kledij nodig…" aria-label="Notities ${escapeHtml(c.name)}">${escapeHtml(companyNotes[c.id] || '')}</textarea></div>
        </div></details>`;
    }).join('');
  }
  $('coInfo').addEventListener('toggle', (ev) => {
    const d = ev.target.closest?.('[data-ci]');
    if (!d) return;
    if (d.open) openInfo.add(d.dataset.ci); else openInfo.delete(d.dataset.ci);
  }, true);
  $('coInfo').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-cinote]');
    if (!el) return;
    const v = el.value.trim();
    if (v) companyNotes[el.dataset.cinote] = v; else delete companyNotes[el.dataset.cinote];
    save(KEY_CO_NOTES, companyNotes);
  });

  // --- snel overzicht bovenaan ----------------------------------------------
  function renderDash() {
    const todayIso = isoDate(today);
    // eerstvolgende uitbetaling (of de laatste als er niets meer komt)
    const all = Object.values(calc.periods).sort((a, b) => a.payment.date.localeCompare(b.payment.date));
    const r = all.find((x) => x.payment.date >= todayIso) || all[all.length - 1];
    if (r) {
      const coming = r.payment.date >= todayIso;
      $('dPayK').textContent = coming ? 'Volgende uitbetaling' : 'Laatste uitbetaling';
      $('dPay').textContent = money(r.netto);
      $('dPayM').textContent = `${rangeText([r.period.start, r.period.end])} · ${r.shifts.length} shift${r.shifts.length === 1 ? '' : 'en'}`
        + ` · ${r.payment.approx ? 'rond' : coming ? 'uiterlijk' : 'op'} ${fmtDate(r.payment.date, { weekday: 'short', day: 'numeric', month: 'short' })}`
        + (r.estimate ? ' · schatting' : '');
    } else {
      $('dPayK').textContent = 'Volgende uitbetaling';
      $('dPay').textContent = money(0);
      $('dPayM').textContent = 'Tik op een dag in de kalender om je shift in te vullen.';
    }
    const mt = totals(monthEntries(today.getFullYear(), today.getMonth()));
    $('dMonthK').textContent = 'Netto ' + fmtDate(`${todayIso.slice(0, 7)}-01`, { month: 'long' });
    $('dMonth').textContent = money(mt.netto);
    const md = dopStats(todayIso.slice(0, 7));
    $('dMonthM').textContent = `${mt.shifts} shift${mt.shifts === 1 ? '' : 'en'} · ${money(mt.bruto)} bruto` + (md.n ? ` · ${dopDays(md.n)}` : '');

    const l = Loon.clothingLedger(entries, purchases, clothingStart);
    $('dCloth').textContent = l.balance;
    $('dClothM').textContent = l.balance >= l.max ? `maximum (${l.max}) bereikt: haal kledij af` : `punten · max ${l.max}`;
    $('dClothTile').className = 'tile' + (l.balance >= l.max || l.balance < 0 ? ' warn' : '');

    const st = medState();
    $('dMedTile').className = 'tile' + (st.level === 'warn' ? ' warn' : st.level === 'bad' ? ' bad' : '');
    if (st.level === 'none') { $('dMed').textContent = '—'; $('dMedM').textContent = 'datum nog invullen'; }
    else {
      $('dMed').textContent = fmtDate(st.next, { day: 'numeric', month: 'short', year: 'numeric' });
      $('dMedM').textContent = st.days < 0 ? `${dayWord(-st.days)} te laat`
        : st.level === 'ok' ? `ten laatste · kan vanaf ${fmtDate(st.from, { day: 'numeric', month: 'short' })}`
        : `ten laatste · kan nu (nog ${dayWord(st.days)})`;
    }

    const on = leaveEnabled();
    $('dLeaveTile').hidden = !on;
    $('dAlfaTile').hidden = on;
    if (!on) {
      const ALFA_DAYS = 30;
      if (!settings.alfaStart) { $('dAlfa').textContent = `0 / ${ALFA_DAYS}`; $('dAlfaM').textContent = 'tik om de startdatum in te vullen'; }
      else {
        const days = Loon.workedDays(entries, settings.alfaStart, todayIso);
        const n = days.length;
        $('dAlfa').textContent = n >= ALFA_DAYS ? `${ALFA_DAYS} / ${ALFA_DAYS} ✓` : `${n} / ${ALFA_DAYS}`;
        $('dAlfaM').textContent = n >= ALFA_DAYS
          ? `bereikt op ${fmtDate(days[ALFA_DAYS - 1], { day: 'numeric', month: 'short', year: 'numeric' })}`
          : `gewerkte dagen sinds ${fmtDate(settings.alfaStart, { day: 'numeric', month: 'short', year: 'numeric' })} · nog ${ALFA_DAYS - n}`;
      }
      $('dAlfaTile').className = 'tile' + (settings.alfaStart && Loon.workedDays(entries, settings.alfaStart, todayIso).length >= ALFA_DAYS ? ' leave' : '');
    }
    if (on) {
      const ls = leaveStats();
      $('dLeave').textContent = ls.left !== null ? `${ls.left} over` : dayCount(ls.count);
      const hv = hvStats();
      $('dLeaveM').textContent = (ls.next ? `volgende: ${rangeText(ls.next.days)}`
        : ls.count ? `aangevraagd in ${ls.y}` : 'nog geen verlof ingevuld')
        + ` · HV: ${hv.balance} (nog ${hv.toNext} shiften)`;
    }
  }
  $('dash').addEventListener('click', (ev) => {
    const id = ev.target.closest('[data-go]')?.dataset.go;
    if (!id) return;
    const card = $(id);
    const fold = card.querySelector('details.fold');
    if (fold) fold.open = true;
    const inner = ev.target.closest('[data-open]')?.dataset.open;
    if (inner) document.querySelector(`[data-fold="${inner}"]`).open = true;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // --- kledijpunten -------------------------------------------------------
  const pointsText = (n) => `${n} punt${Math.abs(n) === 1 ? '' : 'en'}`;
  function clothingLabel(e) {
    const n = Loon.clothingPointsFor(e);
    return n ? `+${pointsText(n)} kledij` : '';
  }
  const PACKS = { minimum: 'Minimumpakket', basis: 'Basispakket', aanvullend: 'Aanvullend pakket' };

  function renderClothing() {
    const l = Loon.clothingLedger(entries, purchases, clothingStart);
    $('clBalance').textContent = pointsText(l.balance);
    $('clBalance').classList.toggle('ot', l.balance < 0);
    $('clMax').textContent = `(max ${l.max})`;
    $('clInfo').textContent = clothingStart.date
      ? `Sinds je loonbrief van ${fmtDate(clothingStart.date)}: +${l.earned} opgebouwd, −${l.spent} afgehaald.`
      : `Opgebouwd: ${l.earned} · afgehaald: ${l.spent}. Vul onderaan het saldo van je loonbrief in, dan klopt het met Cewez.`;
    const warn = [];
    if (l.balance >= l.max) warn.push(`Je zit aan het maximum van ${l.max} punten: nieuwe punten gaan verloren. Haal eerst kledij af.`);
    else if (l.lost) warn.push(`${pointsText(l.lost)} verloren omdat je saldo aan het maximum zat.`);
    if (l.balance < 0) warn.push('Je saldo staat in min. Dat mag enkel voor één artikel uit het basispakket.');
    $('clWarn').hidden = !warn.length;
    $('clWarn').textContent = warn.join(' ');

    const cur = $('clItem').value;
    $('clItem').innerHTML = Object.entries(PACKS).map(([pack, title]) => `<optgroup label="${title}">${
      Loon.CLOTHING_ITEMS.filter((i) => i.pack === pack).map((i) => {
        const short = i.points - l.balance;
        return `<option value="${i.id}">${escapeHtml(i.name)} · ${i.points} p${short > 0 ? ` (nog ${short} tekort)` : ''}</option>`;
      }).join('')}</optgroup>`).join('');
    if (cur) $('clItem').value = cur;

    const list = [...purchases].sort((a, b) => b.date.localeCompare(a.date));
    $('clList').innerHTML = list.map((p) => `<li>
      <div class="li-main"><div class="d">${escapeHtml(p.name)}</div>
        <div class="m">${fmtDate(p.date)}${p.free ? ' · gratis vervangen' : ''}${clothingStart.date && p.date <= clothingStart.date ? ' · zit al in je loonbriefsaldo' : ''}</div></div>
      <div class="li-amt">${p.free ? '0' : '−' + p.points} p</div>
      <button class="del" data-pid="${p.id}" aria-label="Verwijderen">✕</button></li>`).join('');
    $('clList').hidden = !list.length;
    $('clStartPts').value = clothingStart.points || '';
    $('clStartDate').value = clothingStart.date || '';
  }

  $('clAdd').addEventListener('click', () => {
    const item = Loon.CLOTHING_ITEMS.find((i) => i.id === $('clItem').value);
    const date = $('clDate').value;
    if (!item || !date) return alert('Kies een artikel en een datum.');
    const free = $('clFree').checked;
    const before = Loon.clothingLedger(entries, purchases, clothingStart).balance;
    if (!free && before - item.points < 0
      && !confirm(`Niet genoeg punten: je saldo wordt ${before - item.points}. Toch opslaan?`)) return;
    purchases.push({ id: 'k' + Date.now().toString(36), date, itemId: item.id, name: item.name, points: item.points, free });
    save(KEY_PURCHASES, purchases);
    $('clFree').checked = false;
    renderClothing();
  });
  $('clList').addEventListener('click', (ev) => {
    const id = ev.target.closest('[data-pid]')?.dataset.pid;
    if (!id || !confirm('Deze afgehaalde kledij verwijderen?')) return;
    purchases = purchases.filter((p) => p.id !== id);
    save(KEY_PURCHASES, purchases);
    renderClothing();
  });
  $('clStartBox').addEventListener('change', () => {
    const pts = Number($('clStartPts').value.trim() || 0);
    if (!Number.isFinite(pts)) { renderClothing(); return alert('Vul een geldig aantal punten in.'); }
    clothingStart = { date: $('clStartDate').value, points: pts };
    save(KEY_CLOTH_START, clothingStart);
    renderClothing();
  });

  // --- uitleg: als app installeren, delen, opslaan -------------------------
  const APP_URL = location.origin + location.pathname;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const os = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios'
    : /android/i.test(navigator.userAgent) ? 'android' : '';
  let installPrompt = null;
  // --- wat is er nieuw -----------------------------------------------------------
  // Nieuwste bovenaan. Bij elke nieuwe functie hier een regel toevoegen.
  const NEWS = [
    ['2026-10-08', [
      'De app heet nu alleen Haven Werkuren en krijgt een nieuw webadres. Het is geen app van Cewez.',
      'Weggehaald: het werkaanbod, de nummers van de aanwervers en de bedrijfsingangen (kijk daarvoor op cewez.be of in MyJob), de logo\'s van de bedrijven en de teller.',
      'Nieuwe privacyverklaring: onderaan de pagina en in het uitlegscherm.',
      'Rode kaart met een andere job: duid die dagen aan als Ander werk en vul elke maand het loon van die job in. De schatting van je belastingbrief telt het mee.',
      'Dop: reken je bedrag per dag uit met je laatste betaling van de vakbond of de HVW.',
      'Contact, Fout melden en Voorstel doen: kies of je een antwoord wil, via e-mail, WhatsApp of sms (optioneel).',
      'Niet gewerkt? Kies in de dag Verlof, HV, Recup of Dop. Recup is nieuw als soort verlof.',
      'Dop (werkloosheid) bijhouden: de dagen staan in de kalender. Vul je bedrag per dag in om te zien wat je ongeveer krijgt.',
      'Premie lashing: sommige bedrijven betalen lashers meer. Vink het aan bij je shift en vul het bedrag in; de app onthoudt het per bedrijf.',
      'Premie markage: het bedrag verschilt per bedrijf. Je vult het nu zelf in (zoals op je loonbrief) en de app onthoudt het per bedrijf.',
    ]],
    ['2026-10-07', [
      'Contact onderaan, en Fout melden en Voorstel doen: onderwerp, bericht en een foto of bestand. Je bericht gaat rechtstreeks naar de maker, zonder account.',
      'Jouw instellingen (statuut, woonplaats, gezin) meteen invullen in dit uitlegscherm.',
      'Nieuwe functies: markeerders, jumbobediener, uitwijzer, stouwbreker-zetter, en foreman en ceelbaas met hun eigen loon. Premie markage voor markeerders.',
      'Knop "Voorstel doen" bovenaan: stuur een idee voor de app.',
      'Herverdelingsdagen (HV) bijhouden voor losse pool en time table: tegoed en hoeveel shiften tot je volgende (bij Verlof).',
      'Wat is er nieuw: dit lijstje bij het openen van de app.',
      'Kalender: de bedragen in de dagvakjes worden niet meer afgekapt, en "vandaag" springt mee na middernacht.',
    ]],
    ['2026-10-06', [
      'Bedrijven bellen voor werk: knop bovenaan met de nummers die je zelf invult.',
      'Kaaien: plannen van de haven en terminalplannen met parkings.',
      'Bedrijven: per bedrijf adres, nummers, onthaalbrochure, je eigen shiften en notities.',
      'Statuut rode kaart, losse pool of time table, met Alfapas-teller voor rode kaart.',
      'Medische controle: kan vanaf 10 maanden, moet binnen 12 maanden.',
      'Loonbrief, loonfiche of aanslagbiljet fotograferen: de app leest de bedragen.',
      'Nieuw ontwerp, en kalender en dag bovenaan met de rest netjes gegroepeerd eronder.',
    ]],
    ['2026-10-05', [
      'Overzicht bovenaan, verlof bijhouden en uitbetalingsdagen in de kalender.',
      'Netto met de officiële sleutelformule, schatting van je belastingbrief en instelbare belastingbedragen.',
    ]],
  ];
  const KEY_NEWS_SEEN = 'haven-werkuren.newsSeen';
  function renderNews() {
    const seen = load(KEY_NEWS_SEEN, '');
    const show = (all) => NEWS.slice(0, all ? NEWS.length : 2).map(([d, items]) => `<div class="news-day">
      <b>${fmtDate(d, { weekday: 'short', day: 'numeric', month: 'long' })}</b>${seen && d > seen ? '<span class="news-new">nieuw</span>' : ''}
      <ul>${items.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>`).join('')
      + (!all && NEWS.length > 2 ? '<button type="button" class="linkbtn" id="newsMore">Ouder nieuws tonen</button>' : '');
    $('newsList').innerHTML = show(false);
    $('newsFold').open = false; // standaard dichtgeklapt
    $('newsBadge').hidden = !(seen && NEWS[0][0] > seen);
    $('newsMore')?.addEventListener('click', () => { $('newsList').innerHTML = show(true); });
    save(KEY_NEWS_SEEN, NEWS[0][0]);
  }

  // --- jouw instellingen in het uitlegscherm (eerste keer open) ----------------------
  const STATUS_NAMES = { gelegenheid: 'rode kaart', pool: 'losse pool', timetable: 'time table' };
  function renderQuick() {
    $('qPlace').innerHTML = $('sPlace').innerHTML;
    for (const el of document.querySelectorAll('[data-q]')) {
      const v = settings[el.dataset.q];
      el.value = el.dataset.t === 'num' ? (v ? String(v) : '') : (v ?? '');
    }
    $('qPlaceWrap').hidden = settings.transport !== 'auto';
    $('quickSum').textContent = `${STATUS_NAMES[settings.status] || ''} · ${settings.transport === 'fiets' ? 'fiets' : settings.place || ''} · ${CIVIL_NAMES[settings.civil] || ''}${Number(settings.kids) ? ` · ${settings.kids} kind(eren)` : ''}`;
  }
  $('quickBox').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-q]');
    if (!el) return;
    let v = el.value;
    if (el.dataset.t === 'num') { v = v.trim() ? Number(v.replace(',', '.')) : 0; if (!Number.isFinite(v) || v < 0) { renderQuick(); return; } }
    settings[el.dataset.q] = v;
    save(KEY_SETTINGS, settings);
    save('haven-werkuren.quickDone', true);
    renderQuick(); renderSettings(); render();
    $('quickSaved').hidden = false;
  });

  function openWelcome() {
    renderNews();
    renderQuick();
    // de eerste keer open, daarna dichtgeklapt (met een samenvatting)
    $('quickFold').open = !load('haven-werkuren.quickDone', false) && !load(KEY_SETTINGS, null);
    $('quickSaved').hidden = true;
    // jouw toestel eerst en gemarkeerd; geïnstalleerd: geen installatie-uitleg meer nodig
    const howtos = [...document.querySelectorAll('#welcome .howto')];
    for (const h of howtos) { h.hidden = standalone; h.classList.toggle('mine', h.dataset.os === os); }
    const mine = howtos.find((h) => h.dataset.os === os);
    if (mine) mine.parentNode.insertBefore(mine, howtos[0]);
    $('welcomeIntro').textContent = standalone
      ? 'Je gebruikt de app al vanaf je beginscherm. Hieronder lees je hoe je hem deelt en hoe je gegevens bewaard worden.'
      : 'Zet de app op je beginscherm. Dan opent hij als een gewone app, zonder adresbalk, en werkt hij ook met slecht bereik op de kaai.';
    $('installBtn').hidden = standalone || !installPrompt;
    $('shareMsg').hidden = true;
    if (typeof $('welcome').showModal === 'function') $('welcome').showModal();
    else $('welcome').setAttribute('open', '');
  }
  $('helpBtn').addEventListener('click', openWelcome);
  // klikken naast het venster sluit het ook
  $('welcome').addEventListener('click', (ev) => { if (ev.target === $('welcome')) $('welcome').close(); });
  // Android/Chrome: eigen installatieknop
  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    installPrompt = ev;
    if ($('welcome').open) $('installBtn').hidden = false;
  });
  $('installBtn').addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    installPrompt = null;
    $('installBtn').hidden = true;
  });
  $('shareBtn').addEventListener('click', async () => {
    const msg = (t) => { $('shareMsg').textContent = t; $('shareMsg').hidden = false; };
    const data = { title: 'Haven Werkuren', text: 'Hou je shiften, overuren en netto bij met Haven Werkuren:', url: APP_URL };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(APP_URL);
      msg('Link gekopieerd. Plak hem in een bericht naar je collega.');
    } catch (err) {
      if (err && err.name === 'AbortError') return; // delen geannuleerd
      msg(`Kopieer deze link: ${APP_URL}`);
    }
  });

  // oud: markeringen van de teller (die is weg) opruimen
  try { ['haven-werkuren.deviceCounted', 'haven-werkuren.firstSeen'].forEach((k) => localStorage.removeItem(k)); } catch { /* geen opslag */ }

  // --- bericht naar de maker: Fout melden, Voorstel doen en Contact ----------
  // Via FormSubmit (formsubmit.co), dat het formulier per e-mail doorstuurt.
  // MAIL_ID is de code die FormSubmit gaf na het activeren: die staat in de plaats van het
  // e-mailadres, zodat niemand het adres in de app kan zien. Leeg = nog niet ingesteld.
  const MAIL_ID = '2154e4c40409c56632c740e6a6f1b9bb';
  const MAIL_MAX = 10 * 1024 * 1024; // FormSubmit: bestanden samen max 10 MB
  // extra regels in de mail, per plaats in de app (veldnamen zonder spaties: FormSubmit maakt er _ van)
  const mailExtra = {
    'Fout melden': () => {
      const x = { 'App-versie': `${APP_VERSION} · statuut: ${settings.status || ''} · als app: ${standalone ? 'ja' : 'nee'} · scherm: ${screen.width}×${screen.height}`, Toestel: navigator.userAgent };
      if ($('bugDay').checked) {
        const list = entries.filter((e) => e.date === selected);
        x.Dag = [fmtDate(selected, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), ...(list.length ? list.map((e) => {
          const sh = shiftOf(e);
          return `${entryTitle(e)}; ${{ full: 'volle shift', half: 'halve shift', afbestel: 'afbestelling' }[e.kind] || e.kind}; overuren: ${fmtHours(overtimeOf(e))}; bruto ${money(sh.bruto)}; netto ± ${money(sh.netto)}`;
        }) : ['geen shiften'])].join('\n');
      }
      return x;
    },
    'Voorstel doen': () => ({ 'App-versie': `${APP_VERSION} · statuut: ${settings.status || ''}` }),
    Contact: () => ({ 'App-versie': APP_VERSION }),
  };
  // alle velden van de mail, in volgorde: datum en plaats bovenaan, dan wat de gebruiker schreef
  function mailFields(form, place, reply) {
    const subject = form.elements.Onderwerp.value.trim();
    const f = [
      ['Datum', new Date().toLocaleString('nl-BE', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Brussels' })],
      ['Plaats', place], ['Onderwerp', subject], ['Bericht', form.elements.Bericht.value.trim()],
    ];
    if (reply) {
      f.push(['Antwoord', `${REPLY_VIA[reply.via]}: ${reply.addr}`]);
      if (reply.via === 'whatsapp') f.push(['WhatsApp', `https://wa.me/${waNumber(reply.addr)}`]);
    }
    f.push(...Object.entries(mailExtra[place]()));
    f.push(['_subject', `HAVEN APP (${place})(${subject})`], ['_template', 'table'], ['_captcha', 'false']);
    if (reply?.via === 'email') f.push(['_replyto', reply.addr]); // zo kan de maker gewoon op de mail antwoorden
    return f;
  }
  // Zonder bestand: via de AJAX-ingang van FormSubmit, die met JSON zegt of het gelukt is.
  // Met een bestand: als gewoon formulier in een verborgen frame (de AJAX-ingang laat bijlagen vallen).
  function sendMail(form, place, reply) {
    const fields = mailFields(form, place, reply);
    return form.elements.attachment.files.length ? sendFrame(form, fields) : sendAjax(fields);
  }
  async function sendAjax(fields) {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${MAIL_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(fields)),
      });
      const data = await res.json().catch(() => ({}));
      return res.ok && String(data.success) === 'true';
    } catch { return false; }
  }
  // FormSubmit stuurt na het versturen door naar verstuurd.html op onze eigen site: staat dat in het
  // frame, dan is het gelukt. Staat er ergens een e-mailadres in, dan toont FormSubmit altijd zijn
  // eigen bedankpagina; dan geldt die pagina als gelukt.
  function sendFrame(form, fields) {
    return new Promise((resolve) => {
      const frame = $('mailFrame');
      const added = [];
      const add = (name, value, first) => {
        const i = document.createElement('input');
        i.type = 'hidden'; i.name = name; i.value = value;
        if (first) form.prepend(i); else form.append(i);
        added.push(i);
      };
      // Onderwerp en Bericht staan al in het formulier; datum en plaats ervoor, de rest erna
      const rest = fields.filter(([k]) => k !== 'Onderwerp' && k !== 'Bericht');
      for (const [k, v] of rest.filter(([k]) => k === 'Datum' || k === 'Plaats').reverse()) add(k, v, true);
      for (const [k, v] of rest.filter(([k]) => k !== 'Datum' && k !== 'Plaats')) add(k, v);
      add('_next', new URL('verstuurd.html', location.href).href);
      const thanksPage = fields.some(([, v]) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v));
      let timer, grace;
      const done = (ok) => {
        clearTimeout(timer); clearTimeout(grace);
        frame.removeEventListener('load', onLoad);
        added.forEach((i) => i.remove());
        resolve(ok);
      };
      function onLoad() {
        let ours = false;
        try { ours = frame.contentWindow.location.pathname.endsWith('/verstuurd.html'); } catch { /* pagina van formsubmit.co */ }
        if (ours || thanksPage) return done(true);
        // een pagina van FormSubmit (fout, of nog onderweg): even wachten of de doorverwijzing nog komt
        clearTimeout(grace);
        grace = setTimeout(() => done(false), 10000);
      }
      frame.addEventListener('load', onLoad);
      timer = setTimeout(() => done(false), 120000);
      form.action = `https://formsubmit.co/${MAIL_ID}`;
      form.method = 'post';
      form.enctype = 'multipart/form-data';
      form.target = 'mailFrame';
      form.submit();
    });
  }
  const REPLY_VIA = { email: 'E-mail', whatsapp: 'WhatsApp', sms: 'Sms' };
  // gsm-nummer voor een WhatsApp-link: 0470 12 34 56 -> 32470123456
  function waNumber(s) {
    let d = s.replace(/[^\d+]/g, '');
    if (d.startsWith('+')) d = d.slice(1);
    else if (d.startsWith('00')) d = d.slice(2);
    else if (d.startsWith('0')) d = '32' + d.slice(1);
    return d.replace(/\D/g, '');
  }
  let mailBusy = false;
  for (const form of document.querySelectorAll('form.mailform')) {
    const out = form.querySelector('.mailmsg');
    const say = (t) => { out.textContent = t; out.hidden = !t; };
    form.addEventListener('input', () => { if (!mailBusy) say(''); });
    // antwoord gewenst: vakje voor e-mailadres of gsm-nummer, ingevuld met wat vorige keer gebruikt werd
    const via = form.querySelector('[data-via]');
    const addr = form.querySelector('[data-via-addr]');
    const showVia = () => {
      form.querySelector('[data-via-box]').hidden = !via.value;
      if (!via.value) return;
      const isMail = via.value === 'email';
      form.querySelector('[data-via-label]').textContent = isMail ? 'Je e-mailadres' : 'Je gsm-nummer';
      addr.type = isMail ? 'email' : 'tel';
      addr.inputMode = isMail ? 'email' : 'tel';
      addr.autocomplete = isMail ? 'email' : 'tel';
      addr.placeholder = isMail ? 'naam@voorbeeld.be' : 'bv. 0470 12 34 56';
      const saved = load(KEY_REPLY, {});
      addr.value = (isMail ? saved.email : saved.phone) || '';
    };
    via.addEventListener('change', showVia);
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const { Onderwerp: subj, Bericht: text, attachment: file } = form.elements;
      if (!subj.value.trim()) { say('Vul een onderwerp in.'); subj.focus(); return; }
      if (!text.value.trim()) { say('Schrijf eerst je bericht.'); text.focus(); return; }
      let reply = null;
      if (via.value) {
        const a = addr.value.trim();
        const isMail = via.value === 'email';
        if (isMail ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a) : a.replace(/\D/g, '').length < 9) {
          say(`Vul een geldig ${isMail ? 'e-mailadres' : 'gsm-nummer'} in, of kies "Nee, geen antwoord nodig".`); addr.focus(); return;
        }
        reply = { via: via.value, addr: a };
      }
      if ([...file.files].reduce((t, f) => t + f.size, 0) > MAIL_MAX) { say('Het bestand is te groot (maximaal 10 MB). Kies een kleinere foto of een ander bestand.'); return; }
      if (!MAIL_ID) { say('Versturen kan nog niet: het contactformulier wordt nog ingesteld. Probeer het later opnieuw.'); return; }
      if (!navigator.onLine) { say('Geen verbinding. Probeer opnieuw als je bereik hebt; je tekst blijft staan.'); return; }
      if (mailBusy) { say('Er wordt al een bericht verstuurd. Even geduld.'); return; }
      mailBusy = true;
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say(file.files.length ? 'Versturen… (met een bestand kan dat even duren)' : 'Versturen…');
      const ok = await sendMail(form, form.dataset.place, reply);
      mailBusy = false;
      btn.disabled = false;
      if (ok) {
        if (reply) save(KEY_REPLY, { ...load(KEY_REPLY, {}), [reply.via === 'email' ? 'email' : 'phone']: reply.addr });
        form.reset();
        showVia();
        say('Verstuurd, bedankt! Je bericht is bij de maker van de app.');
      } else {
        say('Versturen lukte niet. Probeer het later opnieuw; je tekst blijft staan.');
      }
    });
  }
  // --- papier fotograferen (tekstherkenning op de gsm zelf) --------------------
  const OCR = { script: 'vendor/tesseract/tesseract.min.js', worker: 'vendor/tesseract/worker.min.js', core: 'vendor/tesseract/core', lang: 'vendor/tesseract/lang' };
  const abs = (u) => new URL(u, location.href).href;
  let ocrWorker = null;
  let scanned = null;
  function scanMsg(text) { $('scanMsg').hidden = !text; $('scanMsg').textContent = text || ''; }
  function scanProgress(p) {
    $('scanBar').hidden = p === null;
    $('scanBarFill').style.width = `${Math.round((p || 0) * 100)}%`;
  }
  function loadScript(src) {
    return new Promise((ok, fail) => {
      const el = document.createElement('script');
      el.src = src; el.onload = ok; el.onerror = () => fail(new Error('laden mislukt'));
      document.head.appendChild(el);
    });
  }
  async function getOcr() {
    if (ocrWorker) return ocrWorker;
    if (!window.Tesseract) await loadScript(abs(OCR.script));
    ocrWorker = await Tesseract.createWorker('nld', 1, {
      workerPath: abs(OCR.worker), corePath: abs(OCR.core), langPath: abs(OCR.lang),
      logger: (m) => {
        if (m.status === 'recognizing text') { scanMsg('Tekst lezen…'); scanProgress(m.progress); }
        else if (/load|initializ/.test(m.status)) scanMsg('Tekstherkenning klaarzetten (de eerste keer duurt dat even)…');
      },
    });
    return ocrWorker;
  }
  // foto verkleinen, grijs maken en het contrast opdrijven: dat leest beter
  async function prepareImage(file) {
    const img = await createImageBitmap(file).catch(() => null);
    if (!img) throw new Error('foto');
    const scale = Math.min(1, 2400 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    const g = c.getContext('2d');
    g.filter = 'grayscale(1) contrast(1.4)';
    g.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }
  const SCAN_FIELDS = {
    loonbrief: [['basisRsz', 'Basis RSZ'], ['belastbaar', 'Belastbaar'], ['voorheffing', 'Voorheffing'], ['netto', 'Netto'], ['kledij', 'Kledijsaldo (punten)', 'int']],
    fiche: [['income', 'Belastbaar loon (code 250)'], ['withholding', 'Bedrijfsvoorheffing (code 286)'], ['workBonus', 'Fiscale werkbonus (code 284)']],
    aanslag: [['result', 'Terug (min) of bijbetalen (plus)']],
  };
  function renderScanFields() {
    const kind = $('scanKind').value;
    const r = scanned && scanned.kind === kind ? scanned : { kind, ...Scan.parse($('scanText').textContent, kind) };
    scanned = r;
    const y = new Date().getFullYear();
    let head = '';
    if (kind === 'loonbrief') {
      const p = r.period || Loon.periodOf(isoDate(today));
      head = `<div class="row2"><div><label for="sc-month">Maand</label><input type="month" id="sc-month" value="${p.start.slice(0, 7)}"></div>
        <div><label for="sc-half">Uitbetaling</label><select id="sc-half"><option value="A"${p.half === 'A' ? ' selected' : ''}>1–15</option><option value="B"${p.half === 'B' ? ' selected' : ''}>16–31</option></select></div></div>`
        + (r.period ? '' : '<p class="warn">Periode niet gevonden op de foto: kies ze zelf.</p>');
    } else {
      const yr = r.year || (kind === 'fiche' ? y - 1 : y - 1);
      head = `<label for="sc-year">${kind === 'fiche' ? 'Inkomstenjaar' : 'Inkomstenjaar (aanslagjaar min 1)'}</label><input id="sc-year" inputmode="numeric" value="${yr}">`
        + (kind === 'fiche' ? `<label class="check"><input type="checkbox" id="sc-holiday"${r.holidayFund ? ' checked' : ''}> Dit is de fiche van het vakantiefonds (vakantiegeld)</label>` : '');
    }
    $('scanFields').innerHTML = head + SCAN_FIELDS[kind].map(([k, label, t]) => `<label for="sc-${k}">${label}</label>
      <input id="sc-${k}" inputmode="${t === 'int' ? 'numeric' : 'decimal'}" value="${Number.isFinite(r[k]) ? (t === 'int' ? String(r[k]) : r[k].toFixed(2).replace('.', ',')) : ''}" placeholder="niet gevonden">`).join('');
    const found = SCAN_FIELDS[kind].filter(([k]) => Number.isFinite(r[k])).length;
    $('scanCheck').textContent = found
      ? `${found} van de ${SCAN_FIELDS[kind].length} bedragen gevonden. Kijk ze na en verbeter ze waar nodig. Leeg = niet invullen.`
      : 'Geen bedragen gevonden. Probeer een scherpere foto, of vul ze zelf in.';
  }
  async function runScan(file) {
    if (!file) return;
    $('scanResult').hidden = true; scanned = null;
    scanMsg('Foto voorbereiden…'); scanProgress(0);
    try {
      const img = await prepareImage(file);
      const w = await getOcr();
      const { data } = await w.recognize(img);
      $('scanText').textContent = data.text;
      const kind = Scan.detectKind(data.text);
      $('scanKind').value = kind === 'onbekend' ? ($('scanDialog').dataset.kind || 'loonbrief') : kind;
      scanMsg(kind === 'onbekend' ? 'Ik kon niet zien welk papier dit is: kies het hieronder.' : '');
      renderScanFields();
      $('scanResult').hidden = false;
    } catch (err) {
      scanMsg(err.message === 'foto' ? 'Deze foto kon niet geopend worden.'
        : 'De tekstherkenning kon niet starten. De eerste keer is internet nodig om ze te laden; probeer opnieuw met bereik.');
    } finally {
      scanProgress(null);
      $('scanCam').value = ''; $('scanPick').value = '';
    }
  }
  $('scanCam').addEventListener('change', (ev) => runScan(ev.target.files[0]));
  $('scanPick').addEventListener('change', (ev) => runScan(ev.target.files[0]));
  $('scanKind').addEventListener('change', () => { scanned = null; renderScanFields(); });
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-scan]');
    if (!b) return;
    $('scanDialog').dataset.kind = b.dataset.scan || '';
    $('scanResult').hidden = true; scanMsg(''); scanProgress(null);
    if (typeof $('scanDialog').showModal === 'function') $('scanDialog').showModal();
    else $('scanDialog').setAttribute('open', '');
  });
  $('scanApply').addEventListener('click', () => {
    const kind = $('scanKind').value;
    const val = (k) => {
      const v = $('sc-' + k).value.trim();
      if (!v) return undefined;
      const n = Number(v.replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : NaN;
    };
    const vals = Object.fromEntries(SCAN_FIELDS[kind].map(([k]) => [k, val(k)]));
    if (Object.values(vals).some(Number.isNaN)) return alert('Een van de bedragen is geen geldig getal.');
    let done = '';
    if (kind === 'loonbrief') {
      const month = $('sc-month').value;
      if (!month) return alert('Kies de maand van de loonbrief.');
      const per = Loon.periodOf(`${month}-${$('sc-half').value === 'A' ? '01' : '16'}`);
      const { kledij, ...amounts } = vals;
      const clean = Object.fromEntries(Object.entries(amounts).filter(([, v]) => v !== undefined));
      if (Object.keys(clean).length) { payslips[per.key] = clean; save(KEY_PAYSLIPS, payslips); }
      if (kledij !== undefined) { clothingStart = { date: per.end, points: Math.round(kledij) }; save(KEY_CLOTH_START, clothingStart); }
      const [y, m] = month.split('-').map(Number);
      viewYear = y; viewMonth = m - 1;
      done = 'Loonbrief opgeslagen: je ziet hem bij Uitbetalingen naast de berekening van de app.' + (kledij !== undefined ? ' Je kledijsaldo is bijgewerkt.' : '');
    } else {
      const y = Number($('sc-year').value);
      if (!(y > 2000 && y < 2100)) return alert('Vul een geldig jaar in.');
      if (kind === 'fiche') {
        const d = { ...(taxExtras[y] || {}) };
        const set = (k, v) => { if (v !== undefined) d[k] = v; };
        if ($('sc-holiday').checked) { set('holidayPay', vals.income); set('holidayWithholding', vals.withholding); }
        else { set('ficheIncome', vals.income); set('ficheWithholding', vals.withholding); set('workBonus', vals.workBonus); }
        taxExtras[y] = d; save(KEY_TAX_EXTRA, taxExtras);
        done = `Loonfiche ingevuld bij Belastingbrief ${y}.`;
      } else {
        if (vals.result === undefined) return alert('Vul het bedrag in.');
        taxActual[y] = vals.result; save(KEY_TAX_ACTUAL, taxActual);
        done = `Aanslag opgeslagen bij Belastingbrief ${y}.`;
      }
      taxYear = y;
    }
    $('scanDialog').close?.();
    render();
    alert(done);
  });
  $('slips').addEventListener('click', (ev) => {
    const key = ev.target.closest('[data-unslip]')?.dataset.unslip;
    if (!key || !confirm('Deze loonbrief weghalen?')) return;
    delete payslips[key]; save(KEY_PAYSLIPS, payslips); render();
  });

  $('bugBtn').addEventListener('click', () => {
    $('bugDayName').textContent = fmtDate(selected, { day: 'numeric', month: 'long' });
    if (typeof $('bugDialog').showModal === 'function') $('bugDialog').showModal();
    else $('bugDialog').setAttribute('open', '');
  });
  $('bugDialog').addEventListener('click', (ev) => { if (ev.target === $('bugDialog')) $('bugDialog').close(); });

  // --- voorstel doen --------------------------------------------------------------
  $('ideaBtn').addEventListener('click', () => {
    if (typeof $('ideaDialog').showModal === 'function') $('ideaDialog').showModal();
    else $('ideaDialog').setAttribute('open', '');
  });
  $('ideaDialog').addEventListener('click', (ev) => { if (ev.target === $('ideaDialog')) $('ideaDialog').close(); });

  // offline werken (enkel op een echte website, niet als los bestand)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // --- belastingbedragen bekijken en aanpassen --------------------------------
  const TB_SCHEMA = {
    withholding: [
      ['taxFree', 'Belastingvrije som', 'eur'],
      ['costRate', 'Forfaitaire beroepskosten', 'pct'],
      ['costMax', 'Max. forfaitaire beroepskosten', 'eur'],
      ['scale', 'Schalen (incl. 7% gemeentebelasting)', 'pairs'],
      ['werkbonusRate', 'Vermindering op de werkbonus', 'pct'],
      ['quotientRate', 'Huwelijksquotiënt', 'pct'],
      ['quotientMax', 'Max. huwelijksquotiënt', 'eur'],
      ['kidsReduction', 'Vermindering kinderen ten laste', 'kids'],
      ['extraKid', 'Per kind boven het laatste', 'eur'],
    ],
    incomeTax: [
      ['taxFree', 'Belastingvrije som', 'eur'],
      ['costRate', 'Forfaitaire beroepskosten', 'pct'],
      ['costMax', 'Max. forfaitaire beroepskosten', 'eur'],
      ['brackets', 'Belastingschalen', 'pairs'],
      ['taxFreeScale', 'Schaal voor de belastingvrije som', 'pairs'],
      ['kidsSupplement', 'Toeslag kinderen ten laste (totaal)', 'kids'],
      ['extraKid', 'Per kind boven het laatste', 'eur'],
      ['under3', 'Per kind jonger dan 3 jaar', 'eur'],
      ['otherDependent', 'Andere persoon ten laste', 'eur'],
      ['singleParent', 'Alleenstaande ouder', 'eur'],
      ['kidsCreditMax', 'Max. belastingkrediet kinderen', 'eur'],
      ['quotientRate', 'Huwelijksquotiënt', 'pct'],
      ['quotientMax', 'Max. huwelijksquotiënt', 'eur'],
      ['pension', 'Pensioensparen (max. storting, vermindering)', 'pairs'],
    ],
  };
  let tbKind = 'withholding';
  let tbFrom = '';
  const pctOut = (r) => String(Math.round(r * 1e6) / 1e4).replace('.', ',');
  function tbPeriodName(kind, from) {
    return kind === 'incomeTax' ? `Inkomsten ${from.slice(0, 4)}` : `Vanaf ${fmtDate(from)}`;
  }
  function renderTaxTables() {
    const list = effectiveTaxTable(tbKind);
    if (!list.some((x) => x.from === tbFrom)) tbFrom = list[list.length - 1].from;
    const cur = list.find((x) => x.from === tbFrom);
    const base = baseTaxTables();
    const own = !!taxUser[tbKind]?.[tbFrom];
    const inBase = base[tbKind].some((x) => x.from === tbFrom);
    document.querySelectorAll('#tbKind button').forEach((b) => b.classList.toggle('on', b.dataset.k === tbKind));
    $('tbPeriods').innerHTML = list.map((x) => `<button type="button" data-from="${x.from}" class="${x.from === tbFrom ? 'on' : ''}">${tbPeriodName(tbKind, x.from)}${taxUser[tbKind]?.[x.from] ? ' ✎' : ''}</button>`).join('');
    $('tbInfo').textContent = 'De app haalt de nieuwste belastingbedragen automatisch op'
      + (base.updated ? ` (laatst bijgewerkt op ${fmtDate(base.updated)})` : '')
      + '. Klopt een bedrag niet met je loonbrief, pas het dan hier aan: jouw aanpassingen gaan voor. Komen er nieuwe bedragen vanaf een bepaalde datum, voeg ze dan toe met "Nieuwe bedragen vanaf…".';
    $('tbFromWrap').hidden = inBase;
    $('tbFrom').value = tbFrom;
    $('tbState').textContent = own ? (inBase ? 'Eigen aanpassingen (✎): die gaan voor op de automatische bedragen.' : 'Eigen bedragen die je zelf toegevoegd hebt.')
      : 'Automatische bedragen.';
    $('tbReset').hidden = !own;
    $('tbReset').textContent = inBase ? 'Automatische bedragen terugzetten' : 'Deze bedragen verwijderen';
    $('tbFields').innerHTML = TB_SCHEMA[tbKind].map(([f, label, type]) => {
      const v = cur[f];
      if (v === undefined) return '';
      if (type === 'eur' || type === 'pct') {
        return `<div class="tbrow"><label for="tb-${f}">${label}${type === 'pct' ? ' (%)' : ' (€)'}</label>
          <input id="tb-${f}" data-f="${f}" data-t="${type}" inputmode="decimal" value="${type === 'pct' ? pctOut(v) : numOut(v)}"></div>`;
      }
      if (type === 'kids') {
        return `<div class="tbgroup"><b>${label} (€)</b>${v.slice(1).map((n, i) => `<div class="tbrow"><label for="tb-${f}-${i + 1}">${i + 1} ${i ? 'kinderen' : 'kind'}</label>
          <input id="tb-${f}-${i + 1}" data-f="${f}" data-t="kids" data-i="${i + 1}" inputmode="decimal" value="${numOut(n)}"></div>`).join('')}</div>`;
      }
      // schijven: [bovengrens, tarief]
      return `<div class="tbgroup"><b>${label}</b>${v.map(([upper, rate], i) => {
        const lower = i ? v[i - 1][0] : 0;
        const range = upper === Infinity ? `<span class="span2">boven ${numOut(lower) || 0}</span>`
          : `<span>${f === 'pension' ? 'tot' : `van ${numOut(lower) || 0} tot`}</span>`
            + `<input data-f="${f}" data-t="pair" data-i="${i}" data-j="0" inputmode="decimal" value="${numOut(upper)}" aria-label="bovengrens">`;
        return `<div class="tbpair">${range}<span>:</span>
          <input data-f="${f}" data-t="pair" data-i="${i}" data-j="1" inputmode="decimal" value="${pctOut(rate)}" aria-label="tarief"><span>%</span></div>`;
      }).join('')}</div>`;
    }).join('');
  }
  function saveTaxPeriod(kind, from, obj) {
    taxUser[kind] = { ...(taxUser[kind] || {}), [from]: obj };
    save(KEY_TAX_USER, taxUser);
    applyTaxTables(); render(); renderTaxTables();
  }
  $('tbKind').addEventListener('click', (ev) => {
    const k = ev.target.closest('[data-k]')?.dataset.k;
    if (k) { tbKind = k; tbFrom = ''; renderTaxTables(); }
  });
  $('tbPeriods').addEventListener('click', (ev) => {
    const f = ev.target.closest('[data-from]')?.dataset.from;
    if (f) { tbFrom = f; renderTaxTables(); }
  });
  $('tbFields').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-f]');
    if (!el) return;
    let n = numIn(el.value);
    if (!Number.isFinite(n) || n < 0) { renderTaxTables(); return alert('Vul een geldig bedrag of percentage in.'); }
    const cur = structuredClone(effectiveTaxTable(tbKind).find((x) => x.from === tbFrom));
    const f = el.dataset.f, t = el.dataset.t;
    if (t === 'pct') cur[f] = n / 100;
    else if (t === 'eur') cur[f] = n;
    else if (t === 'kids') cur[f][Number(el.dataset.i)] = n;
    else cur[f][Number(el.dataset.i)][Number(el.dataset.j)] = el.dataset.j === '1' ? n / 100 : n;
    saveTaxPeriod(tbKind, tbFrom, cur);
  });
  $('tbAdd').addEventListener('click', () => {
    const list = effectiveTaxTable(tbKind);
    const last = list[list.length - 1];
    let from;
    if (tbKind === 'incomeTax') from = `${Number(last.from.slice(0, 4)) + 1}-01-01`;
    else {
      let d = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      while (list.some((x) => x.from >= isoDate(d))) d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      from = isoDate(d);
    }
    tbFrom = from;
    saveTaxPeriod(tbKind, from, { ...structuredClone(last), from });
  });
  $('tbFrom').addEventListener('change', () => {
    const v = $('tbFrom').value;
    const list = effectiveTaxTable(tbKind);
    if (!v || list.some((x) => x.from === v)) { renderTaxTables(); return alert('Kies een datum die nog niet gebruikt wordt.'); }
    const obj = { ...taxUser[tbKind][tbFrom], from: v };
    delete taxUser[tbKind][tbFrom];
    tbFrom = v;
    saveTaxPeriod(tbKind, v, obj);
  });
  $('tbReset').addEventListener('click', () => {
    const inBase = baseTaxTables()[tbKind].some((x) => x.from === tbFrom);
    if (!confirm(inBase ? 'Je eigen aanpassingen voor deze periode wissen?' : 'Deze bedragen verwijderen?')) return;
    delete taxUser[tbKind][tbFrom];
    save(KEY_TAX_USER, taxUser);
    if (!inBase) tbFrom = '';
    applyTaxTables(); render(); renderTaxTables();
  });

  // nieuwste bedragen ophalen (enkel op de echte website)
  async function refreshTaxTables() {
    if (!location.protocol.startsWith('http')) return;
    try {
      const res = await fetch(`belasting.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const j = await res.json();
      if (!Loon.normalizeTable(j.withholding) || !Loon.normalizeTable(j.incomeTax)) return;
      const next = { updated: j.updated || '', withholding: j.withholding, incomeTax: j.incomeTax };
      if (JSON.stringify(next) === JSON.stringify(load(KEY_TAX_REMOTE, null))) return;
      save(KEY_TAX_REMOTE, next);
      applyTaxTables(); render(); renderTaxTables();
    } catch { /* offline: verder met de bewaarde bedragen */ }
  }

  // --- netto-instellingen -------------------------------------------------
  $('sPlace').innerHTML = Loon.PLACES.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)} (${money(Loon.TRAVEL[Loon.TRAVEL.length - 1].table[p])})</option>`).join('');
  const settingInputs = [...document.querySelectorAll('[data-s]')];
  function renderSettings() {
    for (const el of settingInputs) {
      const v = settings[el.dataset.s];
      if (el.dataset.t === 'bool') el.checked = !!v;
      else if (el.dataset.t === 'num') el.value = v ? String(v).replace('.', ',') : '';
      else el.value = v;
    }
    $('placeWrap').hidden = settings.transport !== 'auto';
    $('bikeWrap').hidden = settings.transport !== 'fiets';
    $('pctWrap').hidden = settings.withholdingMode !== 'percentage';
    $('alfaWrap').hidden = settings.status !== 'gelegenheid';
    $('statusHint').textContent = settings.status === 'gelegenheid'
      ? 'Rode kaart: geen verlof; bovenaan zie je de Alfapas-teller.'
      : 'Erkend: verlof bijhouden en internetvergoeding per volle shift.';
    $('bvHint').hidden = settings.withholdingMode === 'percentage';
  }
  $('settingsBox').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-s]');
    if (!el) return;
    let v = el.value;
    if (el.dataset.t === 'bool') v = el.checked;
    else if (el.dataset.t === 'num') {
      v = v.trim() ? Number(v.replace(',', '.')) : 0;
      if (!Number.isFinite(v) || v < 0 || (el.dataset.s === 'withholdingPct' && v > 100)) {
        renderSettings(); return alert('Vul een geldig bedrag, aantal of percentage in.');
      }
    }
    settings[el.dataset.s] = v;
    save(KEY_SETTINGS, settings);
    renderSettings(); render();
  });

  // --- feestdagen ---------------------------------------------------------
  function renderHolidays() {
    $('holYear').textContent = holYear;
    $('holList').innerHTML = Loon.holidays(holYear, holidayOverrides).map((h) => `<li>
      <div><div class="d">${h.name}</div>
        <div class="m">${fmtDate(h.date, { weekday: 'long', day: 'numeric', month: 'long' })}${h.weekend ? ' · weekend: vervangingsdag invullen' : ''}</div></div>
      <input type="date" data-hol="${h.date}" value="${h.effective}" aria-label="Gevierd op">
    </li>`).join('');
  }
  $('holList').addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-hol]');
    if (!el) return;
    holidayOverrides[el.dataset.hol] = el.value;
    save(KEY_HOLIDAYS, holidayOverrides);
    renderHolidays(); render();
  });
  $('holPrev').addEventListener('click', () => { holYear--; renderHolidays(); });
  $('holNext').addEventListener('click', () => { holYear++; renderHolidays(); });

  // --- tarieven -----------------------------------------------------------
  const dayBefore = (iso) => Loon.addDays(iso, -1);
  const periodName = (i) => i === 0
    ? (periods.length > 1 ? `Tot ${fmtDate(dayBefore(periods[1].from))}` : 'Huidige tarieven')
    : `Vanaf ${fmtDate(periods[i].from)}`;

  function savePeriods() {
    save(KEY_PERIODS, periods);
    renderRates(); render();
  }

  function renderRates() {
    editPeriod = Math.min(editPeriod, periods.length - 1);
    const pr = periods[editPeriod];
    $('periodTabs').innerHTML = periods.map((_, i) =>
      `<button type="button" data-p="${i}" class="${i === editPeriod ? 'on' : ''}">${periodName(i)}</button>`).join('');
    $('periodFromWrap').hidden = editPeriod === 0;
    $('periodFrom').value = pr.from;
    $('delPeriod').hidden = editPeriod === 0;
    $('ratesBody').innerHTML = Loon.RATE_ROWS.map((x) => `<tr><td>${x.label}</td>
      ${['shift', 'uur', 'overuur'].map((k) => `<td><input inputmode="decimal" data-id="${x.id}" data-k="${k}" value="${Loon.rateFor([pr], pr.from || '0000', x.id)[k].toFixed(2).replace('.', ',')}"></td>`).join('')}
    </tr>`).join('');
  }
  $('periodTabs').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-p]');
    if (b) { editPeriod = Number(b.dataset.p); renderRates(); }
  });
  $('ratesBody').addEventListener('change', (ev) => {
    const inp = ev.target;
    const n = Number(inp.value.replace(',', '.'));
    if (!Number.isFinite(n) || n < 0) { renderRates(); return; }
    periods[editPeriod].values[inp.dataset.id][inp.dataset.k] = n;
    savePeriods();
  });
  $('periodFrom').addEventListener('change', () => {
    const v = $('periodFrom').value;
    if (!v || periods.some((pr, i) => i !== editPeriod && pr.from === v)) {
      alert('Kies een datum die nog niet gebruikt wordt.');
      renderRates(); return;
    }
    const pr = periods[editPeriod];
    pr.from = v;
    periods.sort((a, b) => a.from.localeCompare(b.from));
    editPeriod = periods.indexOf(pr);
    savePeriods();
  });
  $('addPeriod').addEventListener('click', () => {
    // standaard: eerste dag van volgende maand, met de laatste tarieven als vertrekpunt
    const last = periods[periods.length - 1];
    let d = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    while (periods.some((pr) => pr.from >= isoDate(d))) d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    periods.push({ from: isoDate(d), values: structuredClone(last.values) });
    editPeriod = periods.length - 1;
    savePeriods();
  });
  $('delPeriod').addEventListener('click', () => {
    if (editPeriod === 0 || !confirm(`Tarieven "${periodName(editPeriod)}" verwijderen?`)) return;
    periods.splice(editPeriod, 1);
    editPeriod = periods.length - 1;
    savePeriods();
  });
  $('resetRates').addEventListener('click', () => {
    if (!confirm('Alle tarieven terugzetten naar de standaardwaarden?')) return;
    periods = structuredClone(Loon.DEFAULT_RATE_PERIODS);
    editPeriod = periods.length - 1;
    savePeriods();
  });

  // --- back-up ------------------------------------------------------------
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  // Het oude webadres (met de naam van Cewez) verdwijnt: daar de nieuwe link en een back-upknop tonen.
  const NEW_HOME = 'https://wikidave.github.io/Haven-Werkuren/';
  // Pas tonen als het nieuwe adres echt bestaat (na de naamswijziging van de repository).
  if (location.hostname === 'wikidave.github.io' && !location.pathname.startsWith(new URL(NEW_HOME).pathname)) {
    fetch(new URL('version.json', NEW_HOME), { cache: 'no-store' }).then((res) => {
      if (!res.ok) return;
      $('moved').hidden = false;
      $('movedBackup').addEventListener('click', () => $('exportJson').click());
    }).catch(() => { /* offline: later opnieuw */ });
  }
  $('exportJson').addEventListener('click', () => {
    download(`werkuren-backup-${isoDate(new Date())}.json`,
      JSON.stringify({ entries, periods, settings, holidayOverrides, customCompanies, hiddenCompanies, purchases, clothingStart, companyLocations, companyPins, lastLocation, companyPhones, companyNotes, medChecks, leave, payslips, taxActual, taxExtras, taxUser, markagePremie, lashPremie, dop, otherDays, otherPay }, null, 2), 'application/json');
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  // Een back-up is een bestand van buiten de app: alleen het verwachte formaat doorlaten.
  // Ids, datums en sleutels komen in de pagina terecht, dus die moeten er netjes uitzien;
  // een logo moet een eigen foto zijn; tekst wordt ingekort.
  const ID_RE = /^[\w-]{0,60}$/;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const KEY_RES = { payslips: /^\d{4}-\d{2}-[AB]$/, otherPay: /^\d{4}-\d{2}$/, taxExtras: /^\d{4}$/, taxActual: /^\d{4}$/ };
  function cleanBackupValue(v, key, depth = 0) {
    if (depth > 8) throw new Error('te diep');
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'number') { if (!Number.isFinite(v)) throw new Error('getal'); return v; }
    if (typeof v === 'string') {
      if (['id', 'g', 'company', 'co', 'loc'].includes(key) && !ID_RE.test(v)) throw new Error('id');
      if (key === 'date' && v && !DATE_RE.test(v)) throw new Error('datum');
      if (key === 'logo') return safeLogo(v) ? v : '';
      return v.slice(0, 2000);
    }
    if (Array.isArray(v)) return v.slice(0, 20000).map((x) => cleanBackupValue(x, key, depth + 1));
    if (typeof v === 'object') {
      const out = {};
      for (const [k, x] of Object.entries(v)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        if (depth === 1 && KEY_RES[key] && !KEY_RES[key].test(k)) throw new Error('sleutel');
        out[k] = cleanBackupValue(x, k, depth + 1);
      }
      return out;
    }
    throw new Error('type');
  }
  const BACKUP_ARRAYS = ['entries', 'periods', 'customCompanies', 'hiddenCompanies', 'purchases', 'medChecks', 'leave', 'dop', 'otherDays'];
  function cleanBackup(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('geen object');
    const data = cleanBackupValue(raw, '', 0);
    for (const k of BACKUP_ARRAYS) if (k in data && !Array.isArray(data[k])) throw new Error(k);
    if (!data.entries.every((e) => e && typeof e === 'object' && DATE_RE.test(e.date))) throw new Error('dagen');
    for (const k of ['dop', 'otherDays']) if (data[k] && !data[k].every((d) => DATE_RE.test(d))) throw new Error(k);
    if (data.hiddenCompanies && !data.hiddenCompanies.every((x) => typeof x === 'string' && ID_RE.test(x))) throw new Error('bedrijven');
    return data;
  }
  $('importFile').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      const data = cleanBackup(JSON.parse(await file.text()));
      if (!confirm(`${data.entries.length} dagen terugzetten? Dit vervangt wat nu op dit toestel staat.`)) return;
      entries = data.entries.map(migrateEntry);
      if (Array.isArray(data.periods) && data.periods.length) periods = migratePeriods(data.periods);
      if (data.settings) settings = { ...Loon.DEFAULT_SETTINGS, ...data.settings };
      if (data.holidayOverrides) holidayOverrides = data.holidayOverrides;
      if (Array.isArray(data.customCompanies)) customCompanies = data.customCompanies;
      if (Array.isArray(data.hiddenCompanies)) hiddenCompanies = data.hiddenCompanies;
      if (Array.isArray(data.purchases)) purchases = data.purchases;
      if (Array.isArray(data.medChecks)) medChecks = data.medChecks;
      if (Array.isArray(data.leave)) leave = data.leave;
      if (data.companyPhones) companyPhones = data.companyPhones;
      if (data.companyNotes) companyNotes = data.companyNotes;
      if (data.payslips) payslips = data.payslips;
      if (data.taxActual) taxActual = data.taxActual;
      if (data.taxExtras) taxExtras = data.taxExtras;
      if (data.taxUser) { taxUser = data.taxUser; applyTaxTables(); }
      if (data.clothingStart) clothingStart = data.clothingStart;
      if (data.companyLocations) companyLocations = data.companyLocations;
      if (data.lastLocation) lastLocation = data.lastLocation;
      if (data.companyPins) companyPins = data.companyPins;
      if (data.markagePremie) markagePremie = data.markagePremie;
      if (data.lashPremie) lashPremie = data.lashPremie;
      if (Array.isArray(data.dop)) dop = data.dop;
      if (Array.isArray(data.otherDays)) otherDays = data.otherDays;
      if (data.otherPay) otherPay = data.otherPay;
      save(KEY_ENTRIES, entries); save(KEY_PERIODS, periods); save(KEY_SETTINGS, settings); save(KEY_HOLIDAYS, holidayOverrides);
      save(KEY_CUSTOM_CO, customCompanies); save(KEY_HIDDEN_CO, hiddenCompanies);
      save(KEY_MEDICAL, medChecks); save(KEY_LEAVE, leave); save(KEY_PAYSLIPS, payslips); save(KEY_TAX_ACTUAL, taxActual); save(KEY_TAX_EXTRA, taxExtras); save(KEY_TAX_USER, taxUser); save(KEY_PURCHASES, purchases); save(KEY_CLOTH_START, clothingStart); save(KEY_CO_LOCS, companyLocations); save(KEY_CO_PIN, companyPins); save(KEY_LAST_LOC, lastLocation); save(KEY_CO_PHONE, companyPhones); save(KEY_CO_NOTES, companyNotes);
      save(KEY_MARKAGE, markagePremie); save(KEY_LASH, lashPremie); save(KEY_DOP, dop); save(KEY_OTHER_DAYS, otherDays); save(KEY_OTHER_PAY, otherPay);
      renderCompanyPicker(); renderSettings(); renderTaxTables(); renderHolidays(); renderRates(); render();
    } catch { alert('Dit is geen geldig back-upbestand.'); }
    ev.target.value = '';
  });
  $('exportCsv').addEventListener('click', () => {
    const rows = [['Datum', 'Bedrijf', 'Plaats', 'Kaai', 'Shift', 'Overuren', 'Bruto', 'Netto (schatting)', 'Notitie']];
    const num = (n) => String(round2(n)).replace('.', ',');
    for (const e of monthEntries(viewYear, viewMonth)) {
      const x = shiftOf(e);
      rows.push([e.date, companyById(e.company)?.name || e.companyName || '', e.locName || '', e.kaai || '', entryTitle(e), num(overtimeOf(e)), num(x.bruto), num(x.netto), e.note]);
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    download(`werkuren-${viewYear}-${pad(viewMonth + 1)}.csv`, '﻿' + csv, 'text/csv');
  });

  // --- events -------------------------------------------------------------
  $('list').addEventListener('click', (ev) => {
    const id = ev.target.closest('.del')?.dataset.id;
    if (!id || !confirm('Deze shift verwijderen?')) return;
    entries = entries.filter((e) => e.id !== id);
    save(KEY_ENTRIES, entries);
    render();
  });
  $('cal').addEventListener('click', (ev) => {
    const iso = ev.target.closest('button[data-date]')?.dataset.date;
    if (iso) selectDay(iso, true);
  });
  ['code', 'kind', 'tariff', 'func', 'ot', 'wijziging', 'markage', 'lash'].forEach((id) => $(id).addEventListener('input', updatePreview));
  $('add').addEventListener('click', addEntry);
  // bij maandwissel: zelfde dagnummer selecteren (of laatste dag van de maand)
  const shiftMonth = (delta) => {
    const day = Number(selected.slice(8));
    const last = new Date(viewYear, viewMonth + delta + 1, 0);
    selectDay(isoDate(new Date(last.getFullYear(), last.getMonth(), Math.min(day, last.getDate()))), false);
  };
  $('prev').addEventListener('click', () => shiftMonth(-1));
  $('next').addEventListener('click', () => shiftMonth(1));

  save(KEY_ENTRIES, entries);
  save(KEY_PERIODS, periods);
  // welke kaarten open of dicht staan, onthouden
  // nieuwe indeling: alle onderdelen onder de kalender beginnen één keer dichtgeklapt
  if (!load('haven-werkuren.foldsGrouped', false)) { save(KEY_FOLDS, {}); save('haven-werkuren.foldsGrouped', true); }
  const folds = load(KEY_FOLDS, {});
  for (const d of document.querySelectorAll('details.fold')) {
    if (d.dataset.fold in folds) d.open = folds[d.dataset.fold];
    d.addEventListener('toggle', () => { folds[d.dataset.fold] = d.open; save(KEY_FOLDS, folds); });
  }
  renderCompanyPicker();
  fillCodes();
  $('work').value = load(KEY_LAST_WORK, 'other');
  $('func').innerHTML = Object.entries(Loon.FUNCTION_GROUPS).map(([g, grp]) => `<optgroup label="${grp.label}">${
    Loon.FUNCTIONS.filter((f) => f.group === g).map((f) => `<option value="${f.id}">${f.label}</option>`).join('')}</optgroup>`).join('');
  $('func').value = load(KEY_LAST_FUNC, 'alle');
  $('clDate').value = isoDate(today);
  $('medDate').value = isoDate(today);
  renderSettings();
  renderHolidays();
  renderRates();
  selectDay(isoDate(today), false);
  renderTaxTables();
  refreshTaxTables();
  // uitleg bij elke start van de app
  openWelcome();
})();
