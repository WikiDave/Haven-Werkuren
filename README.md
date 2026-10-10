# Haven Werkuren

Onofficiële hobby-app van een havenarbeider, David Schütt, gebouwd met behulp van AI (Claude). **Dit is geen app van Cewez** en ook niet van een havenbedrijf; Cewez heeft de app en de bedragen niet nagekeken. De informatie kan fout zijn: controleer altijd je loonbrief.

Werkuren en loon bijhouden voor havenarbeid in Zeebrugge: kies per dag het bedrijf en het startuur, vul eventuele overuren in (na 7u45) en zie per maand het bruto en het geschatte netto per uitbetaling.

- Open de app via GitHub Pages en zet hem op je beginscherm (de knop "Uitleg" legt uit hoe). Hij werkt ook offline (service worker in `sw.js`, manifest in `manifest.webmanifest`).
- Gegevens blijven op je toestel (browseropslag) en worden niet naar de maker of naar iemand anders gestuurd; maak af en toe een back-up via "Back-up & export".
- Privacyverklaring: [`privacy.html`](privacy.html). Geen advertenties, cookies, tracking of teller.

## Licentie

© 2026 David Schütt, alle rechten voorbehouden (zie [`LICENSE`](LICENSE)). De broncode is zichtbaar, maar kopiëren, aanpassen, opnieuw publiceren of verspreiden mag niet zonder schriftelijke toestemming. Onderdelen van anderen in `vendor/` vallen onder hun eigen licentie (Leaflet: BSD 2-Clause, Tesseract.js: Apache 2.0, lettertypen: SIL Open Font License 1.1).

## Publiceren

