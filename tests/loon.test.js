// Automatische tests voor de loonberekening. Uitvoeren met: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const Loon = require('../loon.js');

const ctx = (settings = {}, holidays = {}) => ({
  ratePeriods: Loon.DEFAULT_RATE_PERIODS,
  settings: { ...Loon.DEFAULT_SETTINGS, ...settings },
  holidays,
});
const shift = (date, code, extra = {}) => ({ id: `${date}-${code}`, date, code, kind: 'full', overtime: 0, ...extra });

test('echte loonbrief Cewez augustus 2026, periode A (betaald 19/08/2026)', () => {
  // 1 volle shift, zaterdag 15/08/2026 (O.L.V. Hemelvaart), 08u00, gelegenheidsarbeider,
  // eigen vervoer vanuit Assebroek, ongehuwd, geen personen ten laste
  const r = Loon.calcPeriod([shift('2026-08-15', '08')], ctx({ status: 'gelegenheid', place: 'Assebroek', civil: 'ongehuwd' }));
  const line = (key) => r.lines.find((l) => l.key === key)?.amount;

  assert.equal(r.shifts[0].row, 'ZA'); // feestdag op zaterdag: gewoon zaterdagtarief
  assert.equal(line('shiftloon'), 270.18);
  assert.equal(line('premie'), 5.28);
  assert.equal(r.basisRsz, 275.46);
  assert.equal(r.rsz, 38.88);
  assert.equal(r.werkbonus, 0);
  assert.equal(r.belastbaar, 236.58);
  assert.equal(r.voorheffing, 0);
  assert.equal(r.D, 4.35); // kledij 1,59 + eigen vervoer 2,76
  assert.equal(line('kledij'), 1.59);
  assert.equal(line('vervoer'), 2.76);
  assert.equal(r.special, 0);
  assert.equal(r.groupInsurance, 0);
  assert.equal(r.mtc, 1.09);
  assert.equal(r.netto, 239.84);
  assert.equal(r.betaald, 239.84);
  assert.equal(r.payment.date, '2026-08-19');
  assert.equal(line('internet'), undefined); // gelegenheidsarbeider: geen internetvergoeding
});

test('zondagtarief vanaf 18u00 de dag voor een zon- of feestdag', () => {
  assert.equal(Loon.tariffRow('2026-08-22', '18'), 'ZO'); // zaterdag 22u00
  assert.equal(Loon.tariffRow('2026-08-22', '14'), 'ZA'); // zaterdag overdag
  assert.equal(Loon.tariffRow('2026-11-10', '18'), 'ZO'); // dinsdag avond voor 11 november
  assert.equal(Loon.tariffRow('2026-11-10', '14'), '14');
  assert.equal(Loon.tariffRow('2026-11-11', '08'), 'ZO'); // feestdag zelf
  assert.equal(Loon.tariffRow('2026-09-23', '06'), '06'); // gewone weekdag
});

test('feestdag in het weekend telt op de vervangingsdag', () => {
  assert.equal(Loon.tariffRow('2026-11-01', '08'), 'ZO'); // zondag blijft zondag
  assert.equal(Loon.holidayOn('2026-08-15'), undefined);
  const overrides = { '2026-08-15': '2026-08-14' };
  assert.equal(Loon.holidayOn('2026-08-14', overrides), 'O.L.V. Hemelvaart');
  assert.equal(Loon.tariffRow('2026-08-14', '08', overrides), 'ZO');
  assert.equal(Loon.tariffRow('2026-08-15', '08', overrides), 'ZA');
});

test('wettelijke feestdagen 2026 (zonder 11 juli)', () => {
  assert.deepEqual(Loon.legalHolidays(2026).map((h) => h.date), [
    '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-14', '2026-05-25',
    '2026-07-21', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25',
  ]);
});

test('uitbetalingsperiodes', () => {
  assert.equal(Loon.periodOf('2026-09-15').key, '2026-09-A');
  assert.equal(Loon.periodOf('2026-09-16').key, '2026-09-B');
  assert.equal(Loon.periodOf('2026-09-30').end, '2026-09-30');
  // periode B september: 3e werkdag na 30/09 = maandag 5 oktober
  assert.equal(Loon.paymentDate(Loon.periodOf('2026-09-20')).date, '2026-10-05');
});

