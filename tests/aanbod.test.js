// Tests voor het lezen van het werkaanbod van cewez.be (echte pagina's van 6 oktober 2026)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Aanbod = require('../aanbod.js');
const fixture = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');

test('tekorten: alle shiften met firma, datum, startuur, functie en aantal', () => {
  const t = Aanbod.parseTekorten(fixture('cewez-tekorten.html'));
  assert.equal(t.asOf, '2026-10-06');
  assert.equal(t.rows.length, 26);
  assert.equal(t.total, 187);
  assert.deepEqual(t.rows[0], { firma: 'BNFW', date: '2026-10-07', start: '06', func: 'JUMBOBEDIENER', vrij: '', count: 1 });
  assert.deepEqual(t.rows[2], { firma: 'CLdN PORTS', date: '2026-10-06', start: '14', func: 'ALLE WERK', vrij: 'P', count: 1 });
  assert.match(t.info, /my\.cewez\.be/);
  assert.match(t.info, /11\.15u/);
  assert.doesNotMatch(t.info, /VDAB/);
});

test('tewerkstelling: drukte per dag en firma\'s die volk zoeken', () => {
  const w = Aanbod.parseTewerkstelling(fixture('cewez-tewerkstelling.html'));
  assert.deepEqual(w.days, ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09']);
  assert.equal(w.busy.length, 7);
  assert.deepEqual(w.busy.find((b) => b.firma === 'WW').levels, ['zeer druk', 'zeer druk', 'zeer druk', 'druk', 'kalm']);
  assert.equal(w.wanted.length, 6);
  assert.deepEqual(w.wanted[0], { firma: 'CLDN', offer: 'Extra havenarbeiders op timetable.', items: ['Speedlashing', 'Spoorbewerking'], phones: ['0800 16 435'] });
  assert.deepEqual(w.wanted[2].phones, ['0476 88 26 83', '0490 42 65 54']);
});

test('namen van Cewez naar de bedrijven in de app', () => {
  const ids = ['BNFW', 'CLdN PORTS', 'DP World', 'ICO', 'NDQ', 'WWL', 'WW', 'CSP', 'P&O', 'PSA', 'SEABRIDGE', 'ECS'].map(Aanbod.companyIdFor);
  assert.deepEqual(ids, ['sea-invest', 'cldn', 'dp-world', 'ico', 'ndq', 'wwl', 'wwl', 'cosco', 'po-ferries', 'psa', 'seabridge', 'ecs']);
  assert.equal(Aanbod.companyIdFor('Onbekend bedrijf'), '');
});