Deze broncode is niet de website. De website staat in de openbare repository `WikiDave/Haven-Werkuren` (GitHub Pages, https://wikidave.github.io/Haven-Werkuren/) en bevat alleen een samengeperste versie:

```
npm install --prefix /tmp/terser terser@5.36.0
TERSER=/tmp/terser/node_modules/terser node tools/build-site.mjs ../Haven-Werkuren
```

`tools/build-site.mjs` perst `app.js`, `loon.js`, `scan.js` en `sw.js` samen, haalt commentaar uit de HTML en CSS en kopieert alleen wat de site nodig heeft (geen tests, geen bouwscripts).

## Beveiliging

- Alle code staat in eigen bestanden (`app.js`, `loon.js`, `scan.js`); `index.html` heeft geen inline scripts. Een Content-Security-Policy (meta-tag in `index.html`) laat alleen eigen bestanden toe, plus de kaarttegels (OpenStreetMap, Esri) en FormSubmit (berichten aan de maker). Een test controleert dat er geen inline scripts bijkomen.
- Een teruggezette back-up wordt eerst nagekeken (`cleanBackup` in `app.js`): ids, datums en sleutels moeten het verwachte formaat hebben, een logo moet een eigen foto zijn (data-URL van een afbeelding), tekst wordt ingekort.
- Een eigen logo van een bedrijf moet een data-URL van een afbeelding zijn (`safeLogo`); logo's van de havenbedrijven zelf zitten niet in de app.

## Loonberekening

De berekening staat in `loon.js` (zonder schermcode) en volgt de opbouw van de Cewez-loonbrief:

- Twee uitbetalingen per maand: dag 1–15 (rond de 19e) en dag 16–einde maand (uiterlijk 3 werkdagen later).
- Per shift: shiftloon, vaste premie en overuren (RSZ + voorheffing), kledij, verplaatsing en internet (pool) zonder RSZ en voorheffing, eigen bijdrage maaltijdcheque.
- RSZ: 13,07% op 108% van basis RSZ. Voorheffing: sleutelformule van de FOD Financiën (bijlage III KB/WIB 92, bedragen 2026), met de regel voor betalingen per veertien dagen (x 2 x 12, maandbedrag / 2); belastingvrije som instelbaar.
- Zon- en feestdagtarief vanaf 18u00 de dag ervoor; een feestdag in het weekend telt op de vervangingsdag.

Tests (met een echte loonbrief van augustus 2026 die tot op de cent moet kloppen):

```
node --test
```

## Functies

Functielonen staan vanaf 7 juli 2026 in een eigen kolom van de loontabel (shift, uurloon én overuurloon): chauffeurs (tugmaster, heftruck, bobcat, unimog, empty container handler, hoogwerker, tugmaster kaai, verreiker), kraanman (bull, heftruck +20 ton, reachstacker, giekkraan −20 ton, hydraulische kraan) en speciale tuigen (straddle carrier, portaalkraan, giekkraan +20 ton, RMG/RTG); zie `KADER_RATES` in `loon.js`, samen met foreman en ceelbaas. Overuren worden aan het overuurloon van de functie betaald. Vóór 7 juli 2026 geldt de Codex (artikel 31): basisloon alle werk plus 1× overuurloon (chauffeurs), 2× uurloon (kraanman) of 2× overuurloon (speciale tuigen), met uur- en overuurloon in dezelfde verhouding. High/heavy chauffeur = alle werk.

## Premies per bedrijf, verlof en dop

- Premie markage en premie lashing verschillen per bedrijf: de gebruiker vult het bedrag in bij de shift en de app onthoudt het per bedrijf (`haven-werkuren.markagePremie`, `haven-werkuren.lashPremie`). Ze tellen als loon (type A).
- In de dag kies je bij een dag zonder werk Verlof, HV, Recup of Dop (rode kaart: enkel Dop). HV en recup tellen niet mee als verlofdagen.
- Dop (werkloosheid): dagen in `haven-werkuren.dop`. Naast een halve shift telt een halve dag, naast een volle shift niets. Met een zelf ingevuld bedrag per dag toont de app wat je ongeveer krijgt; dop zit niet in het netto per uitbetaling en niet in de belastingschatting.
- Ander werk (rode kaart met een andere job): dagen in `haven-werkuren.otherWork`, loon per maand (belastbaar en voorheffing van de loonbrief) in `haven-werkuren.otherPay`. Dat loon telt mee in de schatting van de belastingbrief; het netto per uitbetaling in de haven verandert niet. Het dagbedrag dop kan uitgerekend worden uit de laatste betaling (bedrag ÷ dagen).

## Belastingbedragen bijwerken

Alle bedragen voor de voorheffing (sleutelformule) en de belastingbrief staan in `belasting.json`:

- `withholding`: sleutelformule bedrijfsvoorheffing, per **betaaldatum** (`from`).
- `incomeTax`: personenbelasting, per **inkomstenjaar** (`from` = 1 januari).
- In schalen staat `null` voor een schijf zonder bovengrens.

Komen er nieuwe bedragen (bv. op 1 januari, of vanaf 1 november 2026 na de belastinghervorming), voeg dan een nieuw blok toe met de datum waarop ze ingaan en pas `updated` aan. De app haalt `belasting.json` bij elke start op, dus iedereen krijgt de nieuwe bedragen meteen. Zet dezelfde bedragen ook in `loon.js` (standaardbedragen voor offline gebruik): een test controleert dat beide gelijk zijn.

Gebruikers kunnen in de app bij **Belastingbedragen** zelf bedragen aanpassen of nieuwe bedragen vanaf een datum toevoegen; hun aanpassingen gaan voor op `belasting.json`.

## Kledijpunten

Volgens de Codex (artikel 39 en bijlage 11): 1 punt per gewerkte shift, 2 punten voor lashing roro, container en high & heavy; saldo afgetopt op 300. Vul het saldo van je loonbrief in als vertrekpunt; afgehaalde kledij gaat van het saldo af.

## Nog open

- Werkbonus, speciale bijdrage sociale zekerheid: staan op 0 (instelbaar).
- Voorheffing: sleutelformule ingebouwd; de belastingvrije som na de hervorming van juli 2026, de kinderverminderingen en het quotiënt voor 2026 nog te controleren met een loonbrief met voorheffing.
- Vervangingsdagen voor 15/08/2026 en 01/11/2026 (instelbaar bij Feestdagen).
- Fietsvergoeding per km.
- Of wijzigings- en afbestelvergoeding onder RSZ vallen (instelbaar).
- Halve shift: nu gerekend als de helft van het shiftloon.
- Overuren: nu exact per minuut gerekend (afronding nog te bevestigen).
- Functies: overuren worden nog aan het overuurtarief alle werk gerekend; foreman, ceelbaas en andere functies (jumbo, markeerder, stouwer, telescopische kraan) staan er nog niet in.
- Kledijpunten: de Codex geldt voor de pool; nog na te gaan of dezelfde regels gelden voor gelegenheidsarbeiders.

## Kaart

Per bedrijf kun je een spelt op de kaart zetten (satelliet of kaart) en verslepen naar de juiste kaai; de route-knop gaat dan naar die spelt. De kaart gebruikt [Leaflet](https://leafletjs.com) 1.9.4 (BSD-2, in `vendor/leaflet/`) met tegels van OpenStreetMap en Esri World Imagery.

## Papier fotograferen

Met de knop "Loonbrief of belastingpapier fotograferen" leest de app een foto van een loonbrief van Cewez, een loonfiche 281.10 (ook die van het vakantiefonds) of een aanslagbiljet. De tekst wordt op de gsm zelf herkend met [Tesseract.js](https://github.com/naptha/tesseract.js) 5.1.1 (Apache-2.0, in `vendor/tesseract/`, met de Nederlandse taaldata `nld` van tessdata) en wordt pas geladen als iemand de knop gebruikt; de foto verlaat het toestel niet. `scan.js` haalt de bedragen uit de tekst (getest in `tests/scan.test.js`), en de gebruiker kijkt ze na voor ze ingevuld worden:

- loonbrief: wordt bij Uitbetalingen naast de berekening van de app gezet (basis RSZ, belastbaar, voorheffing, netto) en zet het kledijsaldo;
- loonfiche: vult bij Belastingbrief code 250, 286 en 284 in (of het vakantiegeld bij de fiche van het vakantiefonds);
- aanslagbiljet: toont het echte bedrag naast de schatting.

De herkenning is afgestemd op de gewone opmaak van die papieren. Wordt een bedrag niet (goed) gelezen, stuur dan een foto met verborgen naam en rijksregisternummer, of de "Gelezen tekst" uit het venster, via "Fout melden".

## Ontwerp

Ontwerp "Kaai": een donkere havenband bovenaan met de volgende uitbetaling, een geel-zwarte veiligheidsstreep en smalle signalisatieletters. Lettertypes: [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) en [Public Sans](https://fonts.google.com/specimen/Public+Sans) (SIL Open Font License), in `vendor/fonts/` zodat ze ook offline werken.

## Werkaanbod

De app toont geen werkaanbod. Het vak "Werkaanbod" bevat alleen links naar de officiële bronnen: MyJob (my.cewez.be, niet voor rode kaart), [Tekorten](https://cewez.be/tekorten/) en [Tewerkstelling](https://cewez.be/tewerkstelling/) op cewez.be. Telefoonnummers vult de gebruiker zelf in; de knop "Bellen voor werk" verwijst naar [Contactgegevens aanwervers](https://cewez.be/havenarbeider/contactgegevens-aanwervers/) op cewez.be.

## Kaaien

Het vak "Kaaien" opent de plannen van de haven (kaainummers en straten, bezoekersplan, QR-codes van de bedrijfsingangen) als PDF op cewez.be (Wegwijs in de haven), en de terminalplannen met parkings in de onthaalbrochures van de bedrijven.

## Wat is er nieuw

Het uitlegscherm bij het openen toont "Wat is er nieuw" (de twee laatste datums, ouder nieuws op vraag). Wat nieuw is sinds iemands vorige bezoek krijgt het label "nieuw". Voeg bij elke nieuwe functie een regel toe bovenaan `NEWS` in `index.html`.

## Contact, Fout melden en Voorstel doen

Drie vakjes: onderwerp, bericht en een bestand (foto of PDF, max 10 MB). Het formulier gaat via [FormSubmit](https://formsubmit.co) per e-mail naar de maker. Het onderwerp van de mail is `HAVEN APP (plaats in de app)(onderwerp van de gebruiker)`, de mail bevat datum en tijd en de app-versie. Het e-mailadres staat nergens in de app of in deze repo: `MAIL_ID` in `index.html` is de code die FormSubmit gaf na het activeren. Zonder bestand gaat het bericht naar de AJAX-ingang van FormSubmit, die met JSON antwoordt of het gelukt is. Met een bestand gaat het als gewoon formulier naar een verborgen frame (de AJAX-ingang laat bijlagen vallen); FormSubmit stuurt dan door naar `verstuurd.html`, behalve als er een e-mailadres in het bericht staat: dan toont het altijd zijn eigen bedankpagina, en dat geldt dan als gelukt.