test('bedrijfsvoorheffing volgens de sleutelformule 2026', () => {
  const bv = (belastbaar, settings = {}) => Loon.estimateWithholding(belastbaar, settings, '2026-09-16').amount;
  // loonbrieven zonder voorheffing
  assert.equal(bv(236.58), 0);   // augustus, periode A
  assert.equal(bv(527.43), 0);   // september, periode A
  // 1652,55 x 2 x 12 = 39661,20; - 6070 = 33591,20; schaal 9944,05 + 4091,20 x 48,15% = 11913,96
  // - 11170 x 26,75% (2987,98) = 8925,98; / 12 = 743,83; / 2 = 371,92
  assert.equal(bv(1652.55), 371.92);
  // 2000: jaar 48000, netto 41930, schaal 15929,10 - 2987,98 = 12941,12; / 12 = 1078,43; / 2 = 539,22
  assert.equal(bv(2000), 539.22);
  // 1 kind: 12941,12 - 621 = 12320,12; / 12 = 1026,68; / 2 = 513,34
  assert.equal(bv(2000, { kids: 1 }), 513.34);
  // partner zonder inkomen: 30% = 12579 -> 3364,88 + 9880,28 - 2 x 2987,98 = 7269,20; / 12 = 605,77; / 2 = 302,89
  assert.equal(bv(2000, { civil: 'gehuwd', spouseDependent: true }), 302.89);
  // werkbonus 50 per halve maand: maand 167,01 - 33,14 = 133,87; / 2 = 66,94
  assert.equal(bv(1000, { werkbonus: 50 }), 66.94);
});

test('belastingbedragen vervangen en nieuwe bedragen vanaf een datum', () => {
  const bv = (belastbaar, date) => Loon.estimateWithholding(belastbaar, {}, date).amount;
  const w = Loon.DEFAULT_WITHHOLDING[0];
  try {
    // vanaf 1 november een hogere belastingvrije som: 11550 x 26,75% = 3089,63 -> 8824,33 / 12 = 735,36 / 2 = 367,68
    Loon.setTaxTables({ withholding: [w, { ...w, from: '2026-11-01', taxFree: 11550 }] });
    assert.equal(bv(1652.55, '2026-10-16'), 371.92);
    assert.equal(bv(1652.55, '2026-11-16'), 367.68);
    // JSON-vorm: null = schijf zonder bovengrens
    Loon.setTaxTables({ withholding: [{ ...w, scale: [[16710, 0.2675], [29500, 0.428], [51050, 0.4815], [null, 0.535]] }] });
    assert.equal(bv(1652.55, '2026-10-16'), 371.92);
    assert.equal(Loon.getTaxTables().withholding[0].scale[3][0], Infinity);
  } finally {
    Loon.setTaxTables();
  }
  assert.equal(bv(1652.55, '2026-11-16'), 371.92);
});

test('belasting.json is gelijk aan de standaardbedragen in loon.js', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'belasting.json'), 'utf8'));
  assert.deepEqual(Loon.normalizeTable(json.withholding), Loon.DEFAULT_WITHHOLDING);
  assert.deepEqual(Loon.normalizeTable(json.incomeTax), Loon.DEFAULT_INCOME_TAX);
});

test('halve shift, pool en maaltijdcheque', () => {
  const full = Loon.shiftLines(shift('2026-09-23', '06'), ctx({ status: 'pool' })).lines;
  assert.equal(full.find((l) => l.key === 'internet').amount, 0.8);
  assert.equal(full.find((l) => l.key === 'mtc').amount, 1.09);
  const half = Loon.shiftLines(shift('2026-09-23', '06', { kind: 'half' }), ctx({ status: 'pool' })).lines;
  assert.equal(half.find((l) => l.key === 'premie').amount, 2.64);
  assert.equal(half.find((l) => l.key === 'kledij').amount, 1.59);
  assert.equal(half.find((l) => l.key === 'internet'), undefined);
  assert.equal(half.find((l) => l.key === 'mtc'), undefined);
});

