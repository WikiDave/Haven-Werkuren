# Cewez-Calculator

![Toestellen die de app gebruiken](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fabacus.jasoncameron.dev%2Fget%2Fcewez-calculator%2Ftoestellen&query=%24.value&label=toestellen&color=0f5c8c&cacheSeconds=3600)
![Hoe vaak de link gedeeld is](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fabacus.jasoncameron.dev%2Fget%2Fcewez-calculator%2Fgedeeld&query=%24.value&label=gedeeld&color=e87a3e&cacheSeconds=3600)

Hobbyproject van een havenarbeider, David Schütt, gebouwd met behulp van AI (Claude). Dit project heeft niets te maken met Cewez. De informatie kan fout zijn. De app werkt offline op de gsm; gegevens blijven op het toestel en worden niet gedeeld.

Werkuren en loon bijhouden voor havenarbeid in Zeebrugge: kies per dag het bedrijf en het startuur, vul eventuele overuren in (na 7u45) en zie per maand het bruto en het geschatte netto per uitbetaling.

- Open de app via GitHub Pages en zet hem op je beginscherm (de knop "Uitleg" legt uit hoe). Hij werkt ook offline (service worker in `sw.js`, manifest in `manifest.webmanifest`).
- Gegevens blijven op je toestel (browseropslag); maak af en toe een back-up via "Back-up & export".

## Gebruikers tellen

Er wordt alleen geteld, zonder namen of gegevens, via tellers van [Abacus](https://abacus.jasoncameron.dev): op de echte site (wikidave.github.io) stuurt een toestel één keer "+1" (`cewez-calculator/toestellen`): op het beginscherm bij de eerste start, in de browser pas als de app op een tweede dag opnieuw geopend wordt (zo telt een iPhone niet dubbel voor Safari en het beginscherm, en tellen eenmalige bezoeken niet mee; robots en automatische browsers tellen niet), en elke keer dat iemand de knop "Link delen" gebruikt telt `cewez-calculator/gedeeld`. De aantallen staan in de badges bovenaan deze README en in het klein onderaan de app. De teller vervalt na ongeveer 6 maanden zonder nieuw toestel.

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

Functieloon volgens de Codex (artikel 31): basisloon alle werk van de shift plus 1× overuurloon (chauffeurs: tugmaster, heftruck, bobcat, unimog, empty container handler, hoogwerker, tugmaster kaai, verreiker), 2× uurloon (bull, heftruck +20 ton, reachstacker, giekkraan −20 ton, hydraulische kraan) of 2× overuurloon (straddle carrier, portaalkraan, giekkraan +20 ton, RMG/RTG). High/heavy chauffeur = alle werk.

## Premies per bedrijf, verlof en dop

- Premie markage en premie lashing verschillen per bedrijf: de gebruiker vult het bedrag in bij de shift en de app onthoudt het per bedrijf (`haven-werkuren.markagePremie`, `haven-werkuren.lashPremie`). Ze tellen als loon (type A).
- In de dag kies je bij een dag zonder werk Verlof, HV, Recup of Dop (rode kaart: enkel Dop). HV en recup tellen niet mee als verlofdagen.
- Dop (werkloosheid): dagen in `haven-werkuren.dop`. Naast een halve shift telt een halve dag, naast een volle shift niets. Met een zelf ingevuld bedrag per dag toont de app wat je ongeveer krijgt; dop zit niet in het netto per uitbetaling en niet in de belastingschatting.

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

De kaart "Werkaanbod" toont de tekorten per shift (vandaag en morgen), de drukte per bedrijf deze week en de bedrijven die havenarbeiders zoeken. De app haalt die gegevens bij het openen op van de openbare pagina's [Tekorten](https://cewez.be/tekorten/) en [Tewerkstelling](https://cewez.be/tewerkstelling/) van Cewez (via de WordPress-API van cewez.be); er wordt niets van de gebruiker meegestuurd. `aanbod.js` leest de tabellen (getest in `tests/aanbod.test.js` met de pagina's van 6 oktober 2026). Verandert Cewez de opmaak van die pagina's, dan moet `aanbod.js` mee aangepast worden. De telefoonnummers van de aanwervers komen van [Contactgegevens aanwervers](https://cewez.be/havenarbeider/contactgegevens-aanwervers/).

## Kaaien

Het vak "Kaaien" opent de plannen van de haven (kaainummers en straten, bezoekersplan, QR-codes van de bedrijfsingangen) als PDF op cewez.be (Wegwijs in de haven). De 14 bedrijfsingangen met hun GPS-punten komen uit die QR-codes; elke ingang heeft een knop voor Google Maps en Waze. Bij elk bedrijf staan ook de ingangen en de link naar de onthaalbrochure.

## Wat is er nieuw

Het uitlegscherm bij het openen toont "Wat is er nieuw" (de twee laatste datums, ouder nieuws op vraag). Wat nieuw is sinds iemands vorige bezoek krijgt het label "nieuw". Voeg bij elke nieuwe functie een regel toe bovenaan `NEWS` in `index.html`.

## Contact, Fout melden en Voorstel doen

Drie vakjes: onderwerp, bericht en een bestand (foto of PDF, max 10 MB). Het formulier gaat via [FormSubmit](https://formsubmit.co) per e-mail naar de maker. Het onderwerp van de mail is `HAVEN APP (plaats in de app)(onderwerp van de gebruiker)`, de mail bevat datum en tijd en de app-versie. Het e-mailadres staat nergens in de app of in deze repo: `MAIL_ID` in `index.html` is de code die FormSubmit gaf na het activeren. Na het versturen stuurt FormSubmit door naar `verstuurd.html` in een verborgen frame; zo weet de app dat het gelukt is.
