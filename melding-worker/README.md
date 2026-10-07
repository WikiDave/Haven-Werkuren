# Meldingen zonder GitHub-account

De knoppen "Fout melden" en "Voorstel doen" sturen de tekst naar deze Cloudflare Worker. De worker maakt er een GitHub-issue van (label `bug` of `enhancement`), zodat havenarbeiders geen GitHub-account nodig hebben.

## Instellen (eenmalig)

1. **GitHub-sleutel**: github.com › Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token.
   - Naam: `Haven Werkuren meldingen`
   - Repository access: *Only select repositories* › `WikiDave/Cewez-Calculator`
   - Permissions › Repository permissions › **Issues: Read and write** (niets anders)
   - Kopieer de sleutel.
2. **Worker**: Cloudflare-dashboard › Workers & Pages › Create › Create Worker › naam `haven-werkuren-melding` › Deploy › Edit code. Vervang alles door de inhoud van `worker.js` en klik Deploy.
3. **Instellingen van de worker**: Settings › Variables and Secrets › Add:
   - `GITHUB_TOKEN`, type **Secret**: de sleutel van stap 1
   - `GITHUB_REPO`, type Text: `WikiDave/Cewez-Calculator`
   - `ALLOWED_ORIGIN`, type Text: `https://wikidave.github.io`
4. Zet het adres van de worker (`https://haven-werkuren-melding.<jouw-naam>.workers.dev`) in `index.html` bij `MELD_URL`.

## Bescherming

- Alleen aanvragen vanaf de app (`ALLOWED_ORIGIN`) worden aanvaard.
- Maximaal 5 meldingen per uur per IP-adres; optioneel een Rate Limiting-binding `RL` (zie `wrangler.toml`).
- Een verborgen veld vangt eenvoudige spambots.
- De GitHub-sleutel mag alleen issues maken in dit ene project. Verloopt hij, maak dan een nieuwe en vervang `GITHUB_TOKEN`.