test('geschat netto per shift verdeelt het periodenetto naar bruto', () => {
  const r = Loon.calcPeriod([shift('2026-09-21', '08'), shift('2026-09-22', '04', { overtime: 1 })], ctx());
  const total = Loon.round2(r.shifts.reduce((t, x) => t + x.netto, 0));
  assert.ok(Math.abs(total - r.netto) <= 0.01);
  assert.ok(r.shifts[1].netto > r.shifts[0].netto);
});

test('afbestelling weekend: vergoeding plus verplaatsing', () => {
  const r = Loon.calcPeriod([shift('2026-09-19', '08', { kind: 'afbestel' })], ctx());
  assert.deepEqual(r.lines.map((l) => [l.key, l.amount, l.type]), [['afbestel', 115.16, 'A'], ['vervoer', 2.76, 'D']]);
  assert.equal(r.mtc, 0);
});

test('voorheffing: eigen percentage en extra bedrag', () => {
  // augustus-loonbrief met 10% voorheffing en 5 euro extra: 236,58 x 10% = 23,66 (half-up) + 5
  const r = Loon.calcPeriod([shift('2026-08-15', '08')], ctx({ withholdingMode: 'percentage', withholdingPct: 10, extraWithholding: 5 }));
  assert.equal(r.voorheffing, 28.66);
  assert.equal(r.netto, 211.18);
  assert.equal(r.estimate, false);
  // met percentage wordt de voorheffing ook berekend bij personen ten laste
  const k = Loon.calcPeriod([shift('2026-08-15', '08')], ctx({ withholdingMode: 'percentage', withholdingPct: 10, kids: 2 }));
  assert.equal(k.withholdingCalculated, true);
  assert.equal(k.voorheffing, 23.66);
});

test('versienummer van de app en version.json zijn gelijk', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const appVersion = html.match(/const APP_VERSION = '([^']+)'/)[1];
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));
  assert.equal(appVersion, version);
  assert.equal(html.match(/<script src="loon\.js\?v=([^"]+)">/)[1], version);
});

test('kledijpunten: 1 per shift, 2 voor lashing, aftrek bij afhalen', () => {
  const entries = [
    shift('2026-09-01', '08'),                       // zit al in het startsaldo
    shift('2026-09-02', '08'),                       // +1
    shift('2026-09-03', '06', { work: 'lashing' }),  // +2
    shift('2026-09-05', '08', { kind: 'afbestel' }), // niet gewerkt: 0
  ];
  const purchases = [
    { id: 'p1', date: '2026-09-04', name: 'Helm met veiligheidsbril', points: 34 },
    { id: 'p2', date: '2026-09-04', name: 'Handschoenen (per paar)', points: 2, free: true }, // binnengebracht
  ];
  const r = Loon.clothingLedger(entries, purchases, { date: '2026-09-01', points: 100 });
  assert.equal(r.earned, 3);
  assert.equal(r.spent, 34);
  assert.equal(r.balance, 69);
});

test('kledijpunten worden afgetopt op 300', () => {
  const r = Loon.clothingLedger([shift('2026-09-02', '08', { work: 'lashing' }), shift('2026-09-03', '08')], [], { date: '2026-09-01', points: 299 });
  assert.equal(r.balance, 300);
  assert.equal(r.earned, 1);
  assert.equal(r.lost, 2);
});

test('kledijartikelen uit bijlage 11', () => {
  const parka = Loon.CLOTHING_ITEMS.find((i) => i.name === 'Winterparka');
  assert.equal(parka.points, 90);
  assert.equal(parka.pack, 'minimum');
  assert.equal(new Set(Loon.CLOTHING_ITEMS.map((i) => i.id)).size, Loon.CLOTHING_ITEMS.length);
});

test('functielonen volgens Codex art. 31', () => {
  const wage = (date, code, func) => Loon.shiftLines(shift(date, code, { func }), ctx()).lines.find((l) => l.key === 'shiftloon').amount;
  assert.equal(wage('2026-10-06', '08', 'alle'), 180.12);
  assert.equal(wage('2026-10-06', '08', 'highheavy'), 180.12);       // als alle werk
  assert.equal(wage('2026-10-06', '08', 'tugmaster'), 217.38);       // 180,12 + 37,26
  assert.equal(wage('2026-10-06', '08', 'reachstacker'), 229.80);    // 180,12 + 2 x 24,84
  assert.equal(wage('2026-10-06', '08', 'straddle'), 254.64);        // 180,12 + 2 x 37,26
  assert.equal(wage('2026-10-10', '08', 'tugmaster'), 326.09);       // zaterdag: 270,18 + 55,91
  const half = Loon.shiftLines(shift('2026-10-06', '08', { func: 'tugmaster', kind: 'half' }), ctx()).lines.find((l) => l.key === 'shiftloon');
  assert.equal(half.amount, 108.69);
});

