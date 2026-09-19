# AnalysisView-tokens: bevisst utenfor skill-fila

**Situasjon:** `AnalysisView` (rapportanalyse-visningen) hadde seks rå
hex-fargeverdier igjen etter at resten av appen var tokenisert — de siste av
det designsystem-audit 2026-08-31 kalte «gjengangermønstre uten primitiv».
Løsningen (2026-09-01) var en ny tokengruppe, `--color-skann-*` (7 tokens),
lagt til i `app/globals.css`, byte-identisk med de gamle hex-verdiene, i en
egen temauavhengig blokk, og vist på `/system/design` + `public/design.md`
som all annen token-endring skal.

**Beslutning:** `--color-skann-*` er MERKET «ikke gjenbruk» og bevisst
UTELATT fra den distribuerte skill-tokenfila (`skill/frivio-ui/assets/
frivio-tokens.css`), til tross for at generatoren (`scripts/build-skill.mjs`)
normalt tar med alle `:root`-blokker den finner.

**Hvorfor:** `--color-skann-*` er farger for ÉN spesifikk visning (en
skanne-/analyse-metafor i rapportopplastingen), ikke et generelt semantisk
konsept andre prosjekter ville hatt bruk for. Skill-en distribueres til
FREMMEDE prosjekter (se `skill/frivio-ui/SKILL.md`), og et token med et
Frivio-spesifikt navn og formål ville enten forvirre en agent i et annet
prosjekt («hva er ‘skann’?») eller bli brukt feil sted fordi det så ut som et
generelt tilgjengelig fargevalg.

**Feilen å unngå:** At `build-skill.mjs` faktisk dropper en `:root`-blokk
STILLE når den ikke gjenkjenner navnemønsteret, er i seg selv en svakhet —
den ble oppdaget i etterkant og sendt videre som en teknisk audit-oppgave, ikke
løst her. Et generatorscript som tier om et bevisst unntak og et unntak det
faktisk ikke forstod, ser identiske ut i output; det skal ikke stole på at et
menneske husker hvilket som er tilfellet uten en eksplisitt logglinje.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Teknisk gjeld ryddet …
AnalysisView: de 6 siste rå hex-fargene → tokengruppen `--color-skann-*`»).
