// Tests voor het lezen van gefotografeerde papieren (tekst zoals de tekstherkenning hem geeft)
const test = require('node:test');
const assert = require('node:assert/strict');
const Scan = require('../scan.js');

test('bedragen in Belgische schrijfwijze', () => {
  assert.deepEqual(Scan.amountsIn('Basis RSZ 1.924,16 € 52,34- -8,70 1 234,56'), [1924.16, -52.34, -8.7, 1234.56]);
  assert.equal(Scan.parseAmount('€ 239,84'), 239.84);
  assert.equal(Scan.parseAmount('1O7,5O'), 107.5); // O in plaats van 0
});

test('loonbrief van Cewez', () => {
  const text = `CEWEZ vzw
Loonbrief periode 16/09/2026 - 30/09/2026
Basis RSZ 1.924,16
RSZ -271,59
Werkbonus 0,00
Belastbaar 1.652,55
Voorheffing -371,92
Geen RSZ, geen voorheffing 48,30
Inhouding maaltijdcheques -10,89
Netto 1.318,38
Kledij saldo 57 punten`;
  assert.equal(Scan.detectKind(text), 'loonbrief');
  const r = Scan.parse(text);
  assert.deepEqual(r.period, { start: '2026-09-16', end: '2026-09-30', half: 'B', key: '2026-09-B' });
  assert.equal(r.basisRsz, 1924.16);
  assert.equal(r.rsz, 271.59);
  assert.equal(r.belastbaar, 1652.55);
  assert.equal(r.voorheffing, 371.92);
  assert.equal(r.netto, 1318.38);
  assert.equal(r.kledij, 57);
});

test('loonbrief: bedrag op de regel eronder en eerste helft van de maand', () => {
  const r = Scan.parseLoonbrief('Van 01.09.2026 tot 15.09.2026\nBelastbaar\n537,21\nNetto\n€ 412,02');
  assert.equal(r.period.key, '2026-09-A');
  assert.equal(r.belastbaar, 537.21);
  assert.equal(r.netto, 412.02);
});

test('loonfiche 281.10', () => {
  const text = `FICHE 281.10 (inkomsten van het jaar 2026)
Werkgever: CEWEZ
250 Belastbare bezoldigingen 32.145,67
284 Fiscale werkbonus 312,40
286 Bedrijfsvoorheffing 6.789,01`;
  assert.equal(Scan.detectKind(text), 'fiche');
  const r = Scan.parse(text);
  assert.equal(r.year, 2026);
  assert.equal(r.income, 32145.67);
  assert.equal(r.withholding, 6789.01);
  assert.equal(r.workBonus, 312.4);
  assert.equal(r.holidayFund, false);
  const vf = Scan.parse('Fiche 281.10 inkomstenjaar 2026\nVakantiefonds voor havenarbeiders\n1250 2.410,00\n1286 433,80');
  assert.equal(vf.holidayFund, true);
  assert.equal(vf.income, 2410);
  assert.equal(vf.withholding, 433.8);
});

test('aanslagbiljet', () => {
  const back = Scan.parse('AANSLAGBILJET personenbelasting\nAanslagjaar 2027\nTerug te betalen bedrag 412,35');
  assert.equal(back.kind, 'aanslag');
  assert.equal(back.year, 2026);
  assert.equal(back.result, -412.35);
  const pay = Scan.parse('Aanslagbiljet - aanslagjaar 2027\nTe betalen bedrag: 1.023,90 EUR');
  assert.equal(pay.result, 1023.9);
});