test('oudere tarieventabel zonder uurloon', () => {
  const old = [{ from: '', values: Object.fromEntries(Object.entries(Loon.DEFAULT_RATE_PERIODS[1].values).map(([k, v]) => [k, { shift: v.shift, overuur: v.overuur }])) }];
  assert.equal(Loon.rateFor(old, '2026-10-06', '08').uur, 24.84);
});

test('belastingbrief: schatting van de aanslag', () => {
  // 30000 belastbaar: kosten 6070 (max), netto 23930; belasting 4180 + 7210 x 40% = 7064 - 2887,50 = 4176,50
  const r = Loon.estimateAnnualTax({ belastbaar: 30000, voorheffing: 4000, year: 2026, settings: {} });
  assert.equal(r.costs, 6070);
  assert.equal(r.netTaxable, 23930);
  assert.equal(r.stateTax, 4176.5);
  assert.equal(r.municipal, 288.18);      // 6,9% gemeentebelasting Brugge
  assert.equal(r.total, 4464.68);
  assert.equal(r.difference, 464.68);     // bijbetalen
  const low = Loon.estimateAnnualTax({ belastbaar: 8000, voorheffing: 150, year: 2026, settings: {} });
  assert.equal(low.total, 0);
  assert.equal(low.difference, -150);     // alles terug
});

test('belastingbrief: kinderen, partner, pensioensparen en eigen gegevens', () => {
  const est = (settings, details, belastbaar = 30000, voorheffing = 4000) =>
    Loon.estimateAnnualTax({ belastbaar, voorheffing, year: 2026, settings, details });
  // alleenstaande met 1 kind: belastingvrije som 11550 + 2130 + 1980 = 15660
  // vermindering via aparte schaal: 2937,50 + (15660 - 11750) x 30% = 4110,50; belasting 7064 - 4110,50 = 2953,50
  const kid = est({ kids: 1 });
  assert.equal(kid.taxFree, 15660);
  assert.equal(kid.stateTax, 2953.5);
  assert.equal(kid.municipal, 203.79);
  assert.equal(kid.total, 3157.29);
  // gehuwd, partner zonder inkomen: huwelijksquotiënt 30% van 23930 = 7179
  const couple = est({ civil: 'gehuwd' });
  assert.equal(couple.quotient, 7179);
  assert.equal(couple.stateTax, 1304.9);
  assert.equal(couple.total, 1394.94);
  // partner met eigen loon en voorheffing: geen quotiënt nodig, voorheffing van beiden telt mee
  const both = est({ civil: 'gehuwd' }, { partnerIncome: 30000, partnerWithholding: 4000 });
  assert.equal(both.quotient, 0);
  assert.equal(both.voorheffing, 8000);
  assert.equal(both.stateTax, 8353);
  // pensioensparen 1050 -> 315 vermindering; 1350 -> 337,50
  assert.equal(est({}, { pension: 1050 }).pension, 315);
  assert.equal(est({}, { pension: 1350 }).pension, 337.5);
  assert.equal(est({}, { pension: 1100 }).pension, 315);   // 30% van 1050 is gunstiger dan 25% van 1100
  assert.equal(est({}, { pension: 1050 }).stateTax, 4176.5);
  assert.equal(est({}, { pension: 1050 }).total, 4127.94); // (4176,50 - 315) x 1,069
  // werkelijke beroepskosten en eigen belastingvrije som
  assert.equal(est({}, { realCosts: 2000 }).netTaxable, 28000);
  assert.equal(est({}, { taxFree: 11180 }).taxFreeReduction, 2795);
  // fiscale werkbonus en kinderkrediet zijn terugbetaalbaar
  assert.equal(est({}, { workBonus: 500 }, 8000, 0).difference, -500);
  const lowKids = est({ kids: 2 }, {}, 8000, 0);
  assert.equal(lowKids.kidsCredit, 550);
});
