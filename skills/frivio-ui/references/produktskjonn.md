# Produktskjønn

Et designsystems egen `design.md`/product-design-tekst skiller **form** fra
**product judgment**: formen er tokens, komponenter og ratchets — den er lett å kopiere.
Product judgment er *hvorfor* et team traff akkurat de valgene, og den
overlever normalt ikke kopieringen, fordi den bor i chat-logger, Slack-tråder
og hoder, ikke i repoet.

Frivio har formen (`public/design.md`, denne skillen, designvakten i CI). Dette
dokumentet er forsøket på å skrive ned den andre halvparten: de bindende
produktbeslutningene, hver med begrunnelse og kilde, slik at en agent som
leser koden kaldt ikke må gjenoppdage dem ved å gjøre founders feil på nytt.

Bevis for at dette trengs: 31. august 2026 måtte founder si «listekomponenter
gjennomgående» to ganger på samme klasse feil, og spurte til slutt «har du
virkelig tatt en UI/UX-audit?» om en leveranse som var komponent-hygiene
forkledd som produktarbeid. Begge var regler som allerede fantes — bare ikke
her.

**Hvordan lese en regel:** «Regel» er hva du kan observere i UI-en eller koden.
«Hvorfor» er begrunnelsen — der den finnes, et founder-sitat, fordi et
parafrasert sitat mister akkurat den skarpheten som gjorde regelen
selvforklarende. «Unntak» er navngitt, ikke generisk («med mindre annet er
avtalt» er ikke et unntak). «Kilde» er dato + hvor, slik at regelen kan
verifiseres og oppdages foreldet. Endres praksis, oppdater regelen HER FØRST —
denne fila er sannheten om hvorfor, `SYSTEM.md`-endringsloggen er sannheten om
hva som skjedde når.

---

## Økonomi og tall

## regel/forventet-vs-bokfort-ikke-summeres

**Regel:** Et forslag fra banken («ser betalt ut») og en bekreftet handling
(«er betalt») er to forskjellige tilstander som ALDRI slås sammen til én sum
eller ett ord før styret har bekreftet forslaget.

**Scope:** Faktura-matching mot bankfeeden (`lib/bank/fakturaMatch.ts`),
felleskostnad-matching (`lib/bank/felleskostMatch.ts`), all kopi som
oppsummerer betalingsstatus.

**Hvorfor:** «Fakturalista viser ‘Ser betalt ut … fra banken’ (aldri ‘er
betalt’ — forventet/bokført holdes adskilt til styret bekrefter).» Et forslag
som blir lest som et faktum er verre enn intet forslag: et falskt «betalt»
skjuler en ubetalt regning for styret helt til det er for sent.

**Unntak:** Ingen. Selv når treffsikkerheten er svært høy (eksakt beløp +
eksakt referanse), forblir språket «ser ut til» til bekreftelsen er gjort.

**Kilde:** SYSTEM.md, endringslogg 2026-08-31, «Fase 3: faktura-matching mot
bankfeeden».

**Dårlig → godt:** «Betalt (fra bank)» som statusord i lista → «Ser betalt ut
· bekreft» med egen bekreft/avvis-handling som faktisk endrer `betalt_dato`.

---

## regel/ib-tastes-en-gang-ub-utledes

**Regel:** Inngående balanse (IB) for et regnskapsår er den ENESTE
kontantbeholdnings-verdien et menneske taster inn. Utgående balanse (UB)
regnes alltid ut i kode (IB + periodens resultat), aldri tastet på nytt noe
sted som leser regnskapet.

**Scope:** `GET /api/okonomi/summary` (`opening_balance`/`closing_balance`),
Budsjett-siden (P29-visningen), Prognose («Oppsparte midler»).

**Hvorfor:** To tastede tall for samme kontantstrøm drifter fra hverandre med
sikkerhet — det ene blir feil, og ingen kan si hvilket. Et system som lar
brukeren taste UB direkte inviterer akkurat den driften. «Utgående utledes i
API-et, aldri på nytt i budsjettet.»

**Unntak:** Er banken koblet, forhåndsfylles IB fra bankens saldo (kilden
flytter, prinsippet ikke — se `regel/skjoteregelen-bank-eier-inneverende-ar`).
Er beholdningen ikke registrert i det hele tatt, vises en egen «ikke
registrert»-tilstand — aldri 0 kr som om det var et faktum.

**Kilde:** SYSTEM.md, endringslogg 2026-08-06, «Pilottilbakemelding bølge 2b —
… kontantbeholdningen vises i budsjettet (P29)» (Martin: «det hadde vært fint å
se kontantbeholdning ved starten av året og utgangen av året»).

**Dårlig → godt:** Et eget «utgående beholdning»-tekstfelt på Budsjett-siden →
et readonly-tall utledet fra samme `GET /api/okonomi/summary`-kilde som
Regnskap bruker.

---

## regel/p27-kontroll-forblir-ulagret

**Regel:** Kontrollen «stemmer utledet beholdning med faktisk banksaldo»
lagrer ALDRI et resultat («godkjent»/«avvik»-flagg) i databasen. Den regnes på
nytt hver gang siden lastes.

**Scope:** Regnskap-siden, kontantbeholdnings-kontrollen (P27).

**Hvorfor:** «Bevisst IKKE lagret: det er en handling styret utfører, ikke
data systemet eier, og en ‘godkjent’-hake ville krevd ny kolonne» — å lagre et
godkjent-flagg ville implisert at systemet kan bevitne en avstemming det ikke
selv har gjort. Etter bankkobling ble kontrollen automatisk (banken har
saldoen), men prinsippet står: «P27 blir automatisk avstemming — fortsatt
ulagret.»

**Unntak:** Ingen kjent.

**Kilde:** SYSTEM.md, endringslogg 2026-08-12 («Pilot runde 2, bølge 2+3») og
2026-08-31 («Fase 2: regnskapet bygger seg selv fra bankfeeden»).

**Dårlig → godt:** En «Bekreft avstemming»-knapp som setter
`accounting_summaries.avstemt = true` → et rent visningsfelt som sammenligner
to tall hver gang siden rendres, uten skrivevei.

---

## regel/periodisering-etter-dato

**Regel:** En innbetaling periodiseres til måneden overføringen faktisk skjedde
(dato på transaksjonen), ALDRI til måneden som var valgt i UI-en da filen ble
lastet opp.

**Scope:** Kontoutskrift-opplasting, felleskostnad-restanse, all
betalingsmatching.

**Hvorfor:** Ekte kundefeil, funnet av en pilot: en flermåneders-utskrift ga
«januar er betalt» og stoppet der, fordi systemet aldri fikk vite NÅR en
betaling skjedde — alt havnet i den ene måneden som sto valgt på skjermen. En
feilplassert innbetaling ser ut som en betalt måned; det er verre enn en
manglende rad, for det skjuler et reelt etterslep.

**Unntak:** Finner systemet en betaling uten dato, lagrer det den IKKE, men
sier fra — det skal heller stå åpent enn plasseres feil.

**Kilde:** `arkiv/rapporter/CHANGELOG-PILOT-2026-08-20.md`, «Kontoutskrift over
flere måneder leses nå riktig» (Martin fant feilen).

**Dårlig → godt:** «Registrer alt som juni siden det er juni-fanen som er
åpen» → les datoen på hver linje og fordel per faktisk måned; skjermen sier
«Leste 6 måneder: januar–juni».

---

## regel/avrunding-aldri-pa-betalingskrav

**Regel:** Kronebeløp avrundes til hele kroner i sammendrag (summer,
GF-rapport, AI-prompter), men ALDRI på et betalingskrav — faktura, purring,
restanse i e-post og fakturainnboksen viser øre når de finnes
(`formatKr(beløp, { maksDesimaler: 2 })`).

**Scope:** `lib/utils.ts` (`formatKr`), alt som viser et beløp noen skal
betale eller har betalt.

**Hvorfor:** Et krav som viser 1 001 kr når 1 000,50 faktisk skyldes, er en
feilinformasjon med et kronebeløp i seg — mottakeren betaler feil sum og
avviket dukker opp som en uforklart restanse senere. Sammendrag tåler
avrunding; et krav gjør ikke.

**Unntak:** Fem kallesteder (drift, `BankDetaljerModal`, avtalelistene) bruker
fortsatt Intl-currency-dialekten «kr 12 345» (`stil: 'valuta'`) —
harmonisering til suffiks-stilen er en founder-beslutning som ikke er tatt,
ikke en glipp.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01, «Teknisk gjeld ryddet …
formatKr». `lib/utils.ts` toppkommentar på `formatKr`.

**Dårlig → godt:** `restanse.toFixed(0) + ' kr'` på en purring →
`formatKr(restanse, { maksDesimaler: 2 })`.

---

## regel/skjoteregelen-bank-eier-inneverende-ar

**Regel:** Fra og med datoen bankfeeden dekker (`kilde.bankFra`), er banken
FASIT. Opplastede transaksjoner FØR den datoen beholdes uendret. `bankFra`
flyttes aldri framover av kode — kun av en ny, bevisst tilkobling.

**Scope:** `lib/regnskapAggregat.ts`, regnskapsbygging, alt som leser
`accounting_summaries` for inneværende år.

**Hvorfor:** Presisering av «bank eier inneværende år»: uten en skarp
skjæringsdato ville en rekobling kunnet enten telle transaksjoner dobbelt
(bank + gammel opplasting for samme periode) eller miste historikk som lå
FØR banken noensinne dekket. «Aldri dobbelt-telling, aldri tapt historikk.»

**Unntak:** Ingen — regelen er symmetrisk og gjelder likt for alle
organisasjoner med bank tilkoblet.

**Kilde:** SYSTEM.md, endringslogg 2026-08-31, «Fase 2: regnskapet bygger seg
selv fra bankfeeden» (founder-godkjent presisering).

**Dårlig → godt:** En rekobling som lar `bankFra` hoppe til dagens dato «for å
være trygg» → `bankFra` beholder sin opprinnelige verdi med mindre en ny,
eksplisitt tilkobling bevisst flytter den.

---

## regel/forslag-pa-foresporsel-styret-bekrefter

**Regel:** Et automatisk matchingsforslag (faktura- eller
felleskostnad-betaling) SKRIVES ALDRI til databasen før styret aktivt
bekrefter det. Finnes det mer enn én mulig kandidat, genereres INGEN forslag —
et tomt forslag er alltid tryggere enn et tvetydig et.

**Scope:** `lib/bank/fakturaMatch.ts`, `lib/bank/felleskostMatch.ts`, all
automatisk matching mot bankfeeden.

**Hvorfor:** Pilot-loven: «et falskt ‘betalt’ skjuler en ubetalt regning.» Et
sameie som stoler på at Frivio har «ordnet det» oppdager ikke en reell restanse
før det er sent. «Forslag genereres PÅ FORESPØRSEL … ingenting skrives før
styret bekrefter.»

**Unntak:** Ingen — heller ikke ved høy konfidens (eksakt beløp, tydelig
referanse). Sporbarhet (`kilde`, `bank_transaksjon_id`) skrives FØRST når
bekreftelsen skjer, aldri før.

**Kilde:** SYSTEM.md, endringslogg 2026-08-31, «Fase 3» og «Fase 4»
(felleskostnad-matching).

**Dårlig → godt:** Cron-jobben skriver `betalt_dato` direkte når beløp+dato
matcher «godt nok» → cron bygger et utkast styret ser og bekrefter manuelt;
databasen endres først ved bekreftelse.

---

## regel/ingen-ny-toppseksjon-bank-er-kilde

**Regel:** Bankintegrasjonen erstatter en DATAKILDE i eksisterende flater
(Regnskap, Felleskostnad, Prognose) — den får aldri sin egen toppnivå-seksjon
i navigasjonen.

**Scope:** Sidemeny, `OkonomiNav`, all planlegging av bank-relatert UI.

**Hvorfor:** «Bytt motor, ikke karosseri»: `accounting_summaries` forblir
lesekontrakten som 15+ konsumenter allerede bygger på, banken blir
produksjonsveien inn i den — brukeren ser fortsatt Regnskap, Felleskostnad og
Prognose, bare med bedre tall. En egen «Bank»-fane ville dupliseṙt informasjon
som allerede har et hjem og tvunget brukeren til å vite HVOR data kom fra for
å finne den.

**Unntak:** `BankDetaljerModal` (kontovalg, oppdater nå, koble fra) er et
unntak i form, ikke i prinsipp — den er en modal for Å GJØRE noe med
koblingen, ikke en ny seksjon for å SE data (se
`regel/modal-gjore-accordion-lese`).

**Kilde:** SYSTEM.md, endringslogg 2026-08-31, «Bankkobling fase 1» og «Fase
2: regnskapet bygger seg selv fra bankfeeden».

**Dårlig → godt:** Ny sidemeny-seksjon «Bank» med egen transaksjonsvisning
adskilt fra Regnskap → transaksjonslisten lever i Regnskap → Transaksjoner,
bankstatus er én linje øverst med en Detaljer-modal.

---

## Sikkerhet og tillit

## regel/karantene-sikkerhet-urorlig

**Regel:** Fire prinsipper for fakturainnboksen er urørlige, ikke
justerbare UX-preferanser: (1) ukjent avsender → karantene, aldri arkiv eller
innboks direkte, (2) ingenting i en innkommende faktura utløser en handling —
den kan bare legges fram til gjennomsyn, (3) AI-uttrekk av beløp/forfall
utløses KUN av en innlogget styrebruker gjennom en kvotebelagt rute, aldri
automatisk ved mottak, (4) uttrekket bruker KUN Anthropic, aldri Google/andre
leverandører, fordi bankdata og fakturainnhold er kundedata.

**Scope:** `app/api/inbound/faktura`, `lib/fakturaAvsender.ts`,
faktura-uttrekket i `lib/ai.ts`.

**Hvorfor:** Fakturasvindel («vi har fått ny fakturaadresse, betal hit») er
utbredt, og en offentlig, bredt delt adresse (`<stamme>@faktura.frivio.no`) er
et opplagt mål. «Hvor dette kalles fra er en sikkerhetsbeslutning, ikke en
UX-preferanse» — kalles uttrekket fra mottaksruta i stedet for fra en innlogget
handling, kan hvem som helst som kjenner adressen sende 500 PDF-er og drive
opp AI-regningen uten å være kunde, siden webhooken ikke har en innlogget
bruker `lib/aiKvote` kan nøkle på.

**Unntak:** Et NAVNGITT unntak finnes for gjenkjenning: trykker styret «Kjenner
avsender» på en karantene-faktura, går alt fra SAMME nøyaktige adresse rett inn
heretter — det er ikke en omvei rundt karantenen, det ER poenget med den (én
manuell godkjenning per leverandør). Frie e-postdomener (Gmail m.fl.) og
delte fakturaprogram-domener (Visma, factoring) krever eksakt adresse, ikke
domenetreff — ellers ville én Visma-kunde gjort hele Visma-domenet til «kjent»
for alle våre kunder.

**Kilde:** `lib/fakturaAvsender.ts` (toppkommentar), `lib/ai.ts` (kommentaren
over faktura-uttrekksfunksjonen), SYSTEM.md endringslogg 2026-08-21
(«Fakturainnboks, første del: mottak» og «Gjenkjenning av avsender bygget
om»).

**Dårlig → godt:** «La AI-en lese vedlegget med én gang det kommer inn, så
beløpet står klart når styret åpner innboksen» → uttrekket venter til en
innlogget bruker eksplisitt ber om det, på en faktura som ikke står i
karantene.

---

## regel/ai-ikke-i-kundevendt-copy

**Regel:** Ordet «AI» (og «kunstig intelligens») unngås i tekst kunder ser.
Frivio er aktøren i kopien («Frivio genererer et utkast»), ikke «AI»-en. Hvilken
AI-leverandør som brukes (Anthropic/Claude) nevnes ALDRI i kundevendt UI.

**Scope:** All tekst i `app/(dashboard)/**` og `components/**` kunder ser.
Unntatt: se Unntak.

**Hvorfor:** Datatilsynets undersøkelse (2024): 77 % av nordmenn 60+ er
negative til KI, og målgruppen (styremedlemmer 45–75) overlapper direkte.
Founder: «Bruk dine anbefalinger» ved gjennomgangen som fjernet ordet fra ~25
forekomster. Modellnavn er enda skarpere: en «Claude Sonnet»-badge til kunder
ble flagget som P1 i UX-revisjonen 2026-09-01 og fjernet samme dag — et
leverandørnavn gir kunden ingenting og eksponerer en implementasjonsdetalj
kunden ikke kan bruke til noe.

**Unntak:** `/personvern` (juridisk krav om å oppgi underdatabehandler),
`components/MetodikkInfo.tsx` (bevisst transparensside om metodikk,
tilsvarende `docs/METODIKK.md`), ikonnavn/env-navn/funksjonsnavn/kodekommentarer
(`GenererAI`, `AI_KARI_ACTIONS`, `sjekkAIKvote`) — disse er interne, ikke
kundevendte.

**Kilde:** SYSTEM.md, endringslogg 2026-08-19 («Skjønnsbasert rydderunde:
‘AI’-ordet ut av kundevendt tekst») og 2026-09-01 («Mot 9/10, sjekkpunkt 1» —
Claude Sonnet-badge fjernet).

**Dårlig → godt:** «AI analyserer rapporten din …» / «Claude Sonnet — utkast» →
«Frivio lager utkastet …» / «Utkast styret godkjenner».

---

## Navn og terminologi

## regel/terminologi-laast

**Regel:** Et sidenavn som er satt, er satt OVERALT samtidig — sidetittel,
sidemeny, brødsmulesti, fanenavn og ⌘K-paletten endres i samme leveranse, aldri
stykkevis.

**Scope:** All navngiving av sider, faner og seksjoner.

**Hvorfor:** Et navn som stemmer i menyen men ikke i søket (eller omvendt) er
verre enn et dårlig navn — det bryter tilliten til at appen er internt
konsistent. Da «Vedlikeholdsfond» ble «Vedlikeholdsfinansiering» (Martins
tilbakemelding om at innholdet hadde endret seg fra sparing til lån), ble
«siden, sidemenyen, brødsmulen, Økonomi-fanen og ⌘K» byttet i SAMME
leveranse — mens selve URL-en (`/okonomi/vedlikeholdsfond`) bevisst IKKE ble
endret, fordi det er en egen, større beslutning med brukne lenker som
konsekvens. (Oppdatering 2026-09-09: sidekart v2 endret likevel denne URL-en,
til `/okonomi/finansiering` — men som del av en samlet, founder-vedtatt
IA-omlegging med 308-redirects for ALLE gamle stier, ikke en isolert
navnebytte-beslutning. Regelen under gjelder fortsatt for enkeltstående
navnebytter.)

**Unntak:** URL-slugs endres ikke sammen med visningsnavnet — se eksempelet
over. En URL er en avtale med eksisterende bokmerker, et visningsnavn er det
ikke.

**Kilde:** SYSTEM.md, endringslogg 2026-08-06 («Vedlikeholdsfond ble
Vedlikeholdsfinansiering (P30)») og 2026-07-17 (Seksjoner → «Seksjoner &
beboere», samme regel i praksis).

**Dårlig → godt:** Sidetittelen endres til «Felleskostnader», men sidemenyen
og ⌘K fortsatt sier «Felleskostnad» → alle fem stedene oppdateres i én commit.

---

## regel/sidetittel-er-kanonisk-navn

**Regel:** `PageHeader`/`h1`-teksten på en side ER det offisielle navnet på
funksjonen. All annen omtale av samme funksjon (i kopi, i e-post, i
dokumentasjon) refererer til DEN teksten, ikke en egen beskrivelse.

**Scope:** All ny og endret sidenavngiving.

**Hvorfor:** Uten ett kanonisk sted å slå opp navnet, drifter en funksjon til
å hete tre ting i tre ulike deler av produktet (mailen sier «betalingsoversikt»,
siden sier «Saldo & restanse», ⌘K sier «Restanse») — brukeren kan ikke koble
dem sammen. Se `regel/terminologi-laast` for selve synk-plikten; denne regelen
sier HVOR sannheten om navnet bor.

**Unntak:** Interne kodenavn (variabler, tabellnavn, rutestier) følger ikke
nødvendigvis visningsnavnet — `felleskostRestanse.ts` kan hete det selv om
siden viser «Saldo & restanse».

**Kilde:** Utledet av `regel/terminologi-laast`-presedensen (P30-navnebyttet,
SYSTEM.md 2026-08-06).

**Dårlig → godt:** En e-post som omtaler funksjonen som «utestående beløp» når
siden selv heter «Saldo & restanse» → e-posten bruker sidens eget navn.

---

## UI-primitiver

## regel/ingen-raa-skjemaelementer

**Regel:** Ingen rå `<input>`, `<textarea>`, `<select>` eller håndrullet
avkrysningsboks utenfor `components/ui/`. Bruk `Input`, `Textarea`, `Select`,
`Checkbox`.

**Scope:** Alt skjema-UI i `app/` og `components/`.

**Hvorfor:** Designsystem-audit 2026-08-31 fant 74 rå skjemaelementer utenfor
`ui/` — hvert ett en kilde til inkonsistent trefflate, fokusring og
feilvisning som må rettes ett sted om gangen i stedet for én gang i
primitivet. Budsjett-siden alene hadde den største enkeltlekkasjen, migrert i
Økonomi-sveipen samme uke.

**Unntak:** `OtpInput` er et dokumentert, bevisst unntak fra
«bruk aldri håndskrevet typografi» internt i SEG SELV (ett komponentsted, ikke
gjenbrukt håndrulling) — men er selv et primitiv i `ui/`, ikke et unntak fra
DENNE regelen.

**Kilde:** `arkiv/rapporter/DESIGNSYSTEM-AUDIT-2026-08-31.md`; SYSTEM.md
endringslogg 2026-08-31 («Fase 5: Økonomi-sveipen»).

**Dårlig → godt:** `<input className="border rounded px-2 py-1" />` på en ny
side → `<Input />` fra `components/ui`.

---

## regel/typografi-via-type-klasser

**Regel:** `font-size`, `line-height`, `font-weight` og `letter-spacing`
skrives ALDRI for hånd, og Tailwinds `text-lg font-medium tracking-tight`-klynge
brukes aldri. Bruk en `.type-*`-klasse eller `<Text variant>`.

**Scope:** All tekst i appen, unntatt print-flater (egne `--print-*`-baserte
klasser, se `regel/liste-med-handling-er-listrow` sin nabo-seksjon i
`tokens.md`) og `OtpInput` sitt dokumenterte unntak.

**Hvorfor:** Én token bærer alle fire egenskapene sammen, så en størrelse kan
aldri drifte fra sin egen linjehøyde. Designsystem-audit 2026-08-31 fant 91
håndskrevne typografi-props utenfor print — den klart største enkeltkategorien
av funn, selv om null Tailwind-typeklynger fantes (den delen av loven holdt).

**Unntak:** `OtpInput` sin ett-komponent, ett-sted stilbytte (se
`skill/frivio-ui/SKILL.md`s lov 1) — dokumentert i komponentens toppkommentar,
ikke gjenbrukt andre steder.

**Kilde:** `arkiv/rapporter/DESIGNSYSTEM-AUDIT-2026-08-31.md`; `SKILL.md` lov
1.

**Dårlig → godt:** `style={{ fontSize: 13, fontWeight: 600 }}` → `className="
type-label-13"` (eller nærmeste `.type-*`).

---

## regel/tre-vekter-400-leser-500-navngir-600-titler

**Regel:** Systemet har tre vekter, hver med én jobb. `400` (vanlig
label/copy) LESER — verdier, metadata, menypunkter, valgtekster. `500`
(`.type-label-*-strong`) NAVNGIR noe — en feltetikett over et skjemafelt, et
kolonnehode, en radtittel i en docs-liste, en `Callout`-tittel. `600`
(heading) er en TITTEL. Bruk aldri `600` bare for å få en tyngre etikett, og
lag aldri en falsk `500` med `font-medium` på en `.type-label-*`-klasse — se
`regel/typografi-via-type-klasser` for hvorfor det målte 400 uansett.

**Scope:** All bruk av `.type-label-*` i appen og i den distribuerte skillen
(`--frv-type-label-*-strong`).

**Hvorfor:** «Burde labels være medium weight?» — founder viste typografisidens
«Tall»-seksjon, der radtitlene («Beløp i oversikter vises UTEN øre», «Nøkkeltall
≥ 1 mill. komprimeres», «Avledet prosent over ±300 % blir tekst» …) sto i 400 og
«burde være medium». Label-skalaen selv forblir 400 (den er arbeidshesten, brukt
i 176 filer på tidspunktet for beslutningen) — det som manglet var et eksplisitt
500-steg for de tilfellene der en etikett ikke bare LESER, men NAVNGIR noe.

**Unntak:** `ListRow`-tittel forblir `.type-heading-14` (600) — egen,
tidligere founder-beslutning (bølge 3, 2026-09-10: «hovedtekst bør være
tydeligere enn støttetekst»).

**Reversert samme dag (SB6, founder-skjermbilde av «Startdato/Utløper/
Avtalenummer/Fornyelse» på `/design/components/field`):** `Field` sin nøkkel
ble først unntatt her med begrunnelsen at den LESER en verdi i stedet for å
NAVNGI et felt. Founder forkastet skillet: «du skjønner tegningen» — en nøkkel
over en verdi navngir akkurat som en feltetikett gjør, uansett om verdien er
redigerbar. `Field` og `DescriptionList` sine nøkler er derfor BEGGE
`type-label-12-strong`, ingen unntak lenger — `DescriptionList` var allerede
rettet samme dag (se komponentens egen kommentar), `Field` rettet i SB6-runden.

**Kilde:** Founder 2026-09-12, typografisidens «Tall»-seksjon
(`app/design/typography/TypographyPage.tsx`), reversert samme dag i SB6-runden
(skjermbilde av `/design/components/field`). `SKILL.md` lov 2.

**Dårlig → godt:** `className="type-label-14 font-medium"` (målte 400, ikke
500 — se `regel/typografi-via-type-klasser`) → `className="type-label-14-strong"`.

---

## regel/farger-via-tokens

**Regel:** Ingen hex-verdi eller `rgba()` skrives direkte i komponentkode.
Farge kommer fra en CSS-variabel (`var(--color-*)`), og et nytt semantisk navn
aliaseres KUN etter å ha målt at det underliggende scale-trinnet faktisk er
distinkt fra sine naboer i begge tema.

**Scope:** All farge i `app/` og `components/`, inkl. inline `style`.

**Hvorfor:** `middels`-prioritet ble nesten alias til `amber`/`warning` — men
den underliggende fargeskalaens mørke-tema `amber-800`/`900` er BOKSTAVELIG
samme hex (`#ff9300`), så to av fire prioritetsnivåer ville vært
pixel-identiske i mørk modus. Løsningen er en egen, nøytral gray-basert rolle
(`gray-700`/`-100`/`-400`/`-900` i stedet for en amber-alias), dokumentert i
`tokens.md`. Generalisert lærdom: «inherited scales are not guaranteed to be
monotonic.»

**Unntak:** De dokumenterte, bevisste avvikene i
`skill/frivio-ui/references/tokens.md` («Deliberate choices»-tabellen) —
disse ER token-definisjoner, ikke unntak fra regelen om å BRUKE tokens.

**Kilde:** `skill/frivio-ui/references/tokens.md`, seksjonen «Priority — its
own domain»; SYSTEM.md 2026-06-11 (violett-konsolidering, samme klasse feil).

**Dårlig → godt:** `color: '#fac742'` skrevet direkte på en ny prioritetspille
→ `var(--color-middels)`.

---

## regel/liste-med-handling-er-listrow

**Regel:** En liste der raden har en tilhørende HANDLING (klikk for detaljer,
rediger, slett, godkjenn) er `ListRow` i en `divide-y`-beholder. Ren
DATAVISNING uten rad-handling — en transaksjonstabell man kun leser, en
matrise — er `Table`.

**Scope:** Alle listevisninger i `app/` og `components/`.

**Hvorfor:** Transaksjonslisten i Regnskap brukte `Table` fordi den ble
bygget FØR `Table`-primitiven fantes og ble glemt i migreringslisten —
men raden HAR en handling (åpne detaljer), så doktrinen «raden har en handling
→ ListRow» sa hele tiden hva den skulle vært. Founder måtte si
«listekomponenter gjennomgående» to ganger før dette ble rettet, og
doktrinen ble deretter skjerpet på selve showcase-siden MED dette som
anti-eksempel.

**Unntak:** Auditforslag om å legge `Table` på en leverandørrad MED
handlinger ble eksplisitt AVVIST av en agent som fulgte denne regelen i stedet
for auditens forslag — riktig avvisning, ikke et unntak fra regelen selv.

**Kilde:** SYSTEM.md, endringslogg 2026-08-31 («Kjør på-runden … KONSISTENSFIKS»,
founder: «listekomponenter gjennomgående») og 2026-09-01 («Audit-rettevåg
2–4», om det avviste Table-på-leverandørrad-forslaget).

**Dårlig → godt:** Se `skill/frivio-ui/exemplars/transaksjonsliste-listrow.md`
for det fulle før/etter.

---

## regel/farget-smaatekst-bruker-text-token

**Regel:** Farget tekst under 18px bruker ALLTID en `-text`-variant
(`--color-success-text`, `--color-error-text`, `--color-warning-text`,
`--color-accent-text`, prioritets-variantene), aldri den rå semantiske fargen
direkte på tekst.

**Scope:** All tekst i appen — spesielt lys tema, målt på kortflate
(`#f2f2f2`).

**Hvorfor:** Rå semantiske farger klarer kun WCAG sin 3:1
grafikk-terskel (nok for ikoner/fyll), ikke 4,5:1-kravet til tekst. Målte feil
før disse tokenene fantes gikk ned mot 1,99:1 på lys kortflate. Appen ble
bygget mørk-først, så lys-modus småtekst er den vanligste regresjonen — nevnt
eksplisitt i AGENTS.md sin prosjektkontekst.

**Unntak:** Ikoner og fylte flater/badges (≥3:1-grafikk-kravet) kan bruke den
rå fargen. `amber`/`middels` trenger 50 %-blanding mot tekst-primær i stedet
for standard 72 % — amber er intrinsikt høy-luminans selv på sitt mørkeste
trinn.

**Kilde:** `skill/frivio-ui/references/tokens.md`, seksjonen «The `-text`
variants exist for a reason»; AGENTS.md, prosjektkontekst-seksjonen.

**Dårlig → godt:** `color: 'var(--color-warning)'` på en 13px statustekst →
`color: 'var(--color-warning-text)'`.

---

## regel/700-er-flate-900-er-forgrunn

**Regel:** Semantiske farger på steg `700` (`--color-success`/`-warning`/`-error`
og prioritets-varianten) brukes KUN som en fylt FLATE — aldri som tekst- eller
ikonfarge. Bærer flaten selv tekst, bruk `-solid`/`-fg`-paret, ikke steg `700`
direkte. Tekst og ikoner bruker ALLTID `-text` (steg `900`).

**Scope:** All farge i `app/` og `components/` — samme domene som
`regel/farget-smaatekst-bruker-text-token`, men presisert til selve
steg-rollen: `700` er flate, `900` er forgrunn, det finnes ikke en tredje bruk.

**Hvorfor:** Bølge 1 av token-kontrakten (2026-09-10) satte én fast rolle per
steg i skalaen (100–300 bakgrunn, 400–600 kant, 700–800 fylt flate, 900–1000
tekst/ikon). Måler man `700` som tekstfarge uansett hue, feiler kontrasten:
amber-700 målte 1,7:1 og teal-700 2,9:1 mot lys kortflate — begge langt under
WCAG sitt 4,5:1-krav til tekst. `900` er derimot kalibrert nettopp for det
bruket i begge tema.

**Unntak:** Ingen — `-solid`/`-fg` finnes presis for tilfellet der en fylt
`700`/`800`-flate MÅ bære en etikett oppå seg (f.eks. `Badge`/`Button`
danger-varianten); da er det `-fg`, ikke `700` selv, som setter tekstfargen.

**Kilde:** Kontrastmåling 2026-09-10 (amber-700 1,7:1, teal-700 2,9:1 på lys
surface); `skill/frivio-ui/references/tokens.md`, seksjonen «Status recipe».

**Dårlig → godt:** `color: 'var(--color-success)'` på en statusetikett →
`color: 'var(--color-success-text)'`; en fylt badge-flate med tekst bruker
`background: var(--color-success-solid)` + `color: var(--color-success-fg)`,
ikke `background: var(--color-success)` med hvit tekst hardkodet på toppen.

---

## regel/en-primaerhandling-per-flate

**Regel:** Den monokrome `primary`-knappen (systemets nøytrale signaturflate,
den mest visuelle vekten på siden) forekommer maks ÉN gang per flate. Alle andre
handlinger er `outline`, `ghost`, `accent` eller `soft`.

**Scope:** Alle sider og modaler.

**Hvorfor:** To `primary`-knapper på samme flate betyr at én av dem er feil —
øyet kan ikke lese to «viktigste handling»-signaler samtidig, og brukeren
(en styreleder som «ikke er interessert i grensesnittet ditt») skal aldri
måtte gjette hvilken som faktisk betyr noe akkurat nå.

**Unntak:** Et `ConfirmDialog` sin bekreft-knapp teller som en EGEN flate
(modalen), ikke en andre `primary` på siden bak den.

**Kilde:** `skill/frivio-ui/SKILL.md`, lov 4.

**Dårlig → godt:** «Lagre» og «Send til beboere» begge som `variant="primary"`
på samme skjermbilde → «Lagre» forblir `primary`, «Send til beboere» blir
`outline` eller flyttes til en handling som først blir tilgjengelig etter
lagring.

---

## regel/modal-gjore-accordion-lese

**Regel:** `CollapsibleSection`/accordion brukes KUN for å lese mer om en rad
man allerede ser — utvider på stedet, listen rundt består. `Modal`/`Popover`
brukes for alt man GJØR — skjema, valg, lagring, sletting.

**Scope:** All utvidbar UI i lister og skjemaer.

**Hvorfor:** Founder-beslutning 2026-08-14, ordrett: «Accordion kan brukes til
å lese mer informasjon som ikke får plass på raden; popup/popover brukes til
alt action-basert som endringer, lagring osv.» Begrunnelsen: en accordion
dytter alt under seg nedover, så man mister konteksten man nettopp
sammenlignet mot, og et skjema midt i en liste konkurrerer visuelt med radene
rundt. Utløseren var et registreringsskjema som åpnet INNE i en liste over
manglende avtaler på Drift → Avtaler.

**Unntak:** Ingen navngitt — regelen gjelder GJENNOMGÅENDE, eksplisitt sagt i
kilden («ikke bare der»).

**Kilde:** `public/design.md`, seksjonen «Accordion eller popover —
systemregelen» (founder-beslutning 2026-08-14).

**Dårlig → godt:** «Legg inn»-skjema som åpner inline inne i avtalelisten →
`AddFormPanel` som åpner skjemaet i en `Modal`.

---

## regel/ny-funksjon-far-funksjonsintro

**Regel:** En leveranse som gir brukeren en NY synlig evne (ny seksjon, knapp
med ny funksjon, automatikk som endrer hva en flate viser) inkluderer en
`FeatureIntro` plassert ved funksjonen — vist én gang per bruker,
dismissbar.

**Scope:** All ny brukervendt funksjonalitet. Unntatt rene visuelle endringer
og feilrettinger.

**Hvorfor:** «En funksjon ingen oppdager finnes ikke», og «null
opplæring»-KPI-en gjelder også det NYE — en styreleder som aldri finner
bankforslaget, har ikke fått noen verdi av at det ble bygget.

**Unntak:** Rene visuelle endringer (nytt utseende på noe som gjorde det
samme før) og feilrettinger utløser ikke en `FeatureIntro`.

**Kilde:** AGENTS.md, seksjonen «Ny brukervendt funksjonalitet skal
introduseres i flaten» (founder-beslutning 2026-08-31); SYSTEM.md endringslogg
2026-08-31 («Regnskap-siden omkomponert … ny FeatureIntro-primitiv»).

**Dårlig → godt:** Bankforslaget i fakturainnboksen lanseres tyst → en
`FeatureIntro` ved forslaget («Nytt: Frivio foreslår match fra banken»),
dismissbar.

---

---

## regel/en-nytt-boble-per-side

**Regel:** Maks ÉN `FeatureIntro`-boble er synlig per side. Har siden flere
nye evner å introdusere samtidig, samles de i ÉN boble via `nyheter`-proppen
(`{ id, tittel, beskrivelse }[]`) — badgen blir «Nytt (N)» og innholdet en
punktliste, i stedet for flere kort stablet under hverandre.

**Scope:** Alle sider og paneler som bruker `FeatureIntro`.

**Hvorfor:** Founder-tilbakemelding 13.09.2026, med skjermbilde av
/seksjoner: to `FeatureIntro` stablet under hverandre («Flere eiere per
seksjon» og «Nytt: faner, søk og massehandling») ble dømt «fungerer dårlig
slik det er nå dersom mer enn 1 ny ting». To uavhengige «Skjønner»-knapper på
samme side er et dobbelt avbrudd for noe som skal være lavterskel og
valgfritt å legge merke til.

**Unntak:** Ingen navngitt. Er kun én nyhet ulest (uansett om den kom via
`nyheter` eller det klassiske enkelt-kallet), ser boblen ut som før — det er
IKKE et unntak fra regelen, det er samme boble med færre elementer.

**Kilde:** `components/ui/FeatureIntro.tsx`, toppkommentaren «GRUPPESTØTTE»;
founder-melding 13.09.2026 (skjermbilde av /seksjoner).

**Dårlig → godt:** To `<FeatureIntro id="a" .../>` og `<FeatureIntro
id="b" .../>` rett under hverandre på samme side → én
`<FeatureIntro nyheter={[{id:'a',...},{id:'b',...}]} />`.

**Korreksjon 14. sep 2026 (founder, skjermbilde av «Byggets grunnlag, samlet»):** flere nyheter vises ÉN om gangen i samme boble — teller «1 av 2» ved «Nytt»-merket, «Neste →» (tertiary) bytter visning uten å avvise, «Skjønner» avviser gjeldende nyhet og går til neste uleste, boblen lukkes når ingen er igjen. Punktlisten fra 13. sep er erstattet. «Skjønner» er en KANTET knapp (`Button variant="secondary" size="sm"`) hvis venstrekant flukter med teksten over — tekstknappen lå 23 px inn og «misset alignment».

## regel/velg-en-av-fa-ingen-radio

**Regel:** «Velg én av et lite, fast antall alternativer» løses med
`PillTabs` eller `Select`. Radio-primitivet er reservert for lange lister med
beskrivelse per valg (se unntaket under).

**Scope:** Alle valg mellom et lite antall faste alternativer.

**Hvorfor:** Et bevisst utelatt mønster, ikke et glemt et — `PillTabs` gir
samme funksjon (ett valg av få) med bedre trefflate og visuell tydelighet enn
en radio-gruppe, og å ha to primitiver med overlappende funksjon (radio +
PillTabs) ville tvunget hvert kallested til å gjette hvilket som er «riktig»
denne gangen.

**Unntak (founder 2026-09-10, designrunde 2):** `Radio`/`RadioGroup` finnes nå som
primitiv — men KUN for lange lister (5+) der hvert valg trenger en egen
beskrivelseslinje (f.eks. valg av avtaletype med forklaring). 2–4 valg uten
beskrivelse er fortsatt `PillTabs`/`Select`. Regelen er altså ikke opphevet,
den har fått ett navngitt unntak; dokumentasjonen på design.frivio.no/components/radio
sier det samme.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Audit-rettevåg 2–4 …
‘velg én av få’-regelen (PillTabs/Select, ingen radio-primitiv med vilje)»).

**Dårlig → godt:** En ny radio-gruppe for lånetype (annuitet/serie) →
`PillTabs` med to piller.

---

## regel/tomtilstander-laerer

**Regel:** En tom tilstand (`EmptyState`) peker ALLTID på det FØRSTE STEGET
brukeren kan ta, aldri bare på at noe er tomt.

**Scope:** Alle `EmptyState`-bruk.

**Hvorfor:** En tom liste som bare sier «Ingen data ennå» lærer brukeren
ingenting; én som sier hva neste handling er, gjør den tomme tilstanden til en
del av onboardingen i stedet for en dead end. Sett i praksis i
velkomst-tomtilstanden («Legg til ditt første bygg» + «Steg 1 av 4: Bygget
først — så flytter dere inn dokumentene»).

**Unntak:** Ingen — selv en midlertidig eller feil-relatert tom tilstand
(«Ingen tilkoblet bank ennå») peker på handlingen («Koble til bank»), ikke bare
fraværet.

**Kilde:** `skill/frivio-ui/SKILL.md`, Voice-seksjonen («Empty states point at
the first step»); SYSTEM.md endringslogg 2026-08-18 (Onboarding-rekkefølgen,
velkomst-tomtilstandens forventningslinje).

**Dårlig → godt:** «Ingen vedlikeholdstiltak» → «Last opp en tilstandsrapport
for å få en vedlikeholdsplan» med lenke/knapp til opplastingen.

---

## regel/angre-etter-framfor-bekreft-for

**Regel:** En handling som er (a) hyppig, (b) allerede har en motsats i eksisterende
API (samme rute med motsatt verdi, eller en «un-»-operasjon) og (c) ikke er
destruktiv uten gjenoppretting, bekreftes IKKE med en dialog før den utføres.
Den utføres med én gang, og etterpå vises `Toast` (`components/ui/Toast.tsx`)
med hva som skjedde og en «Angre»-handling som kaller motsatsen.

**Scope:** Reversible handlinger med en eksisterende motsats i API-et — for
eksempel faktura/felleskostnad markert betalt, tiltak/styreplikt markert
fullført, varsel avvist, tiltak gjenåpnet fra Arkiv, seksjon merket
(ikke-)utleid. IKKE noe som sender e-post eller flytter penger (et purrebrev
eller en fakturautsendelse kan ikke angres etter at den er sendt — se
`sendFaktura()` i `FeePaymentsPanel.tsx`, som fortsatt bekrefter FØR).

**Utvidelse 2026-09-07 — UTSATT SLETTING:** founder-beslutningen samme dag
utvidet regelen til å dekke sletting av tiltak og dokumenter, tidligere
regelens eneste unntak («IKKE sletting uten gjenoppretting»). Mekanismen er
IKKE et `deleted_at`-felt (migrasjon + filtrering i alle lesinger, forkastet)
men `Toast`s `vedLukking(angret)` (se `components/ui/Toast.tsx`): raden
fjernes fra lokal state med én gang, og selve DELETE-kallet sendes først når
toasten lukkes UTEN at brukeren angret — `fetch(..., { keepalive: true })` så
kallet overlever en `pagehide`. Implementert på tiltak (`TaskColumnsView.tsx`
→ `TaskDetailModal.tsx` → `TaskEditModal.tsx`, ingen `ConfirmDialog` lenger)
og dokumenter (`DocumentsPanel.tsx`, `RelatedDocuments.tsx`, begge via
`/api/documents/[id]` — samme rute som fjerner filen fra Storage).

**Fortsatt bekreft-før, bevisst ikke migrert:** (1) sletting som KASKADERER
til noe UTENFOR selve raden som slettes — f.eks. en bygning-sletting som tar
med seg alle tiltak/dokumenter/rapporter (`DeleteBuildingButton.tsx`) — til
forskjell fra et tiltaks egne underdata (tilbud/befaringer/historikk via
`ON DELETE CASCADE` på `maintenance_tasks`), som IKKE regnes som «annet» siden
de forsvinner med tiltaket som en enhet uansett når slettingen faktisk skjer;
(2) `ServiceAgreementsPanel.tsx`s avtalesletting (inline «Slett avtalen?
Ja/Avbryt») — urørt, ikke fordi den kaskaderer, men fordi den ikke var en del
av 2026-09-07-beslutningen; (3) «Les av beløp» på faktura
(`app/api/fakturaer/[id]/lesav`, brukt fra `FakturaListe.tsx`) er UNDERSØKT og
bevisst UTELATT: det er en KI-drevet uttrekksoperasjon som bruker
AI-kvote per kall, ikke en toggle med en billig motsats — å «angre» ville
betydd å kjøre en ny, kostbar AI-avlesning, ikke en gratis reversering.

**Hvorfor:** UX-auditen 2026-09-01 fant at systemet er gjennomgående bekreft-FØR
og aldri angre-ETTER, og listet «undo-toast etter en handling» under «Mangler
helt». En bekreftelsesdialog foran en handling som uansett er trivielt å angre
er ren friksjon — den stopper brukeren for en avgjørelse som ikke trenger å tas
på forhånd, når den like gjerne kan angres i etterkant uten tap. Flere steder i
appen hadde løst dette allerede, hver på sin egen måte, FØR `Toast` fantes: en
permanent «Angre betalt»/«Angre utført»-knapp som blir utilgjengelig når raden
forsvinner fra visningen eller modalen lukker seg, og en håndrullet undo-linje
inni `NotificationBell`s dropdown (egen `undo`-state, egen timer) — nøyaktig
det mønsteret som gjør at samme ting bygges på nytt flere steder når det ikke
er trukket ut som ett primitiv.

**Unntak:** Ingen navngitt utover scope-avgrensningen over. Den ene eksisterende
angre-mekanismen i systemet FØR denne regelen — felleskostnad-justeringens
«Angre justeringen» (`FeeOverviewPanel.tsx`) — er en EGEN, bekreftet
korreksjonshandling (retter en tidligere feilregistrering, ikke en toggle) og
er bevisst IKKE migrert til denne regelen; den beholder sin `ConfirmDialog` fordi
selve JUSTERINGEN (ikke angringen) er den irreversible handlingen som trenger
bekreftelse.

**Kilde:** `arkiv/rapporter/UX-AUDIT-2026-09-01.md`, «Mot global standard» →
«Mangler helt» og `skill/frivio-ui/references/coverage-gaps.md` (tidligere
raden «Angre-mønster», fjernet i samme leveranse som denne regelen).
`components/ui/Toast.tsx` (primitivet), 2026-09-07-leveransen som tok den i
bruk på faktura (`FakturaListe.tsx`), tiltak (`TaskColumnsView.tsx`,
`TaskDetailModal.tsx`), styreplikt (`DutyDetailModal.tsx`) og varsel
(`NotificationBell.tsx`). Samme dags andre leveranse (utsatt sletting,
`vedLukking`): `ArkivView.tsx` (gjenåpne), `UnitsPanel.tsx` (utleid),
`DocumentsPanel.tsx`/`RelatedDocuments.tsx` (sletting).

**Dårlig → godt:** En `ConfirmDialog` («Marker denne fakturaen som betalt?») før
en trivielt reversibel avkryssing → handlingen skjer med én gang, og
`toast.vis({ tekst: 'Faktura merket betalt', handling: { tekst: 'Angre',
onClick: () => settBetalt(id, false) } })` etterpå.

---

## regel/navigasjon-knapp-er-button-href

**Regel:** Navigasjon som skal SE UT som en knapp bruker `<Button href="...">`
(rendrer `next/link` internt), aldri `<Link><Button></Link>`.

**Scope:** Alle knappe-formede lenker.

**Hvorfor:** `<Link><Button></Link>` gir to fokus-stopp for én handling (lenken
OG knappen fanger tab-fokus hver for seg) — en skjermleser- og
tastaturbruker opplever én synlig knapp som to interaktive elementer. `Button`
sin `href`-modus løser `aria-disabled`/`tabIndex`/blokkert klikk riktig når
knappen samtidig skal kunne være deaktivert, noe en ren `<a>` ikke kan uten
ekstra arbeid.

**Unntak:** Ingen — dette var 17 navngitte kallesteder ved funnet, alle
migrert som navngitt gjeld, ikke en avveining som gjelder noen steder og ikke
andre.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Mot 9/10, sjekkpunkt 1» —
Button `href`-grunnlaget for å fjerne de 17 `<Link><Button>`-parene).

**Dårlig → godt:** `<Link href="/okonomi"><Button>Gå til Økonomi</Button></Link>`
→ `<Button href="/okonomi">Gå til Økonomi</Button>`.

---

## regel/rettighet-vises-for-forsoket

**Regel:** Rettighetsforklaring er PROAKTIV overalt. En bruker uten skrivetilgang
til en handling skal se den deaktivert med en kort grunn FØR hun prøver — aldri
serverens 403-melding først etter forsøket, og aldri handlingen stille skjult
som om den ikke fantes.

**Scope:** Alle skrivehandlinger (knapper, ikonknapper, skjemafelt) i innlogget
app som en rolle uten `kanSkrive` (`lib/roles.ts`) ville fått avvist server-side.
Rollen slås opp på siden (server-komponent leser `organization_members.role`,
sender `kanSkrive` som prop ned — ikke en global klient-kontekst) og setter
`disabled={!kanSkrive} disabledReason={KUN_LESE_KORT}` på `Button`/`IconButton`,
eller `readOnly` + én grunnlinje på rå felt. Serveren håndhever fortsatt alltid
(`nektHvisKunLeser`/`krevSkrivetilgang` i `lib/skrivetilgang.ts`) — dette er
rent klientvisning av en grense som uansett finnes.

**Hvorfor:** TILSTANDSMATRISE-2026-09-07 fant 10+ ruter der en viewer ikke ser
noen forskjell før forsøket: skjemaet fylles ut, knappen trykkes, og FØRST DA
vises 403-teksten. Mønsteret fantes allerede tre steder (`SendToResidents`,
`TeamPanel`, Leverandørregisteret) uten å være normen — founder-beslutning
2026-09-08 gjorde det til det, og `disabledReason` ble bygget inn i `Button`/
`IconButton` selv nettopp for å gjøre det trivielt å legge til overalt i
stedet for at hvert kallsted håndruller `disabled` + en tekstlinje selv.

**Unntak:** Handlinger som er skjult for ALLE utenom Frivio-admin (`isFrivioAdmin`,
`lib/adminGate.ts`) — det er en annen grense enn organisasjonsrollen
(`kunLesetilgang`) denne regelen gjelder, og å vise «du mangler rettighet» til
en bruker som aldri skal vite flaten finnes ville vært en lekkasje, ikke en
forklaring. Tilsvarende: funksjoner skjult for alle unntatt admin/full tilgang
INNAD i sameiet (f.eks. `TeamPanel` sin medlemshåndtering, `harFullTilgang`) er
IKKE dekket av denne regelen — der er grensen «du har ikke dette vervet», ikke
«du har kun lesetilgang», og skjuling for et vanlig styremedlem (som uansett
har `kanSkrive`) er et bevisst, separat valg.

**Kilde:** Founder-beslutning 2026-09-08; TILSTANDSMATRISE-2026-09-07
(«Rettighetsforklaring»-kolonnen og lista «Krever vurdering»).

**Dårlig → godt:** Et «Lagre budsjett»-knapp som er aktiv for alle, og som
først etter klikk viser «Kun styret/administrator kan lagre budsjettet» fra
API-et → `<Button disabled={!kanSkrive} disabledReason={KUN_LESE_KORT}>Lagre
budsjett</Button>`, synlig deaktivert med grunnen med det samme siden lastes.

---

## regel/listerad-er-en-linje

**Regel:** En listerad (`ListRow`) viser innholdet på ÉN linje når beholderen er bred nok:
tittel, korte fakta inline med «·» (`secondary`), inntil to brikker (`meta`), tall og datoer
høyrestilt med tabellsifre (`value`), handlinger ytterst (`trailing`). Lang tekst kuttes med
ellipse — tittelen alltid sist. `subtitle` (egen linje under, maks to linjer) er unntaket for
tekst som ikke er korte fakta. På smale bredder får raden bli to linjer, og detaljer ligger i
en accordion under raden (`details`/`expanded`), aldri nøstet i selve raden.

**Scope:** Alle lister av poster i innlogget app. Bredden avgjøres av beholderen (container
query), ikke av skjermtypen — en smal kolonne på desktop oppfører seg som mobil.

**Hvorfor:** Founder 2026-09-09: «innholdet i én rad må i stor grad være på en linje om
mulig». Inventaret samme dag (77 kallsteder) viste at kallere limte fakta inn i tittelen med
«·», bygde `subtitle` som flex med manuell truncate og gjentok `tabular-nums` for hånd — alt
symptomer på at primitivet manglet `secondary` og `value`. Én linje per rad gjør lister
skannbare og tallene sammenlignbare.

**Kilde:** Founder 2026-09-09; inventar «Lister og listerader» 2026-09-09; `components/ui/ListRow.tsx`.

**Dårlig → godt:** `title={`${navn} · ${leverandør}`}` + `subtitle={<div className="flex …">…</div>}`
+ `trailing={<span className="type-label-13 tabular-nums">{kr}</span>}` →
`title={navn} secondary={[leverandør, kategori]} value={kr}`.

---

## regel/tomt-register-er-ukjent

**Regel:** Fravær av rader er aldri et svar. Et tomt register betyr «ikke registrert»
(ukjent), aldri «ingen» — og «ingen» er alltid en eksplisitt bekreftelse med
tidsstempel som styret har gitt. Alt som leses ut av registeret (skatteoppgave,
meglerpakke, prognose, rapporter) skiller de tre tilstandene: `ukjent` gir en mangel
med lenke til stedet det legges inn, `ingen` gir null/tom med kilde «bekreftet av
styret <dato>», `registrert` gir data.

**Scope:** Alle registre der et tall kan rapporteres videre til tredjepart eller
myndighet: lån/fellesgjeld (`lib/laan`), vedtatte satsendringer og fellesgjeld i
meglerpakken (`lib/meglerpakke`, status `bekreftes`), forsikring/polisenummer,
eierperioder. Gjelder også copy: aldri «Ingen lån» som overskrift på et tomt
register — «Ingen lån er registrert ennå».

**Hvorfor:** Skatteoppgaven sendte `sumAndelGjeld` = 0 til Skatteetaten for alle
sameier fordi generatoren tolket «ingen rader» som «ingen gjeld» (funnet 2026-09-08).
Formelt gyldig, faktisk feil, og eierne mistet gjeldsfradraget. Founder-brief
samme dag: «Ikke la AI finne på informasjon som mangler» — det gjelder kode like mye
som modeller.

**Kilde:** Founder 2026-09-08 (låneregisteret godkjent med nettopp denne
begrunnelsen); `lib/laan/typer.ts` §1; `lib/meglerpakke/typer.ts` §1.

**Dårlig → godt:** `andelGjeld: laan.length ? … : 0` → `andelGjeldForAar()` som
returnerer `mangler: ['Fellesgjeld er ikke registrert — legg inn lån … eller bekreft
at sameiet ikke har lån']` når status er `ukjent`, og 0 KUN når status er `ingen`.

---

## regel/betalingsoppfolging-uten-gebyr

**Regel:** Frivios betalingsoppfølging krever ALDRI purregebyr, forsinkelsesrente
eller andre tillegg fra beboeren. Stigen er påminnelse → purring → inkassovarsel
(inkassoloven § 9, minst 14 dagers frist) → «klar for inkasso» — alle uten gebyr.
Gebyr foreslås ikke, bygges ikke, og legges ikke inn som «av som standard».

**Scope:** Alt som produserer et krav mot en beboer: purrebrev (`app/purring`),
inkassovarsel, saldo per seksjon, fakturaer for felleskostnad, eksport til
inkassopartner. Gjelder også copy: ingen tekst som antyder at gebyr «kan komme».

**Hvorfor:** Founder-beslutning 2026-09-08: «Ikke purregebyr fra start iallefall.
Påminnelse og inkassovarsel uten gebyr føles riktig ut nå.» Frivio er styrets
verktøy, ikke en inndriver, og et sameie som ber naboen om penger skal gjøre
det på lovens minimum. Gebyr er en ny founder-beslutning, ikke en agent-forbedring.

**Kilde:** Founder 2026-09-08; brief «Inkasso via partner»; plan-artifact «Skatt,
inkasso, megler».

**Dårlig → godt:** «Purregebyr (kr 35) — av som standard, sameiet skrur på» →
ingen gebyrfelt i det hele tatt; inkassovarselet oppgir opprinnelig beløp,
forfall, referanse og 14-dagers frist, og ikke ett øre mer.

---

## regel/frivio-tjener-aldri-pa-inkasso

**Regel:** Frivio mottar aldri provisjon, kickback eller volumbasert betaling fra
en inkassopartner, og partnervalget i produktet påvirkes aldri av hva Frivio
tjener. Inkassopartner er et grensesnitt i koden (én implementasjon per partner),
og sameiet velger selv.

**Scope:** Inkasso-integrasjonen (partner-API, onboarding, statusflyt), all copy
som omtaler partneren, og avtaler founder inngår. En agent som bygger
partner-koden skal ikke legge inn sporing, rangering eller «anbefalt»-merking som
favoriserer én partner av økonomiske grunner.

**Hvorfor:** Founder-brief 2026-09-08: «ikke ta kickback». Insentivet ville satt
Frivio på motsatt side av bordet fra styret og naboen som skylder penger — og
det er tilliten hele produktet står på (jf. regel/rett-og-rolig).

**Kilde:** Founder-brief «Inkasso via partner» 2026-09-08; plan-artifact.

**Dårlig → godt:** «Anbefalt partner: Intrum (Frivio får 5 % per sak)» →
«Sameiet har avtale med <partner>. Bytt partner under Innstillinger.»

---

## Prosess og stemme

## regel/demo-speiler-systemet

**Regel:** En mockup, demo eller landingsside-visning viser ALDRI noe brukeren
ikke kjenner igjen fra den ekte appen — samme tall-format, samme knappetekst,
samme flyt-steg, samme fanenavn.

**Scope:** `components/landing/mockups/**`, `HeroDashboard.tsx`, all
markedsføringsvendt visning av produktet.

**Hvorfor:** Founder, ordrett: «Vi kan ikke ‘lyve’ og vise ting folk ikke
kjenner seg igjen i.» En paritetsrevisjon av fem eldre mockuper (2026-08-19)
fant at flere speilet feil flate helt (én viste en utgått dokumenttype som om
den fortsatt fantes i flyten), diktet opp innhold som ikke fantes på den ekte
raden, eller brukte feil formel for en verdi appen selv beregner annerledes.

**Unntak:** Ingen — selv en «illustrativ» demo skal være element-for-element
sammenlignbar med den ekte flaten den representerer, med et avvik dokumentert
i mockup-filens toppkommentar hvis ett bevisst gjenstår (f.eks. pinnede farger
i stedet for tema-tokens, når det er eksplisitt notert som en kjent,
akseptert avgrensning).

**Kilde:** SYSTEM.md, endringslogg 2026-08-19 («Paritetsrevisjon av de fem
eldre landingsside-mockupene»).

**Dårlig → godt:** En mockup som viser «Styrets beretning» som et dokument i
GF-flyten (det er det ikke lenger) → mockupen viser de tre ekte FLOW-stegene:
innkalling → innkomne saker → referat.

---

## regel/rett-og-rolig

**Regel:** Kopi svarer PÅ spørsmålet, også når svaret er «nei» eller «det kan
vi ikke love ennå» — ingen pynting, ingen omgåelse, ingen selgende overdrivelse.

**Scope:** All produkttekst og kunde-kommunikasjon (endringslogger til
piloter, feilmeldinger, hjelpetekst).

**Hvorfor:** «Skriv for styremedlemmer uten teknisk bakgrunn — rolig,
hjelpsomt, forklarende. Null opplæring skal kreves.» I praksis betyr det at et
`nei` skrives som et `nei`: pilot-changeloggens «Om avtalegiro — ærlig svar»
forklarer PRESIST hvorfor avtalegiro ikke er bygget (det krever en
bankintegrasjon med Nets/KID, ikke et fakturaformat-valg) i stedet for å
avlede med en vag «kommer snart».

**Unntak:** Ingen — «det skal ikke pyntes på» er brukt ordrett også om et reelt
sikkerhetshull (vedlegg skannes ikke for virus), ikke bare om produktmangler.

**Kilde:** `public/design.md`, Voice-seksjonen; `arkiv/rapporter/CHANGELOG-PILOT-2026-08-20.md`,
«Om avtalegiro — ærlig svar»; SYSTEM.md 2026-08-21 (fakturainnboks i
sikkerhetsnotatet, «det skal ikke pyntes på»).

**Dårlig → godt:** «Avtalegiro er under utvikling!» (når det faktisk ikke er
påbegynt) → en forklaring av HVORFOR det ikke er bygget, og hva Frivio bygger
i stedet som dekker mye av samme behov.

---

## regel/migrasjon-uten-sjargong-til-kunde

**Regel:** Migrasjoner kjøres ALLTID manuelt i Supabase Studio, aldri
automatisk. Kode som avhenger av en migrasjon som ikke er kjørt ennå, degraderer
synlig men ALDRI med teknisk sjargong («migrasjon 20260901 mangler», «kolonne
X finnes ikke») i noe en kunde kan se.

**Scope:** All ny kode som leser en kolonne/tabell fra en fersk migrasjon.

**Hvorfor:** En ny funksjon skal kunne merges og deployes FØR migrasjonen er
kjørt uten at kunden ser en feilmelding de ikke kan gjøre noe med — den
tekniske årsaken logges server-side (Sentry/console), aldri i UI-en. Flagget
konkret som UX-P1 i revisjonen 2026-09-01 («migrasjonssjargong tilbake i fire
kunderuter») og rettet samme dag.

**Unntak:** `/system`-flatene (Frivio-admin) kan vise migrasjonsstatus
eksplisitt — det er ikke kundevendt.

**Kilde:** AGENTS.md («No migrations run automatically»); SYSTEM.md
endringslogg 2026-09-01 («Mot 9/10, sjekkpunkt 1» — migrasjonssjargong ut av
fdv/org/notifications-rutene).

**Dårlig → godt:** En feilmelding «relation ‘bank_transaksjoner’ does not
exist» vist rått til kunden → en `Callout` som sier funksjonen ikke er
tilgjengelig ennå, mens den faktiske feilen logges til Sentry med kontekst.

---

## Veien til 9,5 (UX-strategi 11. sep 2026)

## regel/ordbudsjett-60

**Regel:** SYNLIG grensesnittstekst på standardvisningen av en arbeidsside —
undertitler, introkort, callouts, seksjonsbeskrivelser, knappetekster — skal
ikke overstige 60 ord, utenom data (radtitler, beløp, datoer) og utenom det
som ligger bak et klikk (modal, fane, CollapsibleSection, Begrep). Måles i
nettleseren (sveipet: `innerText` i `main` etter lasting, minus lister og
tabeller). I tillegg håndhever `scripts/tekstvakt.mjs` en STATISK ratchet på
all forfattet tekst per rute (JSX-tekstnoder og string-props som `title`/
`info`/`beskrivelse`/`description`/`tittel`/`subtitle`/`undertekst`/`hint`/
`label`/`text`/`tekst`/`placeholder`, inkludert modaler og tomtilstander):
dagens antall per rute er baseline, CI feiler hvis en rute FÅR FLERE ord.
Det statiske tallet er derfor alltid høyere enn 60 og skal ikke leses som
brudd på de 60 — det fanger drift, ikke måler målet.

**Scope:** Alle `app/(dashboard)/**/page.tsx`, utenom dynamiske `[id]`-ruter
og rene dokumentflater (Regler, Vedtekter — de ER dokumentet).

**Hvorfor:** Fem UX-gjennomganger side for side (42 sider, begge tema, 1280
og 375px) fant grensesnittstekst opp til 503 ord på én side (Finansiering),
421 (Innstillinger), 400 (Regnskap) — mens folk kun leser 20–28 % av tekst på
en skjerm (NN/g 2008). Resten er forklaring der struktur skulle vist:
undertitler, introkort og callouts som fortrenger reelt innhold uten å bli
lest. Founder-valg 1 i strategien: «Ordbudsjett 60 ord per arbeidsside som
tak i CI».

**Unntak:** Ingen navngitt utover dokumentflatene over — vakten er en
RATCHET, så eksisterende sider over 60 ord er ikke et brudd før de FÅR MER
tekst enn i dag; taket senkes når siden ryddes (`--oppdater`).

**Kilde:** UX-STRATEGI-2026-09-11 (`arkiv/rapporter/`), Målekort-raden
«Grensesnittstekst per arbeidsside»; founder-valg 1.

**Dårlig → godt:** En side med undertittel, introkort og seks avsnitts
forklaring (233–503 ord) → forklaringene flyttes til `Begrep`, `InlineNote`
under feltet, eller tomtilstanden — siden holder seg under 60 ord.

---

## regel/ingen-ikonknapp-uten-tekst-i-innhold

**Regel:** En knapp med tekstinnhold beholder den teksten på ALLE
skjermbredder — `hidden sm:inline` (eller tilsvarende) rundt en knapps tekst
er forbudt. Den eneste lovlige ikon-uten-tekst-formen er `Button
shape="square"|"circle"`, og den krever `aria-label` på TS-nivå (diskriminert
union) — umulig å glemme og få bygget til å kompilere.

**Scope:** Alle knapper i sideinnhold (ikke navigasjonsikoner som allerede
har egen `aria-label` via `IconButton`).

**Hvorfor:** Revisjonen fant «Legg til»/«Filter»-knapper som mistet
teksten sin under `sm` via `hidden sm:inline` på kallestedet — igjen sto en
38px ikonknapp uten synlig navn OG uten `aria-label`, uforståelig ved første
blikk og usynlig for skjermleser. Ikoner trenger tekst (NN/g).

**Unntak:** Ingen. Trenger knappen å bli smalere på mobil, korte selve ordet
(samme tekst, kortere formulering) — ikke skjul det bak et brekkpunkt.

**Kilde:** UX-STRATEGI-2026-09-11, mønster 2 («Handlinger uten navn»).

**Dårlig → godt:** `<Button><LeggTil/><span className="hidden
sm:inline">Legg til</span></Button>` → `<Button><LeggTil/>Legg til</Button>`
(eller et kortere ord, «Ny», hvis bredden faktisk er trang).

---

## regel/en-primaer-over-bretten

**Regel:** Utover `regel/en-primaerhandling-per-flate` (maks én `primary`
per flate) skal DEN primærhandlingen være synlig UTEN scroll på 375px. På
sider lange nok til at det ikke er mulig, legges handlingen(e) i en
`ActionBar` som kleber til bunnen av rulleområdet.

**Scope:** Alle sider i `app/(dashboard)`.

**Hvorfor:** Revisjonen fant fire distinkte brudd: Innstillinger (to
primærknapper samtidig), editorer (svart OG blå knapp om hverandre), Årsmøte
(ingen primær i det hele tatt), og Meglerpakke/Felleskostnad/Finansiering
der knappen lå i et kort nederst i innholdet — én til tre skjermhøyder ned
på 375px, usynlig uten lang scroll.

**Unntak:** Korte sider der primærhandlingen allerede er synlig uten scroll
trenger ikke `ActionBar` — en vanlig `Button` i innholdet er riktig der, og
`ActionBar` løser da et problem som ikke finnes.

**Kilde:** UX-STRATEGI-2026-09-11, mønster 3 («Én primærhandling, over
bretten»); Målekort-raden «Primær synlig uten scroll på 375px»; founder-valg
5 («Handlingsrad nederst på mobil for lange sider»).

**Dårlig → godt:** En «Lagre»-knapp nederst i et langt
finansieringsskjema, usynlig uten scroll på 375px → `<ActionBar><Button
variant="primary">Lagre</Button></ActionBar>`.

---

## regel/konsekvens-for-utsending

**Regel:** Enhver utsending (e-post/varsel til beboere, seksjoner eller
styret) og enhver annen bindende handling viser MOTTAKERANTALL og
konsekvens FØR bekreftelse — aldri en direkte send-knapp uten
forhåndsvisning.

**Scope:** Kommunikasjon (masseutsending), «Send til styret», og enhver
handling som ikke kan angres etterpå.

**Hvorfor:** Revisjonen fant at «Send til styret» sendte UMIDDELBART ved
klikk, uten bekreftelse eller antall mottakere vist. Prinsippet fra
strategien: bekreft der det koster, angre der det ikke gjør — Wise sitt
mønster «vis konsekvensen før bekreftelse».

**Unntak:** Handlinger som kan angres ETTERPÅ (Toast med angre-knapp)
trenger ikke en forhåndsvisning FØR — se `regel/angre-etter-framfor-bekreft-
for` for hvilken kategori en gitt handling hører til.

**Kilde:** UX-STRATEGI-2026-09-11, mønster 5 («Bekreft der det koster, angre
der det ikke gjør») og Bølge F («Bekreft og angre»).

**Dårlig → godt:** En «Send til styret»-knapp som sender direkte ved klikk
→ en bekreftelse/forhåndsvisning som viser «Sendes til 5 styremedlemmer» før
selve utsendingen skjer.

---

## regel/fagord-forklares-med-begrep

**Regel:** Ethvert fagord som krever forkunnskap forklares med `<Begrep
id="…" />` DER ordet står — aldri i en callout, undertittel eller eget
avsnitt et annet sted på siden. Forklaringen ligger ÉTT sted,
`lib/ordliste.ts` — aldri en lokal tooltip-variant.

**Scope:** All grensesnittstekst.

**Hvorfor:** Revisjonen listet ti fagord (FDV, tilstandsgrad, gnr/bnr,
annuitetslån/terminbeløp, brøk, helse-indeks, IB/UB, likviditet, verv/rolle,
BRreg) forklart ULIKT på ulike sider, eller forklart i tekst brukere ikke
leser (se `regel/ordbudsjett-60`). Kontekstuell hjelp slår omvisning (NN/g
2023: median sjekklistefullføring kun 10 %, Userpilot 2025).

**Unntak:** Ingen. Mangler et fagord i `lib/ordliste.ts`, legges det til
DER — aldri som en lokal variant på siden som trengte det.

**Kilde:** UX-STRATEGI-2026-09-11, mønster 1, og seksjonen «Ordene som
krever forkunnskap».

**Dårlig → godt:** En callout øverst på siden som forklarer FDV, ikke
gjentatt der ordet faktisk står lenger ned → `<Begrep id="fdv" />` der ordet
brukes, hver gang, uansett side.

---

## regel/avledede-tall-har-grense

**Regel:** Et avledet tall (prosent, endring, differanse) som kan bli
urimelig stort eller lite på grunn av en liten nevner, får en øvre/nedre
grense OG en forklarende setning i stedet for å vises rått. Store beløp i
nøkkeltall forkortes (mill./mrd.), ikke vist som elleve sifre.

**Scope:** Enhver utledet tallvisning (prosent, differanse, saldo) i
grensesnittet — ikke rådata i eksport/rapport til regnskapsfører.

**Hvorfor:** Revisjonen fant «2 175 500,8 %», «~999,0 %» og
«−11 468 281 851 kr» ukappet — en reell, men meningsløs divisjon (en liten
fjorårsverdi nær null gir en enorm prosentendring). Det største tallet på
skjermen skal svare på «er alt i orden?» (Mercury, Stripe) — ikke kreve at
leseren selv avviser det som en feil.

**Unntak:** Full presisjon i eksport/rapport til regnskapsfører eller
revisor — grensen gjelder VISNING i grensesnittet, ikke underliggende data.

**Kilde:** UX-STRATEGI-2026-09-11, mønster 7 («Tall som kan leses») og
Bølge E.

**Dårlig → godt:** En KPI som viser «2 175 500,8 %» fordi fjorårstallet lå
nær null → en satt øvre grense (f.eks. «> 999 %») med en forklarende setning,
eller en egen tomtilstand når nevneren er for liten til at en prosent gir
mening.

---

## regel/byggvelger-i-sidehodet

**Regel:** En kontekstvelger for siden (byggvelger, årsvelger o.l.) bor
ALLTID i `PageHeader` sin `context`-slot, i sidehodets høyre del — aldri
som en egen rad under tittelen, og aldri håndrullet lokalt på siden.

**Scope:** Alle sider i `app/(dashboard)` som trenger en byggvelger, en
periodevelger eller lignende sidekontekst.

**Hvorfor:** 21-punktsgjennomgangen 11. sep 2026 fant byggvelgeren plassert
ulikt fra side til side — noen som en egen rad rett under `PageHeader`,
noen inni innholdet — og hver plassering la til en hel rads høyde som ikke
fantes andre steder. Founder: «Byggvelger må ALLTID ligge oppe til høyre en
plass eller i header row. Den stjeler altfor mye høyde». `PageHeader` fikk
derfor en dedikert `context`-slot (til venstre for `action`) som roten for
løsningen — se `regel/kontekstvelger-stjeler-ikke-hoyde` for selve
høyde-begrunnelsen.

**Unntak:** Ingen. Har siden ikke en `PageHeader`, legg konteksten i sidens
øverste rad på samme visuelle høyde som en `PageHeader`-tittel ville hatt —
aldri som en egen rad nedenfor.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter).

**Dårlig → godt:** En byggvelger i en egen `<div className="mb-4">`-rad
rett under sidetittelen → `<PageHeader title="…" context={<ByggVelger />}
action={<Button>…</Button>} />`.

---

## regel/kontekstvelger-stjeler-ikke-hoyde

**Regel:** En kontekstvelger (bygg, år, periode) skal ALDRI legge til en
egen rad i sidens vertikale rytme. Den deler linje med sidetittelen —
`PageHeader` sin `context`-slot står til venstre for `action`, på samme
linje som `h1`.

**Scope:** Alle kontekstvelgere i `app/(dashboard)` (byggvelger,
`YearSelector` brukt som sidekontekst, tilsvarende periodevelgere).

**Hvorfor:** Samme funn som `regel/byggvelger-i-sidehodet`, men den
underliggende feilen er generell nok til å skille ut som egen regel: EN
ekstra rad kostet ikke bare piksler — på 375px dyttet den resten av
innholdet ned like mye som en hel `PageHeader` til, på hver eneste side som
hadde mønsteret. Prinsippet gjelder enhver fremtidig kontekstvelger, ikke
bare byggvelgeren som utløste funnet.

**Unntak:** Ingen.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter).

**Dårlig → godt:** En periodevelger i en egen rad mellom `PageHeader` og
sideinnholdet → samme velger flyttet inn i `PageHeader` sin `context`-slot.

---

## regel/tabs-visning-pilltabs-filter-yearselector-periode

**Regel:** Tre komponenter deler overflaten «bytt hva jeg ser», og skal
ALDRI se like ut eller brukes om hverandre: `PillTabs` er et FILTER i
innhold (prioritet, tidshorisont, et lite fast utvalg), `Tabs` bytter
VISNING mellom søskensider/-seksjoner som deler scope og datamodell
(understrek), og `YearSelector` velger en PERIODE (år) — aldri en fane.

**Scope:** Enhver flate som lar brukeren bytte hva som vises — filter,
visning eller periode.

**Hvorfor:** 21-punktsgjennomgangen fant periode (år) og visning (arkiv vs.
oversikt) implementert som `PillTabs` flere steder, og faner som skulle vært
en `Tabs`-understrek implementert som løse piller — tre ulike JOBBER som så
identiske ut visuelt, slik at brukeren ikke kunne se på formen alene hva som
ville skje ved klikk (bytte filter i samme liste vs. navigere til en annen
side vs. bla ett år frem/tilbake).

**Unntak:** Ingen. Trenger en side alle tre samtidig (f.eks. en `Toolbar`
med `PillTabs`-filter, en `Tabs`-rad for visning og en `YearSelector` for
periode), skal de tre fortsatt være visuelt distinkte — ikke smeltes sammen
til én rad med lignende piller.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter).

**Dårlig → godt:** Et årstall som bytter med `PillTabs` («2024» / «2025» som
piller) → `YearSelector` med pil-frem/pil-tilbake rundt årstallet.

---

**Tillegg 13. sep 2026 — slik ser du forskjellen** (faner-audit, 26 forekomster: 24 riktige, 2 rettet):

**Kilde:** Faner-audit 13. sep 2026 (fullstendig inventar av all `<Tabs`/`<PillTabs`/
`<YearSelector`-bruk i `app/` og `components/`, se
`faner-inventar.md`). 24 av 26 forekomster i selve app-UI-et var allerede
riktige — forvirringen founder pekte på var reell, men SMAL: to steder brukte
feil primitiv, ikke et systemisk problem.

**Testen, i praksis (spør i denne rekkefølgen):**

1. **Endrer valget URL-en / kan du dele en lenke til resultatet, og er det
   fortsatt DEN SAMME LISTEN under, bare filtrert?** → `PillTabs`. Eksempel:
   kildefilter i arkivsøk, statusfilter på fakturaer, prioritet/tidshorisont
   på vedlikeholdstiltak.
2. **Bytter valget til en ANNEN SEKSJON/ETT ANNET INNHOLD om samme
   entitet — ville du naturlig kalt de to alternativene «faner i et
   dokument»?** → `Tabs`. Eksempel: Detaljer/Innhent tilbud om samme tiltak,
   Betalinger/Saldo/Felleskostnaden om samme bygg, Kvartal/Liste/Etter
   område om samme årshjul. **Den vanligste feilen var nettopp denne:**
   `ArshjulView` og `TaskDetailModal` brukte `PillTabs` for et rent
   visningsbytte (fire ulike PRESENTASJONER av samme datasett, ingen
   filtrering skjedde) — rettet til `Tabs` i denne leveransen.
3. **Er valget et tall, en periode du blar ett steg av gangen (år, måned)?**
   → `YearSelector`, aldri de to andre — uansett om det bare er 2-3 år å
   velge mellom.
4. **Er valget 2-4 faste alternativer i et SKJEMA (ikke en liste under), der
   brukeren egentlig svarer på et spørsmål (Ja/Nei, «per seksjon» vs. «etter
   eierbrøk», sendekanal)?** → fortsatt `PillTabs` — dette er IKKE et filter
   på en liste, men kartet (`skill/frivio-ui/SKILL.md`, punkt 2) dekker
   eksplisitt «2-4 faste valg» under `PillTabs`/`Select`, ikke `Radio`. Vær
   ikke fristet til å kalle dette en «visning» bare fordi det ikke filtrerer
   noe — det er fortsatt ikke to seksjoner av samme entitet.

**Det normaliserte plasseringsmønsteret** (målt på tvers av 15+ sider som
allerede gjorde det riktig — ingen av dem trengte retting):

- `Tabs` (visning) er FØRSTE eller ANDRE element i sidens/seksjonens
  ytre `space-y-*`-container — rett under `PageHeader` (evt. etter et
  område-`XxxNav` på mobil, som på Styret/Økonomi/HMS/Avtaler-sidene).
  Ingen egen `mt-`/`mb-` trengs — avstanden til innholdet under kommer
  utelukkende fra forelderens `space-y-N` (typisk 4-8), ALDRI en
  wrapper-div rundt selve `<Tabs>` med egne flex-klasser (den ene
  forekomsten av dette — `ArshjulView` sin `flex justify-between`-div med
  bare ett barn — var en rest av noe fjernet, ikke et bevisst mønster, og
  er fjernet i denne leveransen).
- `PillTabs` (filter) står i en `Toolbar` sammen med `SearchInput`/`Button`,
  med `size="md"` — ALDRI løst i innholdet med egen avstand. Der `PillTabs`
  brukes som et 2-4-valgs SKJEMAFELT (ikke et listefilter, se punkt 4 over)
  står den i stedet inline i skjemaet/`ListRow`/`Modal`-innholdet akkurat som
  et hvilket som helst annet felt — ingen `Toolbar` der det ikke finnes en
  liste å filtrere.
- `YearSelector` (periode) står i `PageHeader` sin `context`-slot, ved siden
  av (ikke under) tittelen — aldri som en rad i innholdet.

**Tellere — når to nivåer FINNES på samme side** (`Tabs`-visning +
`PillTabs`-filter under, som `GjoremalListe` og `TaskTimelineWrapper`):
tellerne skal måle FORSKJELLIGE ting. Visningsnivået (`Tabs` sin `badge`)
teller det visningen faktisk viser (f.eks. «Å gjøre» = alle åpne, uavhengig
av kildefilteret). Filternivået (`PillTabs`) teller enten ingenting (ren
etikett) eller — om det har tall — tallet MÅ være regnet mot samme
søke-/filter-utvalg som resten av UI-et viser (`regel/faner-teller-live`).
Ingen forekomst i dette inventaret hadde samme tall duplisert på begge nivåer.

**Én gjenstående inkonsistens, ikke rettet her** (filen tilhører en annen
agents leveranse, `app/(dashboard)/arkiv/**`): `arkiv/page.tsx` sin `Tabs`
baker antallet inn i selve `label`-strengen (`Dokumenter (${n})`) i stedet for
å bruke `Tabs` sin dedikerte `badge`-prop, som `KommunikasjonTabs`,
`GjoremalListe` og `OkonomiNav` bruker. `PillTabs` MÅ bake tall inn i label
(komponenten har ingen `badge`-prop), men `Tabs` bør konsekvent bruke
`badge` når den har et tall å vise.

**Tillegg 14. sep 2026 — PeriodeVelger (år + valgfri måned, «alle år» lovlig):**

**Kilde:** Founder-oppdrag natt til 14. sep 2026 — periodefilter på
Bank-transaksjoner (`components/okonomi/Transaksjonsliste.tsx`) og Fakturaer
(`app/(dashboard)/okonomi/fakturaer/FakturaListe.tsx`).

**Regel:** `PeriodeVelger` (`components/ui/PeriodeVelger.tsx`) er primitivet
for «velg et år, og valgfritt en måned innenfor det året» i lister som spenner
flere år. Verdien er `{ aar: number | 'alle'; maaned?: number }` (måned 1–12,
kun gyldig når `aar` er et tall). **«Alle år» er et LOVLIG, ofte RIKTIG
standardvalg** i slike lister — ikke tving brukeren til å velge et år først
bare fordi `YearSelector` alene ikke kunne uttrykke «alle».

Bygget AV `YearSelector`, ikke ved siden av den: `YearSelector` fikk en
valgfri `alle?: boolean`-prop (diskriminert union på selve `alle`-proppen) som
legger til et «Alle år»-valg til venstre for pilene, UTEN å endre `year`/
`onChange` sin type for de to eksisterende kallerne (Årsmøte, Regnskap/
BetalingsHeader) — de kjenner fortsatt kun `number`. Måneden er en egen
`Dropdown` («Hele året» + 12 måneder) som kun vises når et KONKRET år er
valgt.

**Hvorfor ikke fra/til-datofelt:** Vurdert og forkastet. Styret tenker i år og
måned («vis meg september»), ikke i datointervaller — et par datofelt ville
tvunget brukeren til å regne ut 1.–30./31. i måneden selv.

**Mobilfelle (375px), rettet i samme leveranse:** Første forsøk lot
`YearSelector`+måneds-`Dropdown` stå i én ren `flex`-rad uten `flex-wrap`.
Ved 375px (der begge kontrollene sammen ikke har plass) klemte flexboksen i
stedet «Alle år»-knappen ned til under sin naturlige bredde, og teksten brakk
til to linjer («Alle» / «år») — fordi knappen manglet `whitespace-nowrap`, og
resten av kontrollen (tall, avkortet Dropdown-etikett) tåler klem uten synlig
brudd. Rettet ved (1) `whitespace-nowrap` + `shrink-0` i `YearSelector` sin
egen ramme, og (2) `flex-wrap` (ikke bare `flex`) i `PeriodeVelger` sin ytre
rad, slik at måneds-Dropdownen heller faller ned på egen linje enn å klemme
årskontrollen. Generaliser: **enhver komponent som kombinerer et primitiv med
en tekstbasert togglelabel («Alle X») og et av variabel bredde, må enten
låse toggle-teksten mot linjebrudd ELLER la raden brekke om — aldri anta at
en flex-rad «bare passer» uten å måle på 375px** (matcher AGENTS.md punkt 1:
«Ingen komponent er ferdig før den er sett på 375 px»).

**Fanetellere følger perioden også** (utvidelse av `regel/faner-teller-live`):
kallested filtrerer selv radene på periode FØR de når `DataTable`/egen
fane-telling, slik at «Betalt (5)» blir «Betalt (0)» når perioden ikke treffer
noen betalte fakturaer — nøyaktig samme prinsipp som søk allerede fulgte.
`DataTable` fikk en ny `ekstraFilter?: ReactNode`-prop for dette (rendres i
samme `Toolbar` som faner/søk, etter søkefeltet) — se `FakturaListe.tsx`.

**Verifisert (14. sep 2026, headless Playwright mot lokal dev-server, innlogget
via `/api/dev/login`):** Bank — år 2026 ga 241/65/176/0 (Alle/Inn/Ut/Må
kategoriseres) og sumlinje «241 transaksjoner · inn 236 600 kr · ut
1 000 109 010 kr»; september samme år ga 197/60/137/0 og «197 transaksjoner ·
inn 218 400 kr · ut 84 004 kr» — strengt mindre enn årstallet, som forventet.
Fakturaer — periodebytte endret «Betalt (5)» → «Betalt (0)» og «Alle (5)» →
«Alle (0)» live. `/design/components/periode-velger` sjekket på 1280px og
375px, lyst og mørkt tema — ingen konsollfeil, ingen horisontal sidescroll
(`document.documentElement.scrollWidth` ≤ `clientWidth` i alle fire
kombinasjoner) etter mobilfellen over ble rettet.

**Beslektet:** `regel/faner-teller-live`, `regel/verktoylinje-en-hoyde`,
`regel/en-nytt-boble-per-side` (periode ble lagt inn som en ny nyhet i
Fakturaer sin eksisterende `nyheter`-liste, ikke en ny boble; Bank sin
eksisterende `bank-filtre`-boble fikk utvidet tekst i stedet for en ny).

**Tillegg 14. sep 2026 morgen — PeriodeVelger ombygget til utløser + panel:**

**Hurtigvalg (founder 14. sep, samme formiddag):** panelet har tre hurtigvalg nederst — «Siste 3 år» (inneværende år og de to foregående, `'siste3'`) og «Alle år» som hakevalg, i tillegg til «Hele året» for valgt år. `periodeTilAar(verdi)` gir `{fra, til}` for API-et (`aarFra`/`aarTil` på Bank) og for klientpredikater (Fakturaer).

**Kilde:** Founder, skjermbilde av bryter+stepper-utgaven fra natten før
(«Alle år»-bryter ved siden av YearSelector sin ‹ — ›-stepper): «Denne er
ikke intuitiv. Kanskje begynne på årets år og gjøre 'alle år' om til en knapp
som åpner kalender med diverse valg?»

**Hva var galt med forrige utgave:** To separate kontroller ved siden av
hverandre («Alle år»-bryter + en stepper) leste ikke som ÉN periode. Verre:
i «alle år»-tilstand viste stepperens årstall en tom «—» — ingenting fortalte
hvilket år pilene faktisk ville lande på hvis man trykket dem.

**Regel (erstatter formen i forrige tillegg, IKKE verditypen):**
`PeriodeVelger` er nå ÉN utløserknapp (samme chrome som `Dropdown`
variant="field" — bevisst IKKE en `Button`-instans, se `Dropdown.tsx` sin
egen toppkommentar for hvorfor) som ALLTID viser gjeldende periode i
klartekst («Alle år» | «2026» | «september 2026», månedsnavn med små
bokstaver på norsk). Klikk åpner et `Popover`-panel (`role="dialog"`,
`aria-label="Velg periode"`), ovenfra:
1. Årsrad: `‹` (IconButton, «Forrige år») · årstall (`type-label-14-strong`)
   · `›` («Neste år»). Pilene endrer år UMIDDELBART (`{ aar }`, måned
   nullstilles) UTEN å lukke panelet — man kan bla år uten å miste
   månedsvalget av syne.
2. «Hele året»-knapp (aktiv når et konkret år er valgt og måned er tom) + et
   4×3 rutenett med tolv måneder (kortnavn «jan»…«des», `aria-pressed` på
   valgt, deaktivert for måneder frem i tid i inneværende år). Klikk på en
   måned setter `{ aar, maaned }` og LUKKER panelet.
3. Skillelinje + «Alle år» som eget fullbredde-valg med hake når aktiv —
   setter `'alle'` og lukker.

Verditypen ER UENDRET fra forrige tillegg: `{ aar: number | 'alle';
maaned?: number }`. Det som endret seg er UTTRYKKET, ikke modellen.

**Ny eksportert hjelpefunksjon:** `periodeEtikett(verdi): string` — ren
funksjon, testet uten DOM (`tests/unit/ui/periodeVelger.test.tsx`), brukes av
utløserknappen for etiketten.

**IKKE lenger bygget av `YearSelector`:** forrige tillegg sin `alle?:
boolean`-utvidelse på `YearSelector` er FJERNET igjen samme morgen —
`PeriodeVelger` har nå sin egen årsrad inni panelet, og ingen andre kallere
brukte `alle` (kun `PeriodeVelger` selv og showcase-demoen). `YearSelector`
sin kontrakt er dermed tilbake til ren `number`, uendret for de to
gjenværende kallerne (Årsmøte, Regnskap/BetalingsHeader). Måneds-`Dropdown`-
en fra forrige tillegg er også borte — månedsrutenettet er PeriodeVelger sitt
eget panelinnhold nå.

**Prop-endring:** `aarMax?: number` er erstattet av `aarListe?: number[]`.
Semantikken er IKKE symmetrisk: «Forrige år» sperres ved MINSTE år i lista
(`Math.min(aarListe)`), mens «Neste år» ALLTID sperres ved inneværende år —
uavhengig av `aarListe`. Begrunnelse: en liste kan ha data fra i fjor og i
år, men «neste år» skal aldri være mulig å bla til uansett hvilke år som
finnes i dataene (det finnes ingen transaksjoner i fremtiden).

**STANDARDREGEL (ny, gjelder generelt for periodefilter — ikke bare
PeriodeVelger):** kalleren avgjør standardverdien ut fra hva LISTEN ER:
- **Tidsserie** (Bank-transaksjoner: samme type data år etter år, man
  «blar» bakover i historikk) → start på INNEVÆRENDE år. Faller tilbake til
  siste år MED data hvis inneværende år er tomt (typisk rett etter en
  bankkobling der historikken er eldre) — se `Transaksjonsliste.tsx` sin
  første `hent()`, som sjekker `res.data.aar` etter første kall og bytter
  periode + henter på nytt hvis inneværende år mangler.
- **Arbeidsliste** (Fakturaer: rader som krever en handling, ikke bare
  historikk) → start på «Alle år». En forfalt faktura fra i fjor skal ikke
  forsvinne bare fordi kalenderen har bladd om til januar.

Fakturaer trengte INGEN kodeendring for dette — den startet allerede på
`{ aar: 'alle' }` fra forrige leveranse, og det var allerede riktig for en
arbeidsliste. Kun Bank sin standardverdi endret (fra `'alle'` til
inneværende år, med fallback-logikken over).

**Tastatur:** Piltaster (opp/ned/venstre/høyre) flytter fokus i
månedsrutenettet (roving, egne DOM-referanser, IKKE en listbox-modell —
rutenettet er ekte `<button>`-er, Enter/Space er native). Escape lukker med
fokusretur til utløseren (Popover sin `triggerRef`-mekanikk, ingen egen kode
i PeriodeVelger). Ved åpning flyttes fokus til knappen som representerer
GJELDENDE valg (`data-periode-valgt="true"` på nøyaktig én av «Hele
året»/månedene/«Alle år»), ikke alltid første måned.

**Kittet (`skill/frivio-ui/assets/frivio-kit.tsx`) bygget om likt** — samme
mønster som `OverflowMenu`/`Dropdown` der (kitet har ikke `Popover`, så
panelet er hand-rolled: `useFloatingPosition` + `createPortal` + delt
`useKlikkUtenfor`). Kitets `YearSelector` mistet `alle`-utvidelsen på samme
måte. Lagt til én ny inline «chrome»-SVG, `CalendarRangeIcon` (kitet har ingen
ikonavhengighet) — en tilnærming til lucide sin `calendar-range`, ikke
pikselnøyaktig kopi.

**Docs:** `/design/components/periode-velger` fikk en ny demo, «Åpent
panel» — `defaultOpen`/`mobilArk={false}` er nye props, KUN til showcase
(samme mønster som `Dropdown` sin «field-variant, åpen»-demo), aldri i faktisk
bruk.

**Beslektet:** `regel/faner-teller-live` (uendret), `regel/verktoylinje-en-
hoyde` (utløseren er fortsatt 40px i en Toolbar).

## regel/verktoylinje-en-hoyde

**Regel:** Søkefelt, filter og handlinger over en liste eller tabell står i
én `Toolbar`, og har alle ÉN felles høyde på desktop (40px: `SearchInput`,
`PillTabs size="md"`, `Button` md, `Dropdown` field) — aldri satt sammen med
egne `flex`-klasser per side.

**Scope:** Enhver liste-/tabellside med søk, filter og/eller en
handlingsknapp over innholdet.

**Hvorfor:** Founder 2026-09-11: «Søkefelt og filter må ha samme
fremtoning/høyde. Her er noe krøll i komponentene våre eller
implementeringen». Fakturaer, Vedlikeholdsplan, Bygghistorikk og Dokumenter
hadde hver sin håndrullede rad, og satte `SearchInput` (40px), `PillTabs`
(32px, standardstørrelsen `sm`) og knapper (40px) side om side — tre ulike
høyder i samme rad, og ulikt fra side til side. Løsningen var todelt:
`PillTabs` fikk en `size="md"` (36px piller, 40px bane) for nettopp denne
konteksten, og `Toolbar` samler kontrakten («alle barn er 40px på
desktop») ett sted i stedet for at hver side må huske den selv.

**Unntak:** Ingen. Trenger siden bare ÉN kontroll (kun søk, eller kun en
knapp), er en bar `SearchInput`/`Button` uten `Toolbar`-wrapperen fortsatt
riktig — regelen gjelder når to eller flere av dem står sammen.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter).

**Dårlig → godt:** En håndrullet `<div className="flex gap-2">` med
`SearchInput` og en løs `PillTabs` (28px) ved siden av en `Button` (40px) →
`<Toolbar end={<Button>…</Button>}><SearchInput .../><PillTabs size="md"
.../></Toolbar>`.

---

## regel/store-tall-komprimeres

**Regel:** Et nøkkeltall (KPI, StatCard, oppsummeringslinje) på 1 million
eller mer komprimeres til mill./mrd. (`formatBelopKort` i
`lib/format/tall.ts`) i stedet for å vises med alle sifre. Beløp i vanlige
oversikter og lister vises uten øre. Full presisjon (med øre) er forbeholdt
regnskapstabeller, høyrestilt med `tabular-nums`.

**Scope:** Enhver tallvisning i grensesnittet — KPI-er, StatCard,
oppsummeringslinjer, ordinære belopskolonner i lister.

**Hvorfor:** 21-punktsgjennomgangen fant elleve-sifrede beløp og
ukomprimerte millionbeløp i nøkkeltall-sammenheng — et tall en frivillig
styremedlem skal kunne lese på et øyeblikk blir i stedet noe som må telles
siffer for siffer. Se `regel/avledede-tall-har-grense` for det beslektede
(men distinkte) problemet med AVLEDEDE tall (prosent/differanse) som blir
urimelige av en liten nevner — denne regelen gjelder RÅTT beløp som bare er
stort fordi det er stort.

**Unntak:** Regnskapstabeller (fullstendig oversikt, årsregnskap) viser
alltid full presisjon med øre — det er nettopp DER detaljnivået hører
hjemme, høyrestilt med `tabular-nums` slik sifre linjer opp vertikalt.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter); UX-STRATEGI-2026-09-11, mønster 7.

**Dårlig → godt:** En KPI som viser «1 034 200 000 kr» → `formatBelopKort` gir
«1,0 mrd kr».

---

## regel/badge-en-linje

**Regel:** Et `Badge` med ikon og tekst holder de to på ÉN linje uansett
beholderens bredde — ikonet og teksten skal ALDRI kunne brytes fra
hverandre til to linjer.

**Scope:** Alle bruk av `Badge` med `icon`-prop.

**Hvorfor:** 21-punktsgjennomgangen fant `Badge` som brøt ikon og tekst til
to linjer i trange beholdere (en tabellcelle, en smal `ListRow`-meta-kolonne)
— en pille som bryter linje ser ut som et rendringsfeil, ikke en tilstand.
`Badge` fikk `whitespace-nowrap` + `shrink-0` på rotelementet slik at merket
i stedet krymper eller klippes med ellipse (`max-w-full truncate` på
tekst-spanet) før det noensinne brytes.

**Unntak:** Ingen.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter).

**Dårlig → godt:** Et `Badge` med ikon på egen linje og teksten under i en
tabellcelle på 90px → samme merke med `whitespace-nowrap`, som i stedet
klipper TEKSTEN med ellipse og beholder ikon+tekst på én linje.

---

## regel/actionbar-sist-og-uten-chrome-pa-desktop

**Regel:** `ActionBar` skal alltid stå SIST i sideinnholdet (etter siste
seksjon), og fra 640px rendres den som en VANLIG høyrestilt rad uten egen
bar-chrome (bakgrunn, kant, skygge) — ikke en sticky bunnrad. Chrome
(bakgrunn/kant/skygge) og overstyringene som fjerner den fra 640px settes i
KLASSER, aldri i inline `style`, slik at `sm:`-overstyringene faktisk vinner.

**Scope:** Alle bruk av `ActionBar` i `app/(dashboard)`.

**Hvorfor:** 21-punktsgjennomgangen fant to distinkte feil: (1) `ActionBar`
plassert midt i sideinnholdet i stedet for som avslutning, og (2) en tidlig
versjon som satte bar-chrome som inline `style` — inline-stil har høyere
presedens enn Tailwind-klasser uansett brytpunkt, så `sm:bg-transparent`
o.l. tapte alltid mot en `style={{ background: ... }}` satt uten
brytpunkt. Founder: «alignement er helt off, virker hardkodet».

**Unntak:** Ingen.

**Kilde:** Founder-tilbakemelding 2026-09-11 (21 punkter).

**Dårlig → godt:** `<div style={{ background: 'var(--color-surface)' }}
className="sm:bg-transparent">` (klassen taper alltid) →
`className="bg-[var(--color-surface)] sm:bg-transparent"` (samme
spesifisitetsnivå, brytpunktet vinner faktisk).

---

## regel/hold-for-a-bekrefte-kun-mest-destruktive

**Regel:** `HoldToConfirm` (hold inne 1,2 s, fyllet er bekreftelsen, ingen
dialog) brukes KUN på de 2–3 mest destruktive handlingene i systemet — slett
bygg, slett bruker/kunde. Alt annet destruktivt bekreftes med `ConfirmDialog`
(`useConfirm`), og det reversible med `Toast` + «Angre»
(`regel/angre-etter-framfor-bekreft-for`). Knappen er `Button secondary` med
feiltekst og feilkant, aldri den fylte `error`-varianten.

**Scope:** Alle destruktive handlinger i `app/(dashboard)` og `app/system`.

**Hvorfor:** Hold-for-å-bekrefte fjerner feilklikk-risikoen helt (ingen
angre-vei trengs), men koster en ny BEVEGELSE brukeren må lære — og
styremedlemmet på 50+ lærer den bare hvis den møtes sjelden og alltid betyr
det samme: «dette kan ikke angres». Brukes den på hver eneste sletting,
blir den en dialog i forkledning. Founder 2026-09-12: «Slett bygg: liker
Spectrum bedre» (lab-lærdom, punkt 1). Sekundærflaten, ikke fylt rød, er
founder 2026-09-11: «Slett bygg er for kraftig rød».

**Unntak:** `prefers-reduced-motion` — fyllet kan ikke skrus av (det ER
bekreftelsen), så komponenten faller selv tilbake til `ConfirmDialog` med
samme `onConfirm`. Det er komponentens ansvar, ikke kallstedets.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning (punkt 1);
`components/ui/HoldToConfirm.tsx`; `lib/holdToConfirm.ts` (tilstands-
maskinen, enhetstestet).

**Dårlig → godt:** `useConfirm({ title: 'Slett bygget?', … })` fra en
IconButton i faresonen på /eiendom/bygginfo/rediger → `<HoldToConfirm
onConfirm={slettBygg} dialog={…}><Slett size={14} /> Slett bygg
</HoldToConfirm>`. Og motsatt: «Slett tilbud» i `AvtaleTilbudListe` FORBLIR
`useConfirm` — et tilbud er ikke et bygg.

---

## regel/feiltilstand-har-prov-igjen

**Regel:** Når en HENTING feiler og innholdet den skulle vise mangler helt,
vises `ErrorState` (`components/ui/ErrorState.tsx`): tittel som sier hva som
ikke gikk, folkespråklig melding via `toUserMessage`, og «Prøv igjen» som
kaller kallstedets `load` og spinner til den er avgjort. Aldri en rå
`FormError`-linje der lista skulle stått. Teknisk tekst (statuskode,
serverens feilstreng) går i `details`, ikke i meldingen.

**Scope:** Alle klientkomponenter som henter data selv (`fetch` i
effekt/`load`) — paneler, lister, modaler med egen henting. IKKE feilede
HANDLINGER (lagre/sende/slette): der står innholdet fortsatt, og feilen
hører hjemme i `FormError` ved skjemaet eller en `Toast`.

**Hvorfor:** En feiltilstand uten «Prøv igjen» er en dead end — brukeren
laster siden på nytt (og mister filter/scroll) eller gir opp. Før 2026-09-12
viste kallstedene en rød tekstlinje; noen få hadde en håndrullet
«Prøv igjen»-knapp ved siden av (OppfolgingPanel), de fleste ingen vei
videre (BankKobling). Lab-lærdom punkt 8: «Error State sin prøv-igjen-knapp
med innebygd retry-spinner er et konkret hull hos oss». Samme geometri som
`EmptyState`, så de to kan bytte plass i samme slot uten at layouten hopper
— og samme prinsipp: tilstanden peker på det neste steget
(`regel/tomtilstander-laerer`).

**Unntak:** Når et nytt forsøk beviselig ikke hjelper (manglende rettighet,
utgått lenke) — da utelates `onRetry`, og meldingen må selv si hva neste
steg er.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning (punkt 8);
`components/buildings/felleskostnad/oppfolging/OppfolgingPanel.tsx` og
`app/(dashboard)/okonomi/BankKobling.tsx` (første to kallsteder).

**Dårlig → godt:** `if (hentefeil) return <FormError>{hentefeil}</FormError>`
→ `if (hentefeil) return <ErrorState compact title="Kunne ikke hente
bankstatus" onRetry={hentStatus} />`.

---

## regel/rod-er-unntaket-i-statusetiketter

**Regel:** I en rad eller kolonne med statusetiketter (`Badge`) er rød
UNNTAKET, ikke normalen. Statusspråket er «Fullført» (teal/`lav`) · «Pågår»
(`accent`) · «Venter» (`gray`) · «Forfalt» (red/`akutt`). En rød STATUS
(forfalt, feilet, utløpt) er alltid `contrast="low"` (error-light bakgrunn,
error-text). Solid rød (`contrast="high"`) er forbeholdt et ALARM-ikon —
aldri et tilstandsord.

**Scope:** Alle `Badge` med `variant="red"`/`"akutt"` i `app/` og
`components/`, og alle statuskart (`STATUS_BADGE`-typen `Record<…, variant>`).

**Hvorfor:** Founder 2026-09-12 (punkt 12): «Statusetikett: Frivio bedre,
men ton ned rød — den bør fremstilles som fullført og pågår.» Lab-en viste
`<Badge variant="red" contrast="high">Akutt</Badge>` som ett av fire
eksempler, og den solide flaten dominerte hele raden — det var eksemplet som
var feil, ikke komponenten. Et styremedlem skal lese en liste som «mest
fullført, noe pågår, én forfalt», ikke som en rad med alarmer. I appen var
alle røde etiketter allerede `low` (målt 2026-09-12: ingen kallsteder
bruker `contrast="high"`); regelen fester det som var praksis, så neste
kallsted ikke velger solid rød fordi det «ser viktigere ut».

**Unntak:** Ett alarm-IKON i solid rød (f.eks. akutt-tellingen på
/eiendom) — men da med `icon` og `aria-label`, ikke som tekstpille.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning (punkt 12);
`app/design/components/demos/Badge.tsx` (første eksempel), `components/ui/
Badge.tsx` (toppkommentar).

**Dårlig → godt:** `<Badge variant="red" contrast="high">Forfalt</Badge>` →
`<Badge variant="red">Forfalt</Badge>` ved siden av `<Badge
variant="teal">Fullført</Badge>` og `<Badge variant="accent">Pågår</Badge>`.

---

## regel/maletekst-ved-spor-er-primaer-og-tabular

**Regel:** Etikett og verdi som hører til et spor (`LoadBar`, `Progress`) står i
text-primary — hvit i mørkt tema — med etiketten i `type-label-14` og
verdien i `type-heading-14` med `tabular-nums`. Aldri sekundær/tertiær, og
aldri oppå selve fyllet. Sporet er en steg 700-FLATE
(`--color-success/-warning/-error`, `--color-accent`) og bærer ikke tekst.

**Scope:** Alle spor og målere: `LoadBar` (label/verdi-propene og radlister
som setter tekst selv), `Progress`, kvote- og belastningsvisninger.

**Hvorfor:** Sporet er tynt (6 px) og bærer nesten ingen egen informasjon —
det er tallet ved siden av som leses. Står tallet i dempet grå ved siden av
et mettet fyll, drukner det leseren faktisk trenger i dekoren. Tabular-nums
gjør at «7 av 10» og «12 av 10» står i samme kolonne når flere spor ligger
under hverandre.

**Kilde:** founder 2026-09-12, Spectrum-sammenligningen, om AI-kvoten
(UsageMeter ↔ LoadBar): «liker Spectrum bedre — tykkere skrift + hvit gir meg
mye her.»

**Dårlig → godt:** `Text label-13 tertiary` «AI-analyser» + `label-13
secondary` «7» ved siden av sporet → `<LoadBar label="AI-analyser i dag"
verdi="7 av 10" … />` med etikett i label-14 og verdi i heading-14
tabular-nums, begge text-primary.

---

## regel/kort-som-avvises-glir-ut-for-det-fjernes

**Regel:** Et kort brukeren avviser eller kvitterer ut (`FeatureIntro`, forslag,
banner) fjernes ikke på 0 ms: det kommer inn med `.pop-in` og går ut med
`.dismiss-out` (delte klasser i globals.css), og noden tas ut av DOM-en på
`animationend` — med en timer på 200 ms som fallback for
prefers-reduced-motion. Persistens som skjuler kortet permanent
(localStorage-flagg o.l.) skrives ETTER at animasjonen er ferdig, aldri ved
klikket. En handling som avslutter kortet («Slå på», «Bruk forslaget») lukker
med samme animasjon som «Skjønner».

**Scope:** `FeatureIntro` og alle kort/bannere med avvis- eller kvitter-ut-
knapp. Ikke modaler (de har `modal-in`/`overlay-in`).

**Hvorfor:** Et kort som forsvinner på 0 ms leses som at noe gikk galt — var
det jeg som lukket det, eller krasjet det? En utglidning på 150 ms bekrefter
at klikket ble registrert. Rekkefølgen er ikke pedanteri: `FeatureIntro`
leser engangsflagget via useSyncExternalStore på hver render, så et flagg
skrevet ved klikket ville skjult kortet midt i animasjonen — det så ut som at
animasjonen ikke virket.

**Kilde:** founder 2026-09-12, Spectrum-sammenligningen, om ny funksjon
(SuggestionBanner ↔ FeatureIntro): «liker Spectrum bedre» — apply/dismiss-
mikroanimasjonen.

**Dårlig → godt:** `onClick={() => { localStorage.setItem(nokkel, '1');
setSkjult(true) }}` → fase `apen → lukker → lukket`: klikk setter `lukker`
(klassen `dismiss-out`), `animationend` skriver flagget og setter `lukket`.

---

## regel/sammenleggbar-hode-og-kropp-beveger-seg-som-en-ting

**Regel:** I en sammenleggbar seksjon roterer chevronen med SAMME varighet og
kurve som innholdet felles inn/ut (`--duration-popover`, `--ease-spring`), og
innholdet toner inn (opacity 0→1) mens høyden vokser, så teksten ikke klipper
i overkant. Hodet er en avrundet flate med hover `gray-alpha-100` og den
globale fokusringen. Lister av spørsmål/forklaringer bruker
`variant="ghost"` (ingen kant/kort, kun skillelinje under, chevron til
høyre); grupper av rader/kort under en overskrift bruker default.

**Scope:** `CollapsibleSection` (begge varianter), `ArshjulView` sin lokale
seksjon og alt annet som bruker `.collapsible-rows`.

**Hvorfor:** Et chevron som snapper på 180 ms mens innholdet bruker 150 ms
på å vokse leses som to ting som skjer etter hverandre — ikke som én
seksjon som åpner seg. Uten opacity dukker den øverste tekstlinjen opp
avklippet i det første bildet, og det er den man ser på. Ghost finnes fordi
seksjonsoverskrift-uttrykket (dempet tittel, linje ut til høyre) er feil
for en liste av korte spørsmål: der er spørsmålet selve innholdet og skal
stå i primærfarge.

**Kilde:** founder 2026-09-12, Spectrum-sammenligningen, om sammenleggbar
seksjon (Accordion ↔ CollapsibleSection): «liker Spectrum bedre» — jevnere
høydeanimasjon og uttrykk.

**Dårlig → godt:** «Forutsetninger og forklaring» som default-seksjon med
skillelinje ut til høyre og chevron på 0.18s ease → `variant="ghost"`, chevron
og innhold på `--duration-popover`/`--ease-spring`, innholdet toner inn.

---

# Kandidat-regler — Kari-agentisk UI (Spectrum-sammenligning 2026-09-12)

Skrevet som input til `skill/frivio-ui/references/produktskjonn.md` (samme
format som filen selv: Regel/Scope/Hvorfor/Unntak/Kilde). IKKE lagt inn i
produktskjonn.md av denne leveransen — founder ba eksplisitt om at disse
skulle skrives hit for gjennomsyn først. Kopier inn ordrett (eller rediger)
når de er godkjent.

---

## regel/kari-forslag-en-vs-plan

**Regel:** Et Kari-svar med NØYAKTIG ÉN gyldig ```kari-forslag-blokk vises som
`ProposalCard` (ett godkjenn/avvis-par). Et svar med TO ELLER FLERE blokker
vises ALDRI som flere frittstående `ProposalCard`-kort etter hverandre — det
blir én samlet `AgentPlan` (avkryssbare steg, én «Kjør planen»-knapp), som
går over i `AgentSteps` mens de valgte stegene kjører.

**Scope:** `components/AssistantWidget.tsx` (`send()`, `KariProposalBlock`,
`KariPlanBlock`), `lib/kariPlan.ts` (`finnKariForslag`).

**Hvorfor:** Flere separate godkjenn/avvis-kort i samme svar tvinger brukeren
til å ta N uavhengige beslutninger om noe som Kari presenterte som ÉN samlet
tanke, og gir ingen måte å se eller styre REKKEFØLGEN handlingene skjer i.
Founder sammenlignet Spectrum UI mot Frivio 12. sep 2026 og valgte eksplisitt
Spectrums AgentPlan-mønster for dette («Kari planlegger — liker Spectrum
bedre»).

**Unntak:** Ingen i dag — kun ÉN handlingstype er registrert i
`lib/kariActions.ts` (`legg_til_innkommet_sak`), så en reell plan med ≥2 steg
kan ikke oppstå før flere typer legges i registeret. Parsing/rendering-grenen
finnes likevel allerede og er dekket av `tests/unit/kariPlan.test.ts`.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning.

---

## regel/agentplan-steg-forhandsvalgt

**Regel:** Hvert steg i en `AgentPlan` er `valgt: true` som utgangspunkt.
Brukeren skrur AV det hun ikke vil ha — hun skrur aldri PÅ handlinger Kari
foreslo, fordi ingen handling kjører uten at brukeren aktivt trykker «Kjør
planen» uansett.

**Scope:** `components/ui/AgentPlan.tsx`, initialiseringen i
`components/AssistantWidget.tsx` sin `send()` (`valgt: true` på hvert
plan-steg fra `godkjenteForslag`).

**Hvorfor:** Planen er allerede bak ett samlet godkjenningssteg («Kjør
planen»); å i tillegg kreve at brukeren krysser AV hvert steg manuelt før hun
kan kjøre noe som helst, er dobbel friksjon for det vanlige tilfellet (kjør
alt Kari foreslo), og gjør avvik (fjern ett steg) til unntaket i UI-en i
stedet for normalen.

**Unntak:** Ingen navngitt.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning.

---

## regel/plan-stopper-ved-forste-feil

**Regel:** Kjører en `AgentPlan`, og ett steg feiler mot
`/api/kari-actions`, stoppes RESTEN av planen umiddelbart — de gjenværende
stegene forblir `venter`, aldri `kjorer`. Planen fortsetter ALDRI forbi et
feilet steg automatisk.

**Scope:** `components/AssistantWidget.tsx` sin `runPlan()`.

**Hvorfor:** Handlingene i en plan kan ha rekkefølge-avhengigheter brukeren
ikke ser (samme antakelse som gjelder `regel/forventet-vs-bokfort-ikke-
summeres`-familien: vis aldri mer enn det som faktisk er bekreftet). Å
fortsette å utføre steg 3 og 4 etter at steg 2 feilet, uten at brukeren fikk
sjekke HVORFOR, risikerer å bygge videre på en feilaktig forutsetning. Å
stoppe og vise nøyaktig hvilket steg som brøt er alltid tryggere enn å gjette
at resten fortsatt er riktig.

**Unntak:** Ingen navngitt. Skulle et fremtidig steg være uavhengig av de
foregående, vurder da en eksplisitt «fortsett likevel»-handling i `AgentSteps`
— ikke stille videre-kjøring.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning.

---

## regel/dismiss-out-for-avvist-forslag

**Regel:** Når brukeren avviser et Kari-forslag (`ProposalCard`, `status=
"avvist"`), spiller kortet ALLTID `.dismiss-out` (delt animasjonsklasse,
globals.css) før det fjernes fra state — det forsvinner aldri med et hakk.
Kallstedet fjerner forslaget i `onDismissed`-callbacken (kalt på
`animationend`), ikke synkront i klikk-handleren.

**Scope:** `components/ui/ProposalCard.tsx`, `components/AssistantWidget.tsx`
(`rejectProposal` setter status, `removeProposal` kalles først fra
`onDismissed`).

**Hvorfor:** Et forslagskort som bare forsvinner momentant midt i en
meldingsliste leser som en feil/et hakk, ikke en bekreftet handling — spesielt
siden brukeren nettopp klikket midt i det kortet. Samme prinsipp som
`.pop-in` på godkjent-tilstanden: enhver tilstandsendring i et Kari-forslag
skal ha en synlig, fysisk overgang, aldri et hardt kutt. `.dismiss-out` er en
av de FIRE delte bevegelsene founder valgte fra Spectrum-sammenligningen
(stagger-in, dismiss-out, fill-x, thinking-dot — se globals.css), og dette er
det første reelle bruksstedet for den.

**Unntak:** `prefers-reduced-motion` slår animasjonen av (samme globale
guard som resten av bevegelsesklassene) — kortet fjernes da uten
overgangsramme, men fortsatt via `onAnimationEnd` (animasjon med `duration:
0` fyrer fortsatt event'et, se globals.css sin reduced-motion-blokk).

**Kilde:** founder 2026-09-12, Spectrum-sammenligning.

---

## regel/tenker-indikator-er-delt

**Regel:** Enhver «Kari tenker/svarer»-indikator i appen bruker delte
`ThinkingDots` (`components/ui/AgentSteps.tsx`) — aldri en ny, lokalt
håndrullet prikke-animasjon.

**Scope:** `components/AssistantWidget.tsx` (chatboblen mens svaret streames
— erstattet den tidligere lokale `TypingDots`-funksjonen), `AgentSteps` sin
egen `thinking`-tilstand.

**Hvorfor:** Frivio hadde allerede ÉN håndrullet ventende-prikker-
implementasjon (`TypingDots`, tre `<span>` med `assistant-bounce`-animasjon)
FØR denne leveransen — nøyaktig ett duplikat unna to. `ThinkingDots` bruker
den delte `.thinking-dot`-klassen (globals.css, en av de fire bevegelsene
founder valgte fra Spectrum-sammenligningen) og er eksportert nettopp for at
neste «AI tenker»-visning (et annet panel, en annen flate) skal importere
den, ikke gjenoppfinne den.

**Unntak:** Ingen navngitt.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning.

---

# Regler fra MultiSelect-leveransen (2026-09-12)

Kandidater til `skill/frivio-ui/references/produktskjonn.md` — lagt her per
oppdrag, IKKE skrevet inn i produktskjonn.md selv.

---

## regel/vendoret-kode-arver-aldri-fargene

**Regel:** Når en komponent porteres fra en ekstern/annen-prosjekt-referanse
(shadcn, en cmdk-basert lab-komponent, et annet arbeidstre), overføres ALDRI
referansens egne fargeklasser (`bg-accent`, `text-muted-foreground`, rå
`blue-500` osv.) — kun STRUKTUREN og INTERAKSJONEN. Hver farge skrives om til
et `--color-*`-token eksplisitt, linje for linje, før komponenten regnes ferdig.

**Scope:** Enhver porting fra `.claude/worktrees/*` eller andre eksterne kilder
inn i `components/ui/`.

**Hvorfor:** cmdk sin uthevede rad (`data-[selected=true]:bg-accent`) i
referanseimplementasjonen pekte på et Tailwind-tema hvor `accent` var
kalibrert til rå `blue-500` — usynlig i selve komponentkoden (ingen rå hex å
gripe i), men reelt feil i et prosjekt der `accent` betyr noe helt annet.
Isolert sett en lett feil å overse fordi klassenavnet SER nøytralt ut
(«accent» høres ut som et tema-hook, ikke en hardkodet farge).

**Unntak:** Ingen — selv en enkelt, «nesten riktig» arvet fargeklasse er
grunnen til at et helt designsystem til slutt har to fargespråk.

**Kilde:** MultiSelect-leveransen 2026-09-12 (`components/ui/MultiSelect.tsx`),
portering fra `components/spectrumui/multiple-selector-dependencies.tsx`.

---

## regel/generisk-primitiv-eier-ikke-forretningsregler

**Regel:** En delt `components/ui/`-primitiv skal ALDRI kode inn en regel som
bare gjelder ÉN bruker av den (f.eks. «disse to chip-typene utelukker
hverandre»). Slike regler hører hjemme i KALLSTEDET, selv om det betyr at
kallstedet må skrive noen linjer selv-håndhevende `onChange`-logikk.

**Scope:** `components/ui/MultiSelect.tsx` og enhver fremtidig bruker av den.

**Hvorfor:** Mottakervalget i Kommunikasjon trenger at «Alle beboere»/«Styret»
er gjensidig utelukkende med enkelt-seksjoner (samme kontrakt som den gamle
PillTabs-en ga: ÉN `Mottakergruppe` om gangen mot API-et). Om MultiSelect
selv hadde kodet inn «gruppe-type chips er eksklusive», ville den vært
ubrukelig for NESTE bruker som faktisk vil kombinere flere kategori-chips
fritt (f.eks. UnitsPanel sin EmailModal, som er notert som kandidat, IKKE
gjort i denne leveransen). Reglen bor derfor i `Komponer.tsx` sin
`onMottakerChange`, ikke i primitivet.

**Unntak:** Ingen kjent ennå — oppstår et ekte behov for at PRIMITIVET selv
skal håndheve gjensidig utelukkelse på tvers av flere kall (ikke bare denne
ene), bør det bli en eksplisitt, navngitt prop (f.eks. `eksklusiveGrupper`),
ikke en hardkodet antakelse.

**Kilde:** MultiSelect-leveransen 2026-09-12, `components/kommunikasjon/Komponer.tsx`.

---

## regel/aksepter-bibliotek-a11y-begrensninger-skriftlig

**Regel:** Når et tredjeparts interaksjonsbibliotek (her: cmdk) har en KJENT,
udokumenterbar ARIA-begrensning (attributt kan ikke overstyres via props,
eller biblioteket bruker et attributt til noe annet enn det appens egen
UX-modell trenger), skal begrensningen (a) skrives ned i komponentens
toppkommentar, IKKE bare oppdages på nytt av neste person, og (b) kompenseres
med en enkel, tilgjengelig SIDE-KANAL (f.eks. `sr-only`-tekst) fremfor å bygge
om hele interaksjonsmotoren for å «fikse» ett attributt.

**Scope:** Enhver komponent bygget på et tredjeparts headless-bibliotek
(cmdk, og fremtidige tilsvarende).

**Hvorfor:** cmdk setter `aria-expanded="true"` på søkefeltet UBETINGET
(hardkodet i biblioteket, spredt ETTER kallstedets egne props — kan ikke
overstyres), og bruker `aria-selected` på en rad til å bety «tastatur-uthevet»
i stedet for «er en av de valgte chipsene» — riktig for en kommandopalett
(cmdk sitt opprinnelige formål), feil for en ekte multi-select-listboks. Å
skrive en helt egen keydown/filtrerings-motor for å unngå disse to attributtene
ville vært akkurat den dupliseringen AGENTS.md advarer mot — løsningen er å
akseptere begrensningen, dokumentere den, og legge til en skjult
(«, valgt»)-tekst per rad så skjermleser likevel får riktig informasjon.

**Unntak:** Blir cmdk sin egen håndtering av dette rettet oppstrøms i en
senere versjon, fjern kompensasjonen og kommentaren sammen med oppgraderingen
— ikke la et daterte «kjent avvik» bli stående etter at avviket er borte.

**Kilde:** MultiSelect-leveransen 2026-09-12 (`components/ui/MultiSelect.tsx`,
toppkommentaren «TO KJENTE, AKSEPTERTE AVVIK FRA cmdk»), cmdk 1.1.1
(`node_modules/cmdk/dist/index.mjs`).

---

# Nye regler — Spectrum-sammenligning runde 2 (founder 12. sep 2026)

Format som `skill/frivio-ui/references/produktskjonn.md`. Levert til scratch per
oppdragets instruks (ikke skrevet direkte inn i produktskjonn.md — den fila er
utenfor denne leveransens filliste). Lim inn i produktskjonn.md i konsolideringen.

---

## regel/velger-viser-verdien-ikke-etiketten

**Regel:** En `Dropdown`-trigger (`variant="field"` eller `"nav"`) viser BARE
valgt verdi — aldri et `groupLabel:`-prefiks foran den. Etiketten lever videre
som aria-kontekst (`aria-label` utledes som `${groupLabel}: ${valgt verdi}` når
`ariaLabel` er utelatt) og som overskrift øverst i listen — ikke i selve
triggerteksten.

**Scope:** `components/ui/Dropdown.tsx`, alle kallsteder (`ByggVelger`,
`OrgSwitcher`, `HistorikkListe`, `BudsjettView`) og ethvert framtidig kallsted
som setter `groupLabel`.

**Hvorfor:** «Bygg: Solvang» ble aldri lest som to opplysninger — det ER
Solvang som er interessant, prefikset var støy limt fast i triggeren. Et
element med bare «Alle» som visningsverdi blir tvetydig når prefikset
forsvinner: gi elementet et selvbærende navn («Alle bygningsdeler»), ikke et
gjeninnført prefiks.

**Unntak:** Ingen.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning runde 2 (A8 Dropdown ↔
Select, `ui/select.tsx`).

**Dårlig → godt:** «Bygningsdel: Alle» i triggeren, ett element kalt «Alle» i
lista → triggeren viser bare valgt verdi («Alle bygningsdeler» eller et
byggnavn), `groupLabel` står som overskrift i lista og i aria-label.

---

## regel/listerad-baerer-status-til-venstre

**Regel:** Når STATUS (ikke type/kilde) er det viktigste en liste skannes for,
tegnes den som et ikon i en 20px tone-brikke i `ListRow` sin `leading`-posisjon
(`status`-proppen: `{ tone, icon? }`) — ikke som en tekstbrikke alene lenger
ute i raden. `done` (gjennomstreket tittel, tertiær farge) markerer en
fullført RAD i samme slengen — ikke et eget avkrysset skjemafelt.

**Scope:** `components/ui/ListRow.tsx` (`status`/`done`-proppene og den
eksporterte `ListRowStatusIcon`). Statusdrevne lister — Å gjøre
(`components/gjoremal/GjoremalListe.tsx`), Vedlikeholdsplan
(`components/tasks/TaskColumnsView.tsx`) og Seksjoner
(`components/buildings/UnitsPanel.tsx`) er de tre første.

**Hvorfor:** TaskRows sitt statusikon (hake/kryss/spinner/stiplet sirkel) leser
raskere enn en ren tekstbrikke plassert et annet sted på raden — øyet finner
status i SAMME blikk som det finner raden selv.

**Unntak:** En rad som trenger et EKSTRA leading-element (f.eks. en
avkrysningsknapp) I TILLEGG til statusen komponerer `leading` selv med den
eksporterte `ListRowStatusIcon`, i stedet for `status`-proppen (som kun fyller
`leading` når `leading` er utelatt) — se `TaskRow` i `TaskColumnsView.tsx`.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning runde 2 (A12 ListRow ↔
TaskRows: «Definitivt Spectrum. Denne bør vi ta.»).

**Dårlig → godt:** et rent kilde-ikon (hva slags ting det er) foran tittelen på
en huke-av-liste → et statusikon (forfalt/fullført/prioritet) foran tittelen,
kilden flyttet til `meta`-brikken ved siden av.

---

## regel/tomtilstand-viser-skyggen-av-innholdet

**Regel:** En tomtilstand for en liste/tabell/kortrad som SNART fylles tegner
2–3 svake, statiske spøkelsesrader/-kort/-tabellceller bak meldingen
(`EmptyState` sin `skygge`-prop: `"rader" | "kort" | "tabell"`) — aldri for en
generell «ingenting her» (tomt filter, tomt søk).

**Scope:** `components/ui/EmptyState.tsx` (`skygge`-proppen). Tomtilstander der
neste steg fyller nøyaktig DEN lista — Dokumenter
(`components/buildings/DocumentsPanel.tsx`), Å gjøre
(`components/gjoremal/GjoremalListe.tsx`) og Seksjoner
(`components/buildings/UnitsPanel.tsx`) er de tre første.

**Hvorfor:** en skjelett-ghost bak meldingen antyder hva som KOMMER til å fylle
flaten — spekulativt, men ærligere enn et nøytralt ikon+tekst for en liste som
garantert fylles snart.

**Unntak:** Aldri på en FILTRERT tomtilstand (f.eks. «ingen treff på
filteret») — der kommer ingenting «snart», det er et søkeresultat, ikke en
ventende liste.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning runde 2 (A9 EmptyState ↔
ChartEmpty, `variant="rows"`).

**Dårlig → godt:** importere hele `ChartEmpty` (og `chart-engine.tsx`, ~1000
linjer chart-infrastruktur) for én tomtilstand → 2–3 statiske
`gray-alpha`-flater bygget på `EmptyState` sine egne, enklere premisser (ingen
ny fil, ingen animasjon).

---

## regel/avatargruppe-vifter-ved-hover

**Regel:** `AvatarGroup` vifter avatarene fra overlapp til luft ved hover
ELLER fokus på gruppen (ren CSS `transform`/`transition`,
`--duration-state`/`--ease-spring`, `motion-safe`) — ikke en ny avhengighet,
ikke `framer-motion`.

**Scope:** `components/ui/Avatar.tsx` (`AvatarGroup`).

**Hvorfor:** en statisk overlappet stabel skjuler navnene bak hverandre til
brukeren undersøker den — vifta + native `title`-tooltip (fantes allerede fra
bølge 3) gjør «hvem er dette» ett museflytt unna, uten en spesialbygd
tooltip-komponent.

**Unntak:** Ingen — standardutseendet i ro er uendret, kun tilstanden ved
hover/fokus endres.

**Kilde:** founder 2026-09-12, Spectrum-sammenligning runde 2 (A2 Avatar ↔
AvatarStack).

**Dårlig → godt:** importere `AvatarStack` (`framer-motion`-fjæring, full
piltastnavigasjon, tooltip-komponent) for bare fan-out-effekten → samme
visuelle effekt lagt til eksisterende `AvatarGroup` med ren CSS.

---

Regler foreslått til `skill/frivio-ui/references/produktskjonn.md` (ikke lagt inn der
direkte — den fila er utenfor denne leveransens fileierskap). Format matcher filens
eksisterende `regel/<id>`-oppskrift.

---

## regel/flytende-etikett-kun-i-korte-skjema

**Regel:** `Input floating` (etiketten ligger i feltet som plassholder og glir opp ved
fokus/innhold) brukes KUN i et tett skjema med KORTE etiketter, ett felt per rad —
innlogging, registrering, invitasjon, korte tallfelt i Nytt bygg. Et vanlig skjema
(Innstillinger, redigering, et skjema med mange ulike felttyper side ved side)
beholder etikett OVER feltet.

**Scope:** `components/ui/Input.tsx` (`floating`-prop).

**Hvorfor:** Spectrum-sammenligning runde 2 (founder 2026-09-12, A11 —
FloatingLabelInput): flytende etikett sparer én linjehøyde per felt — en reell
gevinst når MANGE korte felt står tett — men den flytende bevegelsen leser dårligere
for en enkeltstående feltrad, der en fast etikett over feltet er lesbar med det
samme, uten å vente på fokus/utfylling.

**Unntak:** Ingen kjent. Bland ikke floating og vanlig etikett i SAMME skjema — velg
én stil per skjema, ikke per felt.

**Kilde:** `arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon A11.

**Dårlig → godt:** Flytende etikett på et Innstillinger-skjema med åtte ulike
felttyper → vanlig etikett over feltet (dagens standard der), floating reservert for
de korte auth-/onboarding-skjermene (LoginFlow, RegisterFlow sitt konto-steg,
invitasjonskortet, Nytt bygg sine tre korte tallfelt).

---

## regel/velg-en-med-beskrivelse-er-kort

**Regel:** Når et FÅTALL alternativer (typisk 2–4) HVER trenger en forklaringslinje
for at brukeren skal kunne velge riktig (f.eks. lånetype), brukes
`RadioGroup variant="kort"` — ikke PillTabs/Select (som `regel/velg-en-av-fa-ingen-radio`
ellers foreskriver for 2–4 valg UTEN beskrivelse), og heller ikke
`variant="liste"` (for lite visuell vekt til et fåtall valg som skal sammenlignes side
om side).

**Scope:** `components/ui/Radio.tsx` (`RadioGroup`/`Radio` sin `variant="kort"`).

**Hvorfor:** Spectrum-sammenligning runde 2 (founder 2026-09-12, M11 — Model
Selector): et lite antall valg MED forklaring leser bedre som kort enn som en
kompakt rad-liste eller bak en skjult Select. Dette er IKKE et tredje unntak fra
`regel/velg-en-av-fa-ingen-radio` — det er samme unntak («hvert alternativ trenger en
beskrivelse») som `variant="liste"` allerede har, bare med mer visuell vekt for et
lavt antall valg.

**Unntak:** Har alternativene INGEN beskrivelse, er svaret fortsatt PillTabs/Select —
aldri Radio i noen variant. Er det 5+ alternativer, foretrekk `variant="liste"` (kort
blir en for lang/tung liste).

**Kilde:** `arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon M11.

**Dårlig → godt:** To håndrullede `<button aria-pressed>` uten forklaring på
forskjellen mellom annuitets- og serielån (`components/buildings/ForutsetningerModal.tsx`)
→ `RadioGroup variant="kort"` med én beskrivelseslinje per lånetype.

---

## regel/flerstegsskjema-er-en-primitiv

**Regel:** Et skjema med FLERE reelle, tilbakenavigerbare, nummererte steg
(fremdriftsindikator + validering per steg) bygges ALLTID på delt `StegForm`
(`components/ui/StegForm.tsx`) — aldri en ny håndrullet steg-tilstandsmaskin lokalt
på siden.

**Scope:** Ethvert flerstegs-SKJEMA i appen (ikke en fremdriftsvisning uten
brukerinput — det er fortsatt bare `StepIndicator`). `components/auth/RegisterFlow.tsx`
er referanseimplementasjonen (org → konto → engangskode).

**Hvorfor:** Spectrum-sammenligning runde 2 (founder 2026-09-12, M15 — det klareste
hullet i hele evalueringen): `StepIndicator` var alltid bare den visuelle
prikkeraden — stegbytte, per-steg-validering, `aria-live`-annonsering og bevart
tilstand ved tilbake ble bygget fra bunnen hver gang (RegisterFlow konkret, se
`StepIndicator.tsx` sin toppkommentar). Historikken i repoet (`Callout`, `InlineNote`,
`ListRow`, `IconButton`) er entydig: et mønster som håndrulles to ganger blir
håndrullet en tredje, med driftende detaljer hver gang.

**Unntak:** En flyt UTEN flere reelle, tilbakenavigerbare steg er ikke et
StegForm-tilfelle bare fordi ordet «steg» finnes i koden eller UI-teksten. Test: «kan
brukeren gå TILBAKE til et tidligere, nummerert steg og se innholdet uendret?» —
svarer nei (ett lineært, ja/nei-forgrenet skjema uten reell tilbakenavigering, som
`app/(dashboard)/buildings/new`), er det IKKE StegForm sin jobb — bruk feltene/
`StepIndicator` direkte om nødvendig.

**Kilde:** `arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon M15;
`components/ui/StepIndicator.tsx` sin toppkommentar («håndrullet tre steder»-notatet
fra designsystem-audit 2026-08-31).

**Dårlig → godt:** `RegisterFlow.tsx` sin egen `step`-state + tre håndrullede
`<form onSubmit>` med manuell `StepIndicator`-kobling → `StegForm` med `steps[]`,
`kanGaVidere`, `onStegChange`/`onFullfor`, samme løftede state som før.

---

## regel/ord-treff-pa-steg-er-ikke-samme-jobb

**Regel:** Før en ny flerstegsflyt tvinges inn i `StegForm` (eller ethvert annet
delt primitiv), sjekk om flaten faktisk gjør SAMME jobb for brukeren som primitivet
løser — ikke bare om et NAVN eller ORD (her: «steg») går igjen.

**Scope:** Vurdering av kallesteder for `StegForm`, generaliserbart til enhver
adopsjon av et delt primitiv i en eksisterende flate.

**Hvorfor:** M15-oppdraget pekte eksplisitt på «Nytt bygg» (`app/(dashboard)/buildings/new`)
som kandidat («hvis den flyten alt har steg»). Gjennomgang 2026-09-12 viste at
flyten er ETT lineært, ja/nei-forgrenet skjema (navn → «har dere en
tilstandsrapport?» → PDF/tekst/profil) UTEN nummererte, tilbakenavigerbare steg og
uten `StepIndicator` i bruk — ord-treff på «steg» i kommentarer/variabelnavn, ikke
samme brukeroppgave. `components/onboarding/` finnes heller ikke (kun
`app/api/onboarding/`, en API-rute). StegForm ble derfor adoptert i
`components/auth/RegisterFlow.tsx` i stedet — den ENESTE flyten i appen som faktisk
hadde det StegForm løser (bekreftet av at `StepIndicator` kun hadde étt reelt
kallsted før denne leveransen, nettopp der).

**Unntak:** Ingen — dette ER unntaket/testen selv, ikke noe å gjøre unntak fra.

**Kilde:** AGENTS.md, «samme jobb for brukeren, ikke bare samme ord»; leveranseinstruks
2026-09-12 (Spectrum-sammenligning runde 2, M15); `arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`.

**Dårlig → godt:** Bygge en `StegForm`-versjon av byggveiviseren fordi ordet «steg»
står i variabelnavn (`STEP_INDEX`, kommentarer) → la byggveiviseren stå urørt, og
adoptere StegForm i RegisterFlow.tsx, som faktisk trengte den.

---

# Nye regler — Spectrum-lab runde 2, M1/M7/M8/M9 (12. sep 2026)

Fire regler for `skill/frivio-ui/references/produktskjonn.md`, seksjon
«UI-primitiver». Format matcher eksisterende regler i den seksjonen.

---

## regel/tabell-sorterer-uttrykket-ikke-motoren

**Regel:** `Table` (`components/ui/Table.tsx`) kan vise en sorteringsaffordanse
(`sorterbar` per kolonne — pil-ikon, `aria-sort`), men sorterer ALDRI dataene
selv. `onSorter` rapporterer kun HVILKEN kolonnenøkkel som ble trykket;
kalleren eier sammenligningen og sender `rader` inn i ny rekkefølge.

**Scope:** `Table` og enhver fremtidig data-visende primitiv som vurderer å
adoptere Spectrum-mønstre — samme grense gjelder egentlig alt av «full frihet
per celle»-primitivet.

**Hvorfor:** Founder-dom 12. sep 2026 (Spectrum-lab runde 2, M1 Table ↔
PaymentsTable): «tabellens UTTRYKK — hode, tetthet, justering,
sorteringsaffordans, zebra/hover — inn i Table, ikke datagrid-motoren.» Table
er generisk over `T` og har ingen mening om hvilke felt som finnes eller
hvordan de sammenlignes (streng, tall, dato) — å bygge en egen
sorteringsmotor i primitivet ville enten vært en gjetning på sammenligningen,
eller krevd en ny prop-kontrakt for komparatorer per kolonne, som er nøyaktig
den ~2000-linjers DataTable-motoren founder eksplisitt sa nei til å porte inn.
Samme "full frihet"-prinsipp som `celle`/`fot` allerede har.

Teknisk lærdom underveis: `aria-sort` er kun gyldig ARIA på
`role="columnheader"`, som i sin tur krever en `role="row"`-forelder inni
`role="table"`/`rowgroup`. Table er et CSS-grid av `<div>`, ikke et ekte
`<table>` — et bart `aria-sort`-attributt på en rolleløs `<div>` er et
axe-`aria-allowed-attr`-brudd (serious). Løsningen er minimale, eksplisitte
roller (`role="table"`/`"row"`/`"columnheader"`/`"cell"`) lagt PÅ det
eksisterende grid-oppsettet, ikke en full `<table>`-rewrite.

**Unntak:** Ingen. En komponent som trenger faktisk sortering av data den selv
eier (ikke mottar som prop), er ikke lenger `Table` sin jobb.

**Kilde:** Founder 12. sep 2026, Spectrum-sammenligning runde 2, M1;
`arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon M1 + «Founders
dom».

**Dårlig → godt:** Å legge en `comparator`-prop og la `Table` selv `.sort()`e
`rader` → `onSorter(key)` som kaller tilbake til siden, som sorterer og sender
inn nye `rader`.

---

## regel/navngitt-storrelsesskala-ikke-className-overstyring

**Regel:** Trenger et primitiv flere størrelser, er svaret en navngitt
`size`-skala (`'xs' | 'sm' | 'md' | 'lg'` e.l.) — ikke å la hvert kallsted
overstyre bredde/høyde med en fri `className`. `className` skal fortsatt
finnes som ren unntaksventil, men en størrelse som brukes på ETT sted i dag
brukes på TO i morgen, og da har systemet to udokumenterte tall som tilfeldigvis
matcher i stedet for ett navngitt trinn.

**Scope:** Alle `components/ui/`-primitiver med en visuell størrelsesakse
(`Spinner`, `StatusDot`, `Badge`, `Avatar`, IconButton m.fl. har alt dette
riktig — `Spinner` var unntaket før denne runden).

**Hvorfor:** Konkret funn ved Spectrum-lab runde 2, M7 (Spinner ↔ Spectrum sin
`Loader2`-baserte spinner, tre faste `size`-varianter via `cva`): Frivios egen
`Spinner` hadde ingen `size`-prop i det hele tatt før dette — ETT reelt
kallsted (`app/(dashboard)/okonomi/regnskap/page.tsx`, lagringsstatuslinjen)
løste "mindre enn standard" med en hardkodet `className="h-3.5 w-3.5"`, en
verdi ingen andre visste fantes eller kunne gjenbruke bevisst. Spectrum sin
tre-stegs `size`-prop var den delen av sammenligningen som IKKE handlet om
utseende, men om at størrelsen ble et navngitt, oppdagbart valg i stedet for
en tilfeldig Tailwind-klasse som skjuler seg i et kallsted.

**Unntak:** Et primitiv med KUN én naturlig størrelse (f.eks. et ikon som
alltid følger teksten rundt) trenger ingen skala — ikke bygg én spekulativt.

**Kilde:** Founder 12. sep 2026, Spectrum-sammenligning runde 2, M7;
`arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon M7.

**Dårlig → godt:** `<Spinner className="h-3.5 w-3.5" />` spredt i sidekode →
`<Spinner size="xs" />` fra et navngitt trinn alle kan lese og gjenbruke.

---

## regel/sparklinje-viser-retning-ikke-verdi

**Regel:** En sparklinje i `StatCard` (`sparkline`-proppen) er en RETNINGS-
indikator, ikke et analyseverktøy: ingen akse, ingen rutenett, ingen tooltip,
ingen scrubbing/interaktivitet. Den skal svare «går dette opp eller ned», ikke
«hva var verdien 14. mars».

**Scope:** `StatCard` sin `sparkline`-prop og enhver fremtidig mini-graf i et
KPI-kort. Gjelder ikke fullformat-diagrammer med egen sannhets-akse
(EmptyState sine «rader»-varianter, en fremtidig egen Chart-komponent) — den
grensen er BEVISST, se «Hvorfor».

**Hvorfor:** Founder-dom 12. sep 2026 (Spectrum-lab runde 2, M8 StatCard ↔
Stat Cards, «likte den godt»): Spectrum sin motpart har en scrubbar
sparklinje (dra langs linjen, tallet under fingeren erstatter hovedtallet)
bygget på en ~600-linjers delt `chart-engine.tsx` med `ResizeObserver`. Å
adoptere DEN motoren ville tvunget `'use client'` på HELE `StatCard` — en
komponent som i dag brukes fra Server Components uten klient-grense (bl.a.
`app/(dashboard)/okonomi/page.tsx`). Sparklinjen som faktisk ble bygget er
derfor en ren, statisk inline-SVG (fast viewBox, ingen måling) som svarer
akkurat det et KPI-kort trenger: «går denne posten riktig vei» — ikke et
skjult diagram som later som det er mer presist enn det er på en 90×28px
flate.

**Unntak:** Ingen for `StatCard` sin `sparkline`. Trenger et sted en ekte,
leselig serie (akse, tooltip, forstørret visning), er svaret en dedikert
diagramkomponent — ikke en StatCard med mer data presset inn.

**Kilde:** Founder 12. sep 2026, Spectrum-sammenligning runde 2, M8;
`arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon M8.

**Dårlig → godt:** En sparklinje med akse-streker og et tooltip-tall per
punkt → en linje + svakt områdefyll + ett uthevet siste punkt, `aria-hidden`.

---

## regel/statusprikk-pulserer-bare-nar-noe-skjer-na

**Regel:** `StatusDot` sin `pulse`-tilstand (pulsring rundt prikken) brukes
KUN for en tilstand som faktisk pågår AKKURAT NÅ (aktiv synkronisering, noen
som skriver, en pågående sending) — aldri for en STABIL status, selv en fersk
og positiv én («koblet, oppdatert i natt», «lagret for tre minutter siden»).

**Scope:** `StatusDot` sin `pulse`-prop, og ethvert fremtidig «live»-uttrykk
i systemet (samme prinsipp som `Skeleton`/`Toast` sin motion-safe-gate, bare
på BETYDNING i stedet for bevegelses-tilgjengelighet).

**Hvorfor:** Founder-dom 12. sep 2026 (Spectrum-lab runde 2, M9 StatusDot ↔
StatusDemo): en pulserende indikator er et løfte til brukeren om at noe
skjer i dette øyeblikket — bryter man det løftet på en tilstand som egentlig
er ferdig og stabil, lærer brukeren å ignorere pulsen neste gang den faktisk
betyr noe. Konkret prøvet ved bygging: bankkoblingens statuslinje
(`app/(dashboard)/okonomi/BankKobling.tsx`, «Oppdatert fra {bank} i natt») var
den nærliggende, fristende plasseringen for `pulse` — den er BEVISST utelatt
der, fordi synkroniseringen skjedde i natt, ikke nå. `pulse` er derfor
foreløpig ubrukt i produksjonskode og kun vist på `/design` sitt
«Synkroniserer nå»-eksempel, som er den ærlige jobben.

**Unntak:** Ingen navngitt — «det føltes viktig nok til å pulsere» er ikke et
unntak, det er nøyaktig varseltrettheten regelen finnes for å unngå.

**Kilde:** Founder 12. sep 2026, Spectrum-sammenligning runde 2, M9;
`arkiv/rapporter/SPECTRUM-LAB-2026-09-12-runde2.md`, seksjon M9.

**Dårlig → godt:** `<StatusDot tone="success" pulse label="Koblet, oppdatert i natt" />`
→ `<StatusDot tone="success" label="Koblet, oppdatert i natt" />` (pulse
reservert for en linje som faktisk sier «nå», f.eks. «Synkroniserer nå»).

---

# Foreslåtte regler — DataTable (Spectrum-lab runde 3, 2026-09-12)

Skrevet til scratchpad per oppdragsinstruks (ikke landet direkte i
`skill/frivio-ui/references/produktskjonn.md` — den filen var eksplisitt
fredet i dette oppdraget). Landes av hovedløkka/neste agent i samme format
som filens øvrige `regel/*`-oppføringer.

---

## regel/datatabell-er-en-primitiv-ikke-en-komposisjon

**Kilde:** Founder-oppdrag 12. sep 2026 («Datatables i Spectrum er mye bedre
enn våres. Se på hvordan vi kan overføre det beste fra det til vårt
system»), Spectrum-lab runde 3
(`arkiv/rapporter/SPECTRUM-LAB-2026-09-12-datatable.md`).

Trenger en side faner + søk + sortering + paginering + radvalg med
masse-handling OVER EN LISTE AV OBJEKTER, er svaret `components/ui/DataTable`
— ALDRI en ny håndrullet kombinasjon av `PillTabs`+`SearchInput`+`Table`+
`Pagination`+`Checkbox`+`ActionBar` bygget lokalt på siden. Nøyaktig den
kombinasjonen fantes fra før i BÅDE `FakturaListe.tsx` og (i forenklet form)
`Betalingstabell.tsx` — to nær-identiske håndrullinger av samme idé, samme
mønster som ga oss `Callout`/`InlineNote`/`ListRow`/`IconButton` i sin tid.

**Eksempel:** `app/(dashboard)/okonomi/fakturaer/FakturaListe.tsx` og
`components/buildings/felleskostnad/Betalingstabell.tsx` — begge bygger nå
kolonner (`DataTableColumn<T>[]`) og komponerer `<DataTable>`, i stedet for å
eie egen fane-/søke-/sorterings-tilstand ved siden av en håndrullet
`Card`+`ListRow`-liste.

**Unntak:** ren datavisning UTEN filter/sortering/radvalg bruker fortsatt
`Table` alene (uendret — se `regel/liste-med-handling-er-listrow` for når
`ListRow` er riktigere enn begge).

---

## regel/faner-teller-live

**Kilde:** Spectrum-lab runde 3, del (b): Spectrum sin `quickFilter` regner
fanetellingene ut LIVE mot gjeldende søk («skriver du i søkefeltet mens en
fane er aktiv, justerer telleren seg») — vårt daværende `FakturaListe` regnet
`antall` kun mot RÅ `rader`, aldri mot søket.

`DataTable` sine fane-antall (`tellPerFane` i `lib/dataTable.ts`) regnes MOT
DET SØKE-FILTRERTE utvalget, ikke mot hele `data`-arrayet. En fane som viser
«Forfalt (3)» mens du har skrevet «heis» i søkefeltet skal telle de tre SOM
OGSÅ matcher «heis» — ikke de tre totalt i systemet. Bygger du en NY liste med
faner+søk (også utenfor DataTable), skal tellingene følge samme regel.

**Eksempel:** `lib/dataTable.ts`, `tellPerFane()` kalles med
`sokFiltrert` (etter `sokIRader`), IKKE med rå `data`, se `DataTable.tsx`.

---

## regel/masse-handling-i-actionbar-med-antall

**Kilde:** Spectrum-lab runde 3, del (b)+(c): Spectrum sin `bulkActions`-bar
flyter fritt over radene og kolliderer potensielt med `BottomNav` på mobil;
vår `ActionBar` er allerede bygget for å unngå akkurat den kollisjonen
(`--frivio-bottomnav-h`-klarering).

Enhver masse-handling utløst av radvalg (avkrysning i en tabell/liste) skal
rendres i en delt `ActionBar`, SIST i innholdet (etter selve tabellen/listen
— ikke før), med et tydelig antall («N valgt») foran selve handlingsknappen/-
knappene, og en måte å tømme utvalget på uten å utføre en handling («Tøm
valg»). ALDRI en frittflytende/absolutt posisjonert bar bygget lokalt for én
side — det gjenskaper nøyaktig kollisjonen `ActionBar` allerede løste.

**Eksempel:** `components/ui/DataTable.tsx`, `radvalg`-blokken —
`<ActionBar label={`${valgt.size} valgt`}>{radvalg.masseHandlinger(...)}<Tøm
valg-knapp/></ActionBar>`, rendret som SISTE element i komponenten.

---

## regel/kolonner-skjules-for-rulling

**Kilde:** Spectrum-lab runde 2 (M1) og runde 3, del (c): vår `Table` sitt
sveip-hint på smal skjerm er allerede bedre enn Spectrum sin STILLE klipping
(«ruller stille, ingen visuell hint om at det finnes mer») — men INGEN av
våre tabeller hadde et system for å skjule LAVVERDI-kolonner på smal bredde
FØR resten trenger å rulle (Spectrum sin `hideBelow`).

En kolonne med lav skanne-verdi på smal skjerm (dato, sekundær kategori) SKAL
ha `skjulUnder: 'sm'|'md'|'lg'` fremfor å tvinge hele tabellen til å rulle
sidelengs for å vise den. Løses i JS på KALLER-siden (`DataTable`, via
`matchMedia`), ALDRI som en endring i selve `Table`-primitivet — `Table`
forblir et rent grid av det den får inn, uvitende om brytpunkter. Gjenværende
kolonner ruller fortsatt i `Table` sin egen beholder med «Sveip tabellen»-
hintet, aldri på `body` (uendret prinsipp, founder-sveip 2026-08-22).

**Eksempel:** `FakturaListe.tsx` sin `forfall`-kolonne
(`skjulUnder: 'sm'`) — skjult under 640px, resten (Faktura/Leverandør/Beløp/
Handlinger) ruller sidelengs med sveip-hintet under den bredden
(`minBredde="820px"`).

---

# Regler til fletting inn i skill/frivio-ui/references/produktskjonn.md

To regler fra founder-tilbakemelding 12. sep 2026 (skjermbilder fra docs-sidene,
leveranse: Radio/Checkbox/DescriptionList/Avatar). Format som produktskjonn.md
(Regel / Scope / Hvorfor / Unntak / Kilde / Dårlig → godt).

---

## regel/nokkel-og-valgetikett-med-beskrivelse-er-500

**Regel:** En nøkkel i en faktaliste (DescriptionList) og en valgetikett som HAR
en beskrivelseslinje under seg (Radio, Checkbox) settes i `type-label-*-strong`
(500) — ALDRI `font-medium` og ALDRI en overskrifts-klasse (`type-heading-*`,
600). En etikett UTEN beskrivelse forblir 400 (`type-label-*`, ren tekst).

**Scope:** `components/ui/Radio.tsx` (begge varianter: `liste`-etikett når
`description` er satt, `kort`-tittelen alltid siden `kort` alltid har
beskrivelse), `components/ui/Checkbox.tsx` (etikett når `description` er satt),
`components/ui/DescriptionList.tsx` (nøkkelen, alltid — en DescriptionList-
nøkkel har per definisjon en tilhørende verdi, samme rolle som «etikett med
beskrivelse»). DescriptionList-nøkkelen flyttet samtidig fra
`--color-text-tertiary` til `--color-text-secondary`, fordi 500-vekt i tertiary
målte under 4,5:1 (`node scripts/kontrastmaal.mjs`).

**Hvorfor:** «400 leser, 500 navngir, 600 titler» — en valgetikett med
beskrivelse og en faktaliste-nøkkel NAVNGIR noe (et alternativ, et felt), de
leser ikke løpende tekst og er ikke en overskrift for en seksjon. `kort`-
varianten av Radio brukte `type-heading-14` (600) før denne rettelsen — «et
valg er ikke en overskrift» (founder 2026-09-12).

**Unntak:** En etikett UTEN beskrivelse (f.eks. Checkbox «Jeg har lest og
godtar vilkårene», Radio horisontal uten beskrivelse) forblir 400 — hele
poenget er å skille «dette navngir et valg med mer innhold under» fra «dette
ER innholdet».

**Kilde:** Founder, skjermbilder fra docs-sidene, 2026-09-12 (SB2 Radio, SB5
DescriptionList).

**Dårlig → godt:** `<span className="type-label-14 block">{label}</span>` uansett
beskrivelse → `className={description ? 'type-label-14-strong' : 'type-label-14'}`.

---

## regel/avatar-fallback-er-opak

**Regel:** En fallback-flate som viser tekst OVER seg (initialer, ikon) er
ALLTID en opak steg-farge (`--color-gray-200`/`surface-3`, solid i begge tema),
ALDRI en alpha-farge (`--color-gray-alpha-*`). Alpha-flater er reservert for
lag som skal la det som ligger UNDER skinne gjennom — en initial-fallback skal
ikke.

**Scope:** `components/ui/Avatar.tsx` — fallback-flaten (linje ~69) var
`--color-gray-alpha-200` (7–9 % alpha), byttet til `--color-gray-200` (opak).

**Hvorfor:** Founder, ved synet av `AvatarGroup` med overlappende avatarer:
«Avatarer overlapper med transparency? Hva er tanken?» Rotårsaken var at
alpha-flaten lot initialene fra avataren UNDER skinne gjennom ved overlapp —
så ut som en bevisst gjennomsiktighetseffekt, men var en feil valgt
bakgrunnsfarge. Målt kontrast for `text-secondary`-initialene mot opak
`gray-200`: 6,30:1 (mørkt), 7,09:1 (lyst) — begge godt over 4,5:1-kravet
(`node scripts/kontrastmaal.mjs`), så `gray-300` var ikke nødvendig.

Det er RINGEN (`--color-surface`, 2px box-shadow) som skal skille to
overlappende avatarer visuelt — ikke gjennomsiktighet i fallback-flaten. Samme
leveranse la til eksplisitt stigende `z-index` per avatar i `AvatarGroup`
(senere avatar over tidligere, «+N» øverst), fordi `transform` (fan-out ved
hover) åpner en ny stacking context per element og stablingen ikke lenger bør
hvile på implisitt DOM-rekkefølge alene.

**Unntak:** Ingen kjent — et bilde (`src`) dekker hele flaten uansett, så
denne regelen gjelder kun tekst/ikon-fallback-tilstanden.

**Kilde:** Founder, skjermbilde av SB4 AvatarGroup, 2026-09-12.

**Dårlig → godt:** `background: 'var(--color-gray-alpha-200)'` på en
initial-fallback → `background: 'var(--color-gray-200)'` (opak steg-farge).

---

## regel/ett-element-tegner-fokus

**Regel:** Et fokusert felt tegnes av ÉTT element, aldri to. Et felt UTEN
prefix/suffix tegner sin egen fokusstil på seg selv. Et felt MED prefix/suffix
tegner fokusstilen på BEHOLDEREN (`focus-within`) — det indre `<input>`-
elementet skal ikke ha noen egen synlig fokusstil (`outline-none` +
kansellert `box-shadow`). Blir begge stående, får man to konkurrerende
fokusringer med ulik farge og ulik radius i samme felt.

**Scope:** Alle felt bygget på `fieldChrome()`/`Input`-slot-mekanismen
(`Input`, `SearchInput`, `Autocomplete`, og indirekte `Select` via samme
`fieldChrome`).

**Hvorfor:** Et Tailwind `!`-modifisert utility-klassenavn
(`focus-visible:shadow-[...]!`) emitteres i `@layer utilities`. CSS cascade
layers SNUR rekkefølgen for `!important`-erklæringer: et SENERE-deklarert lag
(`utilities`) taper alltid mot et TIDLIGERE-deklarert lag (`base`), uansett
spesifisitet eller `!`. Den globale `:focus-visible{box-shadow:var(--focus-
ring)!important}` (`app/globals.css`, `@layer base`) vant derfor over BÅDE
`Input`s egen tiltenkte grå glød (feltet uten slot — bekreftet med
`getComputedStyle` at aksentringen alltid ble rendret, aldri gløden) og
kanselleringen av samme ring på det indre feltet i et felt med prefix/suffix
(SearchInput/Input-prefix). En kommentar i koden hevdet at dette «var samme
prinsipp som `.kari-input`» (`components/AssistantWidget.tsx`) — det var
FEIL: `.kari-input` fungerer fordi den GJENÅPNER selve `@layer base` og
legger en mer spesifikk selektor der, i SAMME lag som globals.css sin regel,
der vanlig spesifisitet (ikke lag-rekkefølge) avgjør. Fiksen i `Input.tsx`
(`FIELD_FOCUS_LAYER_FIX`, klassene `.frv-focus-glow`/`.frv-focus-clear`)
bruker nå samme teknikk.

**Symptom å kjenne igjen:** et felt viser den BLÅ aksentringen
(`--focus-ring`, brukt av knapper/lenker) i stedet for feltets egen mørkere kant
(`--focus-border`) ved fokus — uavhengig av om feltet har prefix/suffix eller
ikke. Verifiser alltid med `getComputedStyle(el).boxShadow` på BÅDE
beholderen og det faktisk fokuserte elementet — en skjerm alene kan lure deg
til å tro at en avrundet, men FEILFARGET ring er riktig.

**Kilde:** Founder-skjermbilde av `/design/components/autocomplete`,
2026-09-12 (SB1-runden): «Markert felt har ikke avrundede hjørner som passer
border.»

**Dårlig → godt:** `'focus-visible:shadow-[var(--focus-border)]!'` (taper mot
`@layer base` uansett) → en klasse deklarert inne i en lokal
`<style>{'@layer base { ... }'}</style>`-blokk (se `FIELD_FOCUS_LAYER_FIX` i
`components/ui/Input.tsx`), samme prinsipp som `.kari-input`.

---

## regel/sokefelt-har-ikon-inne-i-feltet

**Regel:** Et RENT søkefelt (ikonet er en del av selve plassholderteksten,
ikke en enhet ved siden av verdien) skal ha søkeikonet INNE i feltet, uten
skillelinje og uten egen bakgrunn — 16px innrykk fra kanten, 12px gap til
teksten, ikon i `--color-text-tertiary`. En segmentert sone med 1px
skillelinje (`border-r` + egen padding-boks) er forbeholdt en ENHET som hører
til VERDIEN («kr», «m²», «@») — et søkeikon er ikke en enhet, det er en del
av selve invitasjonen «søk her».

**Scope:** `SearchInput` (alltid), og enhver bruk av `Input` sin
`prefix`-prop der prefixet er et rent søkeikon. `Input` fikk derfor en egen
prop, `prefixStyling?: boolean` (default `true` = segment med skillelinje;
`false` = ikon inline). `SearchInput` bruker `prefixStyling={false}` fast —
kallsteder trenger ikke sette den selv.

**Mål:** tekstens venstrekant ≈ 12 (kant-innrykk) + 15 (ikonbredde, `Sok`
size=15) + 8 (gap) = 44px fra feltkanten. Tøm-knappen (`suffix`, når
`onClear` er satt) får samme inline-behandling speilvendt: 16px fra
høyrekant, med den eksisterende 44×44px usynlige trefflaten
(`before:-inset-[15px]`) uendret.

**Hvorfor:** Søkefeltet hadde altfor mye padding sammenlignet med resten av
systemet — den segmenterte skillelinje-sonen (bygget for en ENHET som «kr»)
la på en ekstra boks med egen padding på BEGGE sider av ikonet, i tillegg til
feltets egen innrykk. Et søkeikon trenger ingen skillelinje — det er ikke en
verdi ved siden av en annen verdi, det ER en del av «Søk…»-plassholderen.

**Kilde:** Founder-skjermbilde av søkemodulen, 2026-09-12 (SB3-runden):
«Altfor lite padding i søkemodulen» (lite ROM til teksten pga. for MYE
strukturell padding rundt ikonet — se skjermbildet for eksakt ordlyd).

**Dårlig → godt:** `<Input prefix={<Sok/>} placeholder="Søk…" />` (segment
med skillelinje, dobbel padding) → `<SearchInput placeholder="Søk…" />`
(bruker `prefixStyling={false}` internt) eller
`<Input prefix={<Sok/>} prefixStyling={false} placeholder="Søk…" />` for et
tilpasset søkefelt som ikke passer `SearchInput`s faste API.

---

## regel/flytende-lag-rendres-i-portal

**Regel:** Enhver komponent som visuelt «flyter over» annet innhold mot en
trigger/anker — meny, dropdown, popover, kombinert felt+liste, tooltip —
rendres i en portal på `document.body` (`components/ui/FloatingLayer.tsx`:
komponenten `<FloatingLayer>` eller hooken `useFloatingPosition`), aldri som
`position: absolute`/`fixed` inne i sin egen DOM-forelder.

**Scope:** Alle nye flytende/ankrede paneler i `components/ui/`. Gjelder
IKKE Modal/ConfirmDialog/Toast/SidePanel (helskjerm-overlegg uten et anker å måle mot —
de er allerede `position: fixed` mot viewporten, ikke mot et element).
FloatingLayer sin kontrakt dekker kun VERTIKAL flip (over/under) — et panel
som må kunne flippe sidelengs (venstre/høyre) løser det lokalt, se
`Tooltip.tsx` sin kildekode for det ene stedet dette gjelder i dag.

**Hvorfor:** Founder-tilbakemelding 12. sep 2026: «Mange av komponentene jeg
prøver å teste i design docs utvider seg ikke / feltet utvider seg ikke, jeg
får ikke sett det.» Skjermbilder viste OverflowMenu som en avklippet grå flik
med rullefelt i eksempelboksen på `/design`, og MultiSelect sin liste klippet
under feltet. Rotårsak (verifisert samme dag): INGEN komponent i
`components/ui` brukte `createPortal` — Popover, OverflowMenu, Dropdown,
MultiSelect sin liste, Autocomplete sin liste og Tooltip var alle
`position: absolute` inne i sin egen forelder, og klippes derfor av ENHVER
beholder med `overflow` — ikke bare docs sin eksempelboks, men `Table` sin
rullebeholder, `Card` med `overflow-hidden`, en `ListRow`-liste. En «…»-meny
nederst i en ekte tabellrad (`/seksjoner`, `/okonomi/fakturaer`) hadde samme
feil i PRODUKSJON, ikke bare i docs.

En beholders `overflow`-egenskap klipper aldri en portalert node (den er
ikke lenger en DOM-etterkommer av beholderen) — portalering er derfor den
STRUKTURELLE fiksen, ikke en styling-detalj per kallsted. Seks separate lapper
(én per komponent) ville gjentatt akkurat den samme feilklassen neste gang
noen bygger en ny flytende komponent.

**Tillegg 14. sep 2026 — Begrep var glemt.** Founder på /system/ai-bruk: «Tooltip forsvinner
inn i rammen.» `Begrep` sitt panel var fortsatt `position: absolute` og ble klippet av `Table`
sin rullebeholder da ordet sto i et kolonnehode (`Feilandel`). Nå `FloatingLayer` (side bottom,
align start), `useKlikkUtenfor` for klikk utenfor/Escape. Kontrollspørsmålet når en ny
komponent viser noe over annet innhold: «bruker den FloatingLayer?» — svaret er ja, uansett hvor
liten den er.

**Unntak:** Ingen navngitt. Et unntak krever en founder-beslutning og en
kommentarlinje i koden om hvorfor systemet ikke strakk til (se AGENTS.md).

**Kilde:** Founder-tilbakemelding 2026-09-12 (skjermbilder av OverflowMenu og
MultiSelect på `/design`), implementert i `components/ui/FloatingLayer.tsx`,
`lib/floatingPosition.ts` (ren posisjonsberegning, ≥8 enhetstester i
`tests/unit/floatingPosition.test.ts`).

**Dårlig → godt:** En ny meny som setter `className="absolute top-full
left-0"` på panelet sitt, inne i triggerens egen wrapper-div → samme meny
bygget med `useFloatingPosition(triggerRef, { open, panelRef, side:
'bottom' })` og et panel portalert via `createPortal(..., document.body)`,
med `position: 'fixed'` og beregnet `top`/`left`.

---

## regel/z-skala-tooltip-meny-modal

**Regel:** Z-indeks for flytende/overlegg-lag følger en fast, TO-delt skala:
`z-50` for alt FloatingLayer rendrer (tooltip, popover/meny/dropdown/
multiselect-panel), `z-60` for Modal (overlegg + dialog) og Toast. Modal og
Toast ligger ALLTID over et åpent menypanel — aldri omvendt. Skalaen står
samlet ETT sted (toppkommentaren i `components/ui/FloatingLayer.tsx`), ikke
spredt som separate magic numbers per komponent.

**Scope:** Alle overlegg/flytende lag i `components/ui/`. Popover sitt
mobil-ark-panel (`z-56`, over sin egen scrim `z-55`) er et internt
special-case KUN på smal/touch-viewport (se `.popover-panel[data-mobil-ark]`
i `globals.css`) og endrer ikke den to-delte skalaen — mobil-arket er
uansett alltid stengt før en Modal kan åpnes over det i praksis.

**Hvorfor:** Founder-beslutning under FloatingLayer-leveransen (2026-09-12):
et åpent menypanel skal ALDRI kunne ligge over en Modal — «modal ØVERST».
Før denne runden lå Toast på `z-50`, samme lag som et menypanel ville fått
via FloatingLayer — en toast (f.eks. en «Lagret»-bekreftelse med Angre-
knapp) kunne endt bak et samtidig åpent Popover/OverflowMenu-panel og blitt
usynlig for brukeren, uten noen feilmelding. Toast løftet til `z-60`,
samme tier som Modal — de to overlapper i praksis nesten aldri (Toast er
bunn-forankret, Modal sentrert/bunnark), så rekkefølgen dem imellom er ikke
en bevisst rangering, bare en konsekvens av DOM-rekkefølge (ToastProvider
monteres tidlig i rot-layouten).

**Unntak:** Ingen navngitt.

**Kilde:** Founder-beslutning 2026-09-12 (FloatingLayer-leveransen).
Implementert: `components/ui/FloatingLayer.tsx` (z-50, dokumentert i
toppkommentaren), `components/ui/Toast.tsx` (z-index løftet fra 50 til 60).
`components/ui/Modal.tsx` var allerede `z-[60]` — ingen endring nødvendig.

**Dårlig → godt:** En ny toast/banner-komponent som setter `z-50` fordi
«det er det andre overlegg bruker» → sjekk om komponenten kan vises SAMTIDIG
som en Modal (de fleste kan); i så fall `z-60`, aldri samme lag som et
FloatingLayer-panel.

---

# Regler — docs-siden, 13. sep 2026

Utkast i format som `skill/frivio-ui/references/produktskjonn.md` — flytt inn i den fila
(under en passende seksjon, f.eks. «Dokumentasjonssiden (/design)») når founder har sett den.
Ikke lagt inn i selve produktskjonn.md ennå, siden agentoppdraget eksplisitt utelot den filen
fra flatene denne leveransen eier.

---

## regel/docs-seksjonstitler-er-overline

**Regel:** Enhver seksjonstittel på /design-sidene — sidemenyens gruppetitler (toppnivå:
Kom i gang/Fundament/Komponenter, kategori: Handlinger/Skjema/Datavisning/Tilbakemelding/
Navigasjon/Layout/Overlegg) OG fundament-sidenes egne underseksjoner (Materials' Elevation/
Shapes/Kanter/Landing surface, Colors' Steg → rolle/Skalaer/…, Spacing' Trefflater,
Typography sine gruppenavn Heading/Button/Label/Copy/Mono/Utility) — bruker SAMME stil:
`.type-overline` (mono, caps, vekt 500 — allerede standardvekten, ingen ny
`--type-overline-strong` trengtes). Nivåene i sidemenyen skilles KUN på farge, ikke
størrelse eller font: toppnivå = `--color-text-primary`, kategori = `--color-text-secondary`.
Fundament-sidenes seksjonstitler bruker samme klasse i `--color-text-primary`, med en
valgfri beskrivelse under i `copy-13`/`--color-text-secondary` (se
`app/design/components/DocsSectionTitle.tsx`).

**Scope:** `app/design/**` — sidemenyen (`app/design/DocsShell.tsx`) og fundament-sidene
(typography, materials, spacing, colors — motion/icons/voice har foreløpig ingen
underseksjoner, men skal bruke samme mønster den dagen de får en). Gjelder ikke
komponentdocs (`app/design/components/[slug]/**`, `app/design/components/demos/**) eller
sider utenfor /design.

**Hvorfor:** «kategorititlene [...] kommer for dårlig frem. Burde være hvit skrift i mørkt
tema og noe annet i lyst som skiller dem fra lenkene [...] kanskje mono caps» → «kanskje bruk
samme titler der som på Materials.» Målt årsak til at kategoriene «kom for dårlig frem»:
`--color-text-tertiary` (forrige farge) målte 3,10:1 mot `--color-surface` i lyst tema — under
WCAG AA sitt 4,5:1-krav for tekst. `--color-text-secondary` måler ~6,7:1 (dekket av
`kontrastmaal.mjs` sin generiske `text-*/surface`-løkke). Typografisidens gruppetitler
(«Heading», «Button», «Label» …) hadde samme problem i omvendt retning — «litt lite
differensiering» — fordi de lå som løpende `label-12 tertiary`-setninger uten noen egen
titteltreatment. Én delt stil løser begge: tydelig nok til å skille seg fra brødtekst og
lenker, men aldri så tung at den konkurrerer med en ekte `<Heading>`.

**Unntak:** Ingen kjent. Skulle en fundament-side trenge en tyngre visuell seksjonsdeler enn
en overline (f.eks. en side med svært mange underseksjoner), er det en founder-beslutning,
ikke en lokal variant.

**Kilde:** Founder, docs-siden, 2026-09-13 («kategorititlene ... kommer for dårlig frem [...]
Bør kunne collapses, og kanskje mono caps» → «Kanskje bruk samme titler der som på
Materials»; «Typografisidens gruppetitler [...] har litt lite differensiering — vurder mono
500/600 caps»).

**Dårlig → godt:** Fire lokale varianter av samme mønster (`Heading level={2}
variant="heading-20"` + løs `Text copy-13` i Materials/Colors/Spacing, en hel setning presset
inn i `Text label-12 tertiary` på Typography, og sidemenyens `GroupLabel` i
`--color-text-tertiary` som ikke besto kontrastkravet) → `DocsSectionTitle` (page-nivå) og
`NavGroup` (sidemeny-nivå), begge på `.type-overline`.

---

# Regel-utkast — leveranse g1 (FloatingLayer/OverflowMenu/Tooltip, 2026-09-13)

Skrevet til scratchpad per oppdragsbeskrivelsen (ikke lagt inn i
`skill/frivio-ui/references/produktskjonn.md` selv — den filen eies av en annen
samtidig agent-økt i dette repoet og sto allerede endret/uncommitted ved
oppstart). Format identisk med produktskjonn.md slik at innholdet kan limes
rett inn der.

---

## regel/meny-aapner-mot-triggerens-kant

**Regel:** Et flytende panel som ankres til en trigger (Popover, OverflowMenu,
Dropdown, MultiSelect) åpnes mot triggerens EGEN kant — `align="start"`
(venstrekant mot venstrekant) eller `align="end"` (høyrekant mot høyrekant) —
ALDRI løsrevet fra ankeret. Justeringen FLIPPER (start↔end) når den valgte
kanten ikke har plass i viewporten OG motsatt kant har MER plass; ellers
KLEMMES panelet innenfor viewporten som siste sikkerhetsnett. Samme prinsipp
gjelder vertikalt (`side`: bottom↔top) og er, etter denne runden, konsekvent
implementert for begge akser i `lib/floatingPosition.ts`
(`computeFloatingPosition`).

**Scope:** `lib/floatingPosition.ts` (selve utregningen — flip på begge akser,
klemming som fallback), `components/ui/{FloatingLayer,Popover}.tsx` (DOM-laget
som bruker den). OverflowMenu er det konkrete eksempelet: «…» står nesten
alltid sist i en rad, så den bruker fast `align="hoyre"` (→ `align="end"` i
Popover) — panelet henger fra triggerens HØYRE kant, og flipper til venstre
kant nær venstre viewportkant i stedet for å klemmes løsrevet.

**Hvorfor:** Founder-spørsmål 2026-09-13: «Hva bestemmer om overflowen åpnes
mot venstre eller høyre for knappen?» — svaret AVDEKKET et hull: koden klemte
`left` til viewportkanten men flippet ALDRI `align`. Målt konkret tilfelle
(anker `[20,60]`, `align="end"`, panel 300px bredt): FØR denne fiksen klemte
koden panelet til `left=8` — et panel som strekker seg fra x=8 til x=308 med
ankeret liggende et godt stykke INNI panelet fra venstre, ikke ved noen av
kantene. Etter fiksen flipper `align` til `start`, og panelet får `left=20` —
nøyaktig ankerets venstrekant. Et panel som ikke henger fra NOEN av ankerets
kanter leser seg som løsrevet fra knappen som åpnet det, selv om det teknisk
sett er «innenfor viewporten».

**Unntak:** `align="center"` flipper aldri (sentrert er sentrert, uansett hvor
trangt det er — det finnes ingen «motsatt kant» å flippe til). `side:
'left'|'right'` (Tooltip sine to sidelengs-retninger) flipper aldri i det hele
tatt, kun tverraksen (vertikal) klemmes — se `regel/tooltip-bredde-max-content`
under for hvorfor de to sidene har en annen kontrakt.

**Kilde:** Founder-tilbakemelding 2026-09-13, punkt 2 (FloatingLayer/
OverflowMenu-runden). Fiks: `lib/floatingPosition.ts`
(`computeFloatingPosition`, `spaceForStart`/`spaceForEnd`), testet i
`tests/unit/floatingPosition.test.ts` («flipper til "end" …», «flipper til
"start" …», «flipper IKKE align når motsatt kant ikke har mer plass»).
Bekreftet i nettleser (Playwright, docs-eksempel «Ankres til triggerens
høyrekant», `/design/components/overflow-menu`): `anchor.right === panel.right`
eksakt (1138 = 1138) ved normal plass.

**Dårlig → godt:** `left = clamp(anchor.right - panelWidth, viewportPadding,
viewportBredde - panelWidth - viewportPadding)` alene (kun klemming) → flip
`align` FØRST når motsatt kant har mer plass, klem ETTERPÅ som sikkerhetsnett
for tilfellet der ingen av kantene har nok plass.

---

## regel/anker-utenfor-viewport-lukker-ikke-klemmer

**Regel:** Et åpent flytende panel (Popover/OverflowMenu/Tooltip) som mister
sitt anker HELT ut av viewporten (siden scrolles mens panelet står åpent) skal
LUKKES, aldri fortsette å bli posisjonert/klemt inn i viewporten løsrevet fra
ankeret. Et anker som er KUN delvis synlig (den vanlige situasjonen — kanten av
triggeren fortsatt i syne) skal derimot fortsatt følges normalt av panelet.

**Scope:** `components/ui/FloatingLayer.tsx` (`useFloatingPosition`, den nye
`onAnchorOutOfView`-callbacken og `isAnchorOutsideViewport`-hjelperen i
`lib/floatingPosition.ts`), forbrukt av `components/ui/Popover.tsx` (→
OverflowMenu/Dropdown-mønsteret) og `components/ui/Tooltip.tsx`. MultiSelect
bruker samme hook uten denne callbacken (ikke del av denne leveransen) og
beholder derfor gammel oppførsel inntil videre.

**Hvorfor:** Founder-tilbakemelding 2026-09-13, punkt 1(d) — «Panelet dukker
opp sporadisk og ikke i det hele tatt, alt etter hvor langt ned på siden man
har scrollet.» Founders egen hovedløkke fant rotårsaken med konkrete tall: et
anker scrollet til **−256px**, mens panelet ble stående igjen på **426px** —
et flytende panel uten synlig, tilhørende anker. Koden hadde ALDRI en sjekk
for «ankeret er borte» — kun en beregning som antar ankeret er et sted i
viewporten og alltid produserer ET ELLER ANNET `top`/`left`. Riktig fiks er
ikke bedre klemming (det var nettopp det som ga det løsrevne panelet), men å
LUKKE.

**Unntak:** Ingen navngitt. (MultiSelect over er ikke et bevisst unntak — det
er utenfor denne leveransens filomfang, og bør få samme callback i en senere
runde.)

**Kilde:** Founder-tilbakemelding 2026-09-13, punkt 1(d). Fiks:
`lib/floatingPosition.ts` (`isAnchorOutsideViewport`, ren funksjon, 6 tester i
`tests/unit/floatingPosition.test.ts`), `components/ui/FloatingLayer.tsx`
(`onAnchorOutOfView`-callback lest via ref — ikke i effekt-deps, for å unngå
at en ny funksjonsidentitet hvert render kobler scroll/resize-lytterne av og
på). Bekreftet i nettleser (Playwright, dev OG et isolert produksjonsbygg,
`/design/components/overflow-menu`): åpne panel, scroll fra y=300 til y=3000 →
`[role="menu"]`-antall går fra 1 til 0 (panelet unmountes/lukkes), ingen
løsrevet panel liggende igjen.

**Dårlig → godt:** `mal()` som ALLTID kaller `setPos(computeFloatingPosition(...))`
uansett hvor ankeret er → sjekk `isAnchorOutsideViewport` FØRST, kall
`onAnchorOutOfView()` (kallstedet setter `open=false`) og hopp over
posisjonering når ankeret er borte.

---

## regel/tooltip-bredde-max-content

**Regel:** Et flytende panel UTEN egen `width`-verdi skal ALDRI la
shrink-to-fit-algoritmen bestemme bredden mot et smalt/uforutsigbart
forelder-element (ankeret/triggeren). Trenger panelet en egen bredde uavhengig
av ankeret sitt, bruk `width: max-content` (INTRINSIC størrelse fra innholdet
alene) sammen med `max-width` i en tekstrelativ enhet (`ch`), ikke en fast
pikselbredde.

**Scope:** `components/ui/Tooltip.tsx` (`side="left"`/`"right"`, som FØR denne
runden lå som `position: absolute` inne i sin egen — ofte smale —
trigger-wrapper). Generaliserer til ethvert fremtidig panel som IKKE går
gjennom `FloatingLayer`/`useFloatingPosition` sin `position: fixed`-portal (der
`left`/`top` alt er absolutte viewport-koordinater, uavhengig av forelder).

**Hvorfor:** Founder-tilbakemelding 2026-09-13, punkt 3 — «linjer kuttes etter
bare ett ord». Rotårsak: et `position: absolute`-element uten egen `width`
bruker shrink-to-fit-formelen MOT SITT NÆRMESTE POSISJONERTE FORELDER-ELEMENT,
her `<span className="relative inline-flex">`-wrapperen rundt selve
triggerknappen — ofte en smal ikon-knapp (28–40px). Tooltip-teksten fikk derfor
et par titalls piksler å boltre seg på, uansett hvor lang teksten faktisk var.
En fast pikselbredde (f.eks. `maxWidth: 220`) løser det NOEN ganger, men er
fortsatt en gjetning uavhengig av font/tekstlengde. `width: max-content` er
riktig fordi den er en INTRINSIC størrelse — regnet ut fra INNHOLDET alene,
ikke forelderens bredde — uansett hvor smalt ankeret er.

**Unntak:** `side="top"`/`"bottom"` var allerede upåvirket (de gikk gjennom
`FloatingLayer`-portalen med `position: fixed` og reelle viewport-koordinater,
ikke shrink-to-fit mot en forelder) — denne runden migrerte `left`/`right` inn
i SAMME portal-mekanisme (utvidet `FloatingSide` i `lib/floatingPosition.ts`
med `left`/`right`, kun vertikal klemming av tverraksen, ingen sidelengs flip)
i stedet for å bare fikse bredden lokalt, nettopp for å unngå at neste
klippende beholder rundt et sidelengs-anker skulle gi samme feilklasse som
Popover/OverflowMenu hadde FØR portalen (se `KlippeDemo` i
FloatingLayer-docen).

**Kilde:** Founder-tilbakemelding 2026-09-13, punkt 3. Fiks:
`components/ui/Tooltip.tsx` (`maxWidth` default endret fra `220` (px) til
`'36ch'`, `panelStyle` nå `width: 'max-content'` + `whiteSpace: 'normal'`),
`lib/floatingPosition.ts` (`FloatingSide` utvidet, `computeFloatingPosition`
sin nye horisontal-side-gren). Bekreftet i nettleser (Playwright, dev OG
produksjonsbygg, `/design/components/tooltip`, ny «Lang tekst»-eksempel):
en 11-ords setning på alle fire sider rendres på 2 linjer (ikke 11), bredde
~310px — flere ord per linje, ikke ett.

**Dårlig → godt:** `<span style={{ maxWidth: 220 }}>` uten egen `width` inne i
en smal, relativt posisjonert wrapper → `<span style={{ width: 'max-content',
maxWidth: '36ch' }}>`, portalert til `document.body` slik at `left`/`top` uansett
er absolutte viewport-koordinater.

---

## regel/visuell-endring-bekreftes-med-oppdater

**Regel:** Et meldt avvik fra `scripts/visuellvakt.mjs` (perseptuell hash —
dHash 8×8 struktur + 16×16 blokkmiddel-vektor valør, begge på samme 0–64-skala,
mot `scripts/visuell-baseline.json`) skal ALDRI overstyres, undertrykkes eller
ignoreres stille. To gyldige utfall, aldri et tredje:

1. **Endringen er BEVISST** (en reell, villet designendring — ny variant, rettet
   kontrastfeil, tatt-i-bruk komponent). Kjør
   `node scripts/visuellvakt.mjs --modus <docs|app> --oppdater` (evt. med
   `--bare <sti>` for én enkelt side) i SAMME commit som selve endringen, aldri
   som en oppfølgende commit. Skjermbildet fra kjøringen ligger i
   `.visuellvakt/` (gitignoret) — se på det FØR du oppdaterer baselinen, som en
   siste sjekk på at det du fryser faktisk er det du mente å endre.
2. **Endringen er UBEVISST.** Da er det en regresjon: finn den og rett den før
   commit. Aldri kjør `--oppdater` for å «få CI grønn» uten å ha sett
   skjermbildet og bekreftet at endringen var tilsiktet — det er nøyaktig den
   snarveien ratchet-vaktene (designvakt, tekstvakt, navnevakt, bundlevakt)
   finnes for å gjøre synlig i diffen i stedet for mulig å gjøre stille.

**Terskelen (standard 10 av 64 på begge mål) finnes for å ABSORBERE STØY**
(sub-piksel-rendering, font-hinting, antialiasing) — IKKE for å skjule en reell
endring. Å heve `--terskel` for å få en kjent regresjon under taket er samme
brudd som å håndredigere en baseline-JSON for hånd: det flytter linjen i stedet
for å adressere avviket. En terskel-heving er en egen, begrunnet beslutning
(founder), ikke noe en agent gjør underveis i en leveranse for å komme forbi
vakten.

**Scope:** `docs`-modus (offentlige `/design`-sider, kjøres i CI) og
`app`-modus (innloggede dashbord-sider via `/api/dev/login`, kjøres kun lokalt
FØR promotering — aldri i CI, siden `/api/dev/login` er 404 i prod). Baselinen
i `scripts/visuell-baseline.json` holder begge modiene i hvert sitt
navnerom (`docs`/`app`); en `--oppdater` uten `--bare` erstatter HELE det
aktuelle modiens sett (rydder bort hasher for slettede sider), en `--oppdater
--bare <sti>` fletter inn kun den ene sidens nøkler.

**Hvorfor:** Founder 13. sep 2026: «Trenger visuell regresjonstest da? Hva
tenker du? Gjennomfør anbefaling.» Anbefalingen var JA, men LETT — ingen
PNG-baseliner i repoet (70+ docs-sider × opptil 4 kombinasjoner ville vært
hundrevis av bilder for en app uten budsjett for det). Perseptuelle hasher
(noen hundre KB tekst) gir samme RATCHET-GARANTI som de andre vaktene —
«et avvik krever et bevisst valg, synlig i diffen» — uten bilde-vekten.

**Unntak:** Ingen navngitt. Kjente kilder til falske positiver er allerede
adressert i selve vakten, ikke unntatt bort:
- Suspense-skall/skjelett (`.animate-pulse`, `template[id^="B:"]`) — ventes ut
  (inntil 2 s) før skjermbildet tas, IKKE unntatt fra måling. Unntaket er
  `/design/components/skeleton`, som bevisst VISER skjelettet — det gir en
  advarsel i loggen, ikke en feil, siden `animations:'disabled'` fryser en
  uendelig CSS-animasjon deterministisk til startrammen uansett.
- Temabytte (mørk/lys) settes via `localStorage['frivio_theme']` FØR første
  navigasjon (Playwright `addInitScript`), så det aldri er en overgang å vente
  ut — appens eget init-script i rot-layouten maler riktig tema fra første
  frame.
- Varselbjellas ulest-antall (dynamisk på alle innloggede sider) maskeres med
  Playwright sin `mask`-boks i `app`-modus. `docs`-modus har ingen kjente
  dynamiske elementer — komponentdemoer med tilfeldig/JS-drevet tilstand
  (Confetti sin canvas-partikkelsimulering) er alle klikk-utløst og fyrer
  ALDRI ved et rent, automatisert sidelaster.
- En side som gir 0 tegn `innerText` etter ventingen telles som «TOM» og
  feiler kjøringen uansett hash-avstand (AGENTS.md-prinsippet: en måling som
  gir 0 funn skal alltid mistenkes for å ha målt ingenting, ikke stille
  godkjennes som «ingen avvik»).

**Kilde:** Founder 13. sep 2026, direkte oppdrag («Trenger visuell
regresjonstest da?»); metoden speiler ratchet-mønsteret i `designvakt.mjs`/
`tekstvakt.mjs`/`navnevakt.mjs`/`bundlevakt.mjs` (alle: dagens tilstand er
baseline, CI feiler på FLERE avvik enn frosset, `--oppdater` er den eneste
lovlige veien forbi).

**Dårlig → godt:** CI melder avvik på `/design/components/button` (375/lyst)
etter en tekstendring i demoen → i stedet for å heve `--terskel` eller committe
uten å se på det, kjør vakten lokalt, åpne
`.visuellvakt/docs/light-375/design_components_button.png`, bekreft at
endringen er den tilsiktede, og kjør
`node scripts/visuellvakt.mjs --modus docs --bare /design/components/button --oppdater`
i samme commit.

---

_Notat fra leveransen 13. sep 2026 (`scripts/visuellvakt.mjs`): denne regelen
er DRAFTET i produktskjønn-format som en del av oppdraget, men er IKKE flettet
inn i den faktiske `skill/frivio-ui/references/produktskjonn.md` — den filen
lå utenfor denne leveransens filliste (kun `scripts/visuellvakt.mjs`,
`scripts/visuell-baseline.json`, `package.json`, `.github/workflows/ci.yml`,
`.gitignore`, `SYSTEM.md` var eid). Flett inn ved neste anledning som
`regel/visuell-endring-bekreftes-med-oppdater`, nummerert inn i rekkefølgen
sammen med de andre reglene (produktskjønn-filen sto på 83 regler ved denne
leveransen — denne blir nr. 84)._

---

## regel/kort-pa-samme-rad-er-like-hoye

**Regel:** Kort som står side ved side på samme rad (samme grid/flex-rad) er
ALLTID like høye, uansett hvor mye tekst hvert enkelt kort inneholder. Et kort
med en verdi som bryter til to linjer (f.eks. «Krever oppfølging») skal
STREKKE HELE RADEN, ikke bare bli synlig høyere enn naboene sine.

**Scope:** `StatCardRad`/`StatCard` (`components/ui/StatCard.tsx`) — PRIMITIVET,
gjelder derfor alle kallsteder (dashbord, gjøremål, økonomi/regnskap, tilbud,
UnitsPanel, BetalingsHeader, BudsjettView). Fiksen er to linjer i primitivet:
`StatCardRad`s grid får `items-stretch` (eksplisitt — CSS Grid sin
`align-items: normal` regnes riktignok allerede som `stretch`, men det
strekker bare den DIREKTE grid-cellen, typisk en klikkbar `<Link>`), og
`StatCard`s rot-`div` får `h-full` slik at selve kort-flaten (bakgrunn,
kant) fyller den strukne høyden i stedet for å krympe til eget innhold og
etterlate et tomt gap.

**Hvorfor:** Founder 13. sep 2026 (Lighthouse-oppdrag, «Cards på samme row må
ha like høyde. Så et eksempel på dashboard bl.a. på mobil.»). Målt på
dashbordets seks områdekort (Eiendom/Avtaler/Økonomi/Årsmøte/Regler/HMS) ved
375px: «Årsmøte» sin verdi («Krever oppfølging») brøt til to linjer og kortet
ble 132px, mens «Økonomi» ved siden av forble 100px med synlig tomrom under —
selv om den ytre klikkbare `<Link>` allerede var strukket til radens fulle
132px (CSS Grid-defaulten virket på cellen, ikke på kort-flaten inni). Målt
FØR fiks: `linkHeight=132` / `cardHeight=100` (mismatch). Målt ETTER fiks:
`linkHeight=132` / `cardHeight=132` på alle seks kort, både 375px og 1280px.

**Unntak:** Grid/rader der radene BEVISST er topp-justert fordi innholdet er
lister av ulik lengde, ikke enkeltstående KPI-kort — f.eks. dashbordets
«Kommende befaringer»/«Siste aktivitet»-rad (`alignItems: 'start'` i
`app/(dashboard)/dashboard/page.tsx`), der to lister med ulikt antall rader
IKKE skal tvinges til samme høyde (ville gitt et stort dødt tomrom under den
korteste lista). Skillet: er innholdet ETT tall/status (StatCard) → strekk.
Er innholdet EN LISTE av ukjent lengde → topp-juster.

**Kilde:** Founder 2026-09-13 (Lighthouse-nullpunkt, `arkiv/rapporter/LIGHTHOUSE-2026-09-13.md`,
funn 2/3); målt og portert i samme leveranse i `components/ui/StatCard.tsx`
(`h-full` på kort-rot, `items-stretch` på `StatCardRad`) + docs i
`app/design/components/demos/StatCard.tsx` («Like høye uansett innhold»).

**Dårlig → godt:** Et kort-rutenett med `<div className="grid grid-cols-3 gap-4">`
og hvert kort med egen `p-5`-boks uten `h-full` → `StatCardRad` (som allerede
har `items-stretch` innebygd) + `StatCard` (som allerede har `h-full`
innebygd) — aldri håndrull et nytt grid for et sett med KPI-kort.

---

## regel/sidemeny-tittel-apner-gruppe

**Regel:** Klikk på selve GRUPPETITTELEN i sidemenyen (`SidebarNav.tsx`) — ikke
bare pil-knappen — navigerer til gruppens landingsside OG åpner gruppen,
uansett hva et tidligere manuelt «lukket»-valg sa. Er gruppen ALT aktiv og
åpen, OG du står ALT på landingssiden, er navigasjon en null-operasjon — da
tolkes klikket i stedet som ren lukk (toggle, `preventDefault()`, ingen
navigasjon). Står du på en underside i en aktiv+åpen gruppe, navigerer
klikket til landingssiden og lar gruppen stå åpen. I tillegg: når RUTEN (ikke
et klikk i denne menyen) går INN i en gruppe — ⌘K, brødsmule, direkte URL,
eller en lenke i selve sideinnholdet — nullstilles et gammelt manuelt
«lukket» for AKKURAT den gruppen, så den åpner seg med ruten. Andre grupper
beholder sitt manuelle valg. Pilen (`sidebar-expand-btn`) er uendret: den
åpner/lukker uten å navigere, uansett rute.

Implementasjonsfelle å unngå ved gjenbruk av mønsteret: ruteinngang-
nullstillingen kan IKKE avledes rent i rendring ved å sammenligne mot forrige
`pathname` holdt i `useState` («adjuster state under rendring»-mønsteret).
`useSyncExternalStore` mot en localStorage-butikk bruker en SSR-trygg TOM
plassholder (`getServerSnapshot`) helt til React korrigerer til den ekte
verdien i en SEPARAT rendring rett etter hydrering. En sammenligning gjort
inni selve rendringen konsumerer sitt ene forsøk FØR den korrigerte verdien
er tilgjengelig, og treffer da alltid den tomme plassholderen — nullstillingen
ser ut til å virke (aktiv-fallback gir samme visuelle resultat som en vellykket
nullstilling), men blir ALDRI faktisk skrevet til localStorage. Bekreftet med
en Playwright-kjøring som feilet nøyaktig slik på en hard navigasjon
(`page.goto`): synlig tilstand viste riktig, men lagringen forble uendret.
Riktig løsning er ÉN `useEffect` (ikke en `useEffect`+`setState`-kjede — den
speiler ikke én tilstand inn i en annen, den skriver direkte til den delte
butikken) som leser butikken via et vanlig funksjonskall (`getManualSnapshot()`),
uavhengig av Reacts rendringssyklus, og derfor alltid ser den ekte verdien.

**Kilde:** Founder 13. sep 2026, kveld: «Dashboard og Økonomi har ikke auto
open og collapse når jeg trykker på de i sidemenyen» og «Når vi trykker på
tittel i sidebar, burde ikke den expande/collapse da?» Rotårsak var at
`manual[href] ?? active` lot et gammelt manuelt «lukket»-klikk vinne over
aktiv rute for alltid, og gruppetittelen var kun en ren `Link` som aldri
rørte det manuelle valget.

**Eksempel:** `app/(dashboard)/SidebarNav.tsx` — `onTittelAktivert()` (klikk/
Enter/Space på tittelen) og `useEffect` med `forrigePathnameRef` (ruteinngang
via ⌘K/brødsmule/URL). Verifisert headless (Playwright, `chromium.launch()` +
`/api/dev/login` + `page.goto`): (a) `/okonomi/regnskap` → Økonomi åpen; (b)
pil-klikk lukker, `page.goto('/okonomi/budsjett')` (hard navigasjon, samme
gruppe) åpner den igjen og nullstillingen er faktisk persistert i
localStorage (bekreftet etter 500 ms settle, ikke bare et transient utslag);
(c) tittel-klikk på `/okonomi` (aktiv+åpen, på landingssiden) lukker uten å
endre URL, klikk igjen åpner.

---

## regel/typehierarki-roller

**Regel:** En ROLLE på en skjerm (ikke en skala-verdi) har én bestemt klasse.
Full tabell + et levende «side i miniatyr»-eksempel:
`app/design/typography/TypographyPage.tsx` (seksjon «Hierarki», øverst på
siden, `#hierarki`) og <https://design.frivio.no/typography#hierarki>; samme
tabell i prosa i `public/design.md` under «## Typography» → «### Hierarki —
roller, ikke skalaer»; kort versjon i `skill/frivio-ui/SKILL.md` rett under
lov 2 (`regel/tre-vekter-400-leser-500-navngir-600-titler`). Utledet ved å
lese primitivene selv (PageHeader, SectionHeader, Card-konvensjonen, ListRow,
Field/DescriptionList, StatCard, Button, Input/Select/Table,
DocsSectionTitle, Callout/InlineNote) — ikke funnet opp uavhengig av koden.
Én setning per rolle:

- **Sidetittel** — `.type-page-title` (600), `PageHeader` sin `h1`.
- **Sideinfo** — `.type-copy-14` (400, text-secondary), `PageHeader` sine
  `children` (formålslinjen — IKKE `info`-popoveren, som er dypere detalj).
- **Seksjonstittel** — `.type-heading-16` (600), `SectionHeader` sin `title`.
- **Korttittel** — `.type-heading-16` (600), samme klasse som Seksjonstittel;
  konvensjon i `Card`-innhold (`EmptyState`, `ErrorState`,
  `ComplianceDutiesPanel` m.fl.), ingen egen `CardTitle`-komponent finnes.
- **Listetittel** — `.type-heading-14` (600), `ListRow` sin `title` (egen
  founder-beslutning, bølge 3: «hovedtekst bør være tydeligere enn
  støttetekst»).
- **Sekundærtekst i rad** — `.type-label-13` (400, text-secondary; `value`
  er text-primary), `ListRow` sine `secondary`/`value`/`meta`-slot.
- **Etikett/feltnavn** — `.type-label-13-strong` (500, text-secondary): `Field`/`DescriptionList`
  sin nøkkel, `Input`/`Select` sin etikett og `Table` sitt kolonnehode. Én størrelse per rolle.
- **Brødtekst** — `.type-copy-14` (400, text-primary), generell brødtekst og
  `Text` sin standardvariant.
- **Hjelpetekst** — `.type-copy-14` (400, farge arvet/kalleren styrer),
  `Callout`/`InlineNote` sitt innhold.
- **Stort tall** — `.type-heading-24 tabular-nums` (600, text-primary),
  `StatCard` sin `value`.
- **Knapp** — `.type-button-16`/`-14`/`-12` (500, variantavhengig farge),
  `Button`.
- **Overline** — `.type-overline` (500, mono, caps), `DocsSectionTitle` sin
  `title` (text-primary) og `SectionHeader` sin `eyebrow` (text-tertiary).

**Avvik funnet under utledningen, rettet samme dag:** `Field`/`DescriptionList` hadde 12 px der
`Input`/`Select`/`Table` hadde 13 px for samme rolle. Nå 13 px overalt (Field.tsx, DescriptionList.tsx),
så et feltnavn ser likt ut i lese- og redigeringsmodus.

---

## regel/fane-aktiv-500

**Regel:** Aktiv fane i `Tabs` og `PillTabs` er `-strong` (500) —
`type-label-14-strong` i `Tabs` og i `PillTabs size="md"`,
`type-label-13-strong` i `PillTabs size="sm"`. Inaktive faner er 400.
Vektbyttet skal ALDRI endre fanens bredde: begge komponentene reserverer
bredden på forhånd med en usynlig (`aria-hidden`, `invisible`) -strong-kopi av
etiketten, lagt oppå den synlige teksten i samme rutenett-celle (`grid` +
`col-start-1 row-start-1`), slik at cellen alltid måler den bredeste av de to
vektene — uavhengig av hvilken som faktisk vises.

**Scope:** `components/ui/Tabs.tsx` og `components/ui/PillTabs.tsx` — enhver
fane-/pillerad i systemet. IKKE andre komponenter som skiller aktiv/inaktiv på
farge eller flate alene (`Badge`, `Toggle`-lignende kontroller) — de ligger
utenfor denne regelens scope inntil en tilsvarende korreksjon kommer for dem
spesifikt.

**Hvorfor:** Founder 13. sep 2026 (kveld): «Burde fane-font ha medium
weight?» — en oppfølging av vektregelen fra 12. sep («400 leser, 500 navngir,
600 titler», se Hierarki-tabellen i `public/design.md`). En fane NAVNGIR en
visning eller et filter når den er valgt, akkurat som et feltnavn
(`type-label-13-strong`) eller en `Callout`-tittel — og skal derfor være
-strong i valgt tilstand. Før dette rettet brukte begge komponentene 400 på
ALLE faner uansett tilstand (se den fjernede kommentaren i `PillTabs.tsx`:
«Aktiv skilles på farge/flate, ikke egen vekt»).

Bredde-reservasjonen er en del av regelen, ikke en implementasjonsdetalj: et
rått `active ? 'type-label-14-strong' : 'type-label-14'`-bytte uten
reservasjon flytter fanens bredde noen piksler ved hvert klikk — og i
`PillTabs` flytter det i tillegg ALLE pillene til høyre for den som endret
vekt, siden pillene deler én rad. Uten reservasjonen ville også
overflow-beregningen i `PillTabs` (som måler naturlig bredde for å avgjøre
hvor mange piller som får plass før «…»-triggeren) blitt feil idet en pille
blir aktiv, fordi den målte bredden ikke lenger ville stemme med den faktisk
renderte.

**Unntak:** Ingen kjente. Skal en fremtidig fane-/pille-variant bevisst IKKE
bruke -strong på aktiv (f.eks. en lav-kontrast-variant), er det en
founder-beslutning med begrunnelse i koden — ikke et stille avvik.

**Kilde:** Founder-tilbakemelding 13. sep 2026 (kveld).

**Dårlig → godt:** `<span className="type-label-14">{tab.label}</span>` for
ALLE faner uansett tilstand (det gamle mønsteret, ingen vektforskjell) → to
stablede spenn i én `grid`-celle: en usynlig `-strong`-kopi (ren
bredde-reservasjon, `aria-hidden`) + en synlig kopi som er `-strong` når
fanen er aktiv, ellers 400.

**Beslektet:** `regel/tabs-visning-pilltabs-filter-yearselector-periode`
(hvilken komponent brukes til hva); Hierarki-tabellen i `public/design.md`,
«Én størrelse per rolle»-avsnittet (13. sep).

**Verifisert (13. sep 2026, headless Playwright mot lokal dev-server, innlogget
via `/api/dev/login`):** `getComputedStyle(...).fontWeight` = "500" på aktiv
fane/pille og "400" på inaktiv, på både `/okonomi/regnskap` (Tabs) og
`/seksjoner` (PillTabs via `DataTable`), på 1280px og 375px.
`getBoundingClientRect().width` er IDENTISK før og etter klikk (diff 0px) for
samme fane/pille i alle fire kombinasjoner (2 sider × 2 bredder).

---

## regel/flytende-lag-lukkes-utenfor

**Regel:** Ethvert flytende/overlagt panel — popover, meny, dropdown-liste,
kombinert felt+liste (Autocomplete/MultiSelect/BrregSearch), modal,
bekreftelsesdialog, mobil-bunnark — lukkes ved (1) `pointerdown` utenfor
BÅDE anker og panel, (2) Escape, og (3), for modal/bunnark, tapp/klikk på
selve scrimen. Delt kildekode: `lib/useKlikkUtenfor.ts` for pointerdown+
Escape (brukt av `Popover`, `MultiSelect`, `NotificationBell`,
`AssistantWidget`, `lib/useDismissable.ts`, og `FloatingLayer`-docens egne
demoer) — `Modal.tsx` og `BottomNav.tsx`s «Mer»-ark løser scrim-klikk lokalt,
fordi de er fullskjerms-overlegg mot viewporten, ikke ankret mot et element.

**Scope:** Alle nye og eksisterende flytende/overlagte paneler i
`components/ui/`, `components/` og `app/`. Gjelder IKKE inline ekspansjoner
som erstatter en knapp/rad PÅ STEDET i dokumentflyten uten `position:
fixed/absolute` eller z-index (`SendBekreftelse`, `SendToResidents`,
`VedtattStatus`, `SidebarNav` sine ekspanderbare grupper — se
`regel/modal-gjore-accordion-lese` for skillet mellom «lese mer på stedet» og
«gjøre noe i et overlegg»). Gjelder heller ikke `Toast`: en toast er en
tidsstyrt/manuelt lukkbar notifikasjon, ikke en meny man avviser ved å
klikke andre steder.

**Hvorfor:** Founder, natt til 14. sep 2026, ordrett: «Popups, popovers etc.
må lukkes når man trykker utenfor dem.» Inventar samme natt (17
implementasjoner kartlagt) viste at `Popover` og `MultiSelect` FAKTISK
allerede hadde dette — men som to nesten identiske, uavhengige
`mousedown`-lyttere. Det reelle problemet var spredningen: `NotificationBell`
og `ShareGFButton` (via `lib/useDismissable.ts`) hadde HVER SIN TREDJE/FJERDE
kopi av akkurat samme logikk, og `AssistantWidget` (Kari-panelet) hadde
KUN Escape — null klikk-utenfor-håndtering i det hele tatt. Én delt hook
gjør «lukkes ved klikk utenfor» til én sannhet i stedet for et mønster som må
gjenoppdages (og kan glemmes) hver gang noen bygger et nytt panel — nøyaktig
samme argument som allerede gjelder for `Popover` selv (se dens toppkommentar:
«det finnes allerede fire popovers i systemet, og en femte ville vært en
femte måte å gjøre det samme på»).

Tekniske krav i selve hooken (`lib/useKlikkUtenfor.ts`), alle begrunnet av
konkrete feil i de gamle kopiene:
- **`pointerdown`, ikke `click`**: fyrer FØR fokus flytter seg, og fungerer
  likt med touch — en `click` etter et tapp kommer for sent.
- **Flere refs, aldri DOM-tre-antakelser**: et portalert panel
  (`FloatingLayer.tsx`, 2026-09-12) ligger UTENFOR ankerets DOM-tre i
  `document.body` — «utenfor» sjekkes derfor mot `.contains()` på HVER ref
  for seg (anker OG panel), aldri ved å anta felles forelder.
- **Stjeler ALDRI fokus selv**: hooken kaller kun `onUtenfor(arsak)`.
  Fokusretur ved Escape er kallstedets ansvar (`Popover` sin `arsakRef`) —
  klikk utenfor eller kallerstyrt lukking (Dropdowns lenke-modus, som
  navigerer bort med vilje) skal IKKE stjele fokus, kun et eksplisitt
  Escape-trykk skal.
- **`escape: false`-opsjon**: for kallesteder som allerede eier Escape et
  annet sted med egen betydning (`MultiSelect` fanger Escape på cmdk sin
  `<Command>`-rot og `stopPropagation()`-er det, blant annet så samme
  tastetrykk ikke også lukker en omsluttende Modal).

**Unntak:** `InfoHint` (components/InfoHint.tsx) og `Begrep`
(components/ui/Begrep.tsx) har egne, KORREKT fungerende mousedown+Escape-
implementasjoner (ikke portalert, `ref.contains()` på egen DOM-undertre) —
disse er IKKE migrert til `useKlikkUtenfor` i denne runden, fordi de allerede
oppfylte regelen og migrering ville vært ren opprydning utenfor det
founder-oppdraget faktisk etterspurte. Bør migreres ved neste anledning for
å fjerne de to siste håndrullede kopiene, men er ikke en funksjonell mangel.
`CommandPalette` og `BottomNav`s «Mer»-ark bruker en annen, men fullverdig,
idiom (`onClick` på selve scrimen med `e.target === e.currentTarget`-vakt) —
vurdert og beholdt fordi de er fullskjerms-overlegg mot viewporten, ikke
ankret mot et enkelt trigger-element slik `useKlikkUtenfor` er designet for.

**Kilde:** Founder, natt til 14. sep 2026: «Popups, popovers etc. må lukkes
når man trykker utenfor dem.» Implementert i `lib/useKlikkUtenfor.ts` (ren
beslutningsfunksjon `erUtenforAlle` testet i `tests/unit/useKlikkUtenfor.test.ts`),
brukt av `components/ui/Popover.tsx`, `components/ui/MultiSelect.tsx`,
`components/dashboard/NotificationBell.tsx`, `components/AssistantWidget.tsx`,
`lib/useDismissable.ts` og `app/design/components/demos/FloatingLayer.tsx`.
Fullt inventar: `popup-inventar.md` i samme leveranse.

**Dårlig → godt:** Et nytt panel som skriver sin egen
`document.addEventListener('mousedown', ...)`-lytter med en `ref.contains()`-
sjekk → `useKlikkUtenfor([ankerRef, panelRef], () => setOpen(false), open)`
fra `lib/useKlikkUtenfor.ts`. Reelt eksempel fra denne leveransen:
`AssistantWidget` hadde `useEffect` med KUN en Escape-lytter og ingen
pointerdown/mousedown i det hele tatt → samme hook med `{ escape: false }`
(Escape-effekten med sin egne fokusretur til launcher-knappen sto urørt).

---

---

## regel/lose-elementer-far-en-eier

**Kilde:** founder, natt til 14. sep 2026, skjermbilde av `/okonomi/regnskap`
(fanen Årsregnskap): «De tre prikkene henger i løse luften, jeg vet ikke hva de
er. 'Lagret i Frivio · oppdatert …' henger i løse luften.»

**Regel:** en statuslinje, en lagringsindikator (`SaveIndicator`) eller et
`OverflowMenu` («…») skal ALDRI stå alene i en fri `<div>`/`<Link>` uten en
tittel å høre til. De er `action`/`description` på en `SectionHeader` (eller,
inne i et kort, en tittelrad med samme rolle) — aldri en egen rad midt i
innholdet, og aldri utenfor begge fanene på en faneside (da mangler de i
tillegg en aktiv seksjon å tilhøre).

**Eksempel — før (regnskap/page.tsx):**
```tsx
{bankKoblet && (
  <Link href="/okonomi/bank" className="lift inline-flex items-center gap-2 type-copy-13">
    <StatusDot tone="success" />
    {bankStatusLabel}
    <PilHoyre size={14} />
  </Link>
)}
{/* ...lenger ned, i en annen fri rad: */}
<div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
  <OverflowMenu items={[{ label: `Slett ${year}`, ... }]} />
  {lagreStatus === 'lagret' && <span>Lagret i Frivio · oppdatert …</span>}
</div>
```

**Eksempel — etter:**
```tsx
<SectionHeader
  title={`Årsregnskap ${year}`}
  description={bankStatusLabel}
  action={<div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
    <Link href="/okonomi/bank">Bank</Link>
    <SaveIndicator tilstand={...} lagretTekst={`Lagret i Frivio · oppdatert ${dato}`} />
    <OverflowMenu sections={[...]} />
  </div>}
/>
```

**Merknad (grensesnitt-begrensning, ikke en unnskyldning):** `SectionHeader`
sin `description`-prop er en RAW STRING — ingen lenke kan bo inni selve
setningen. Der en lenke tidligere satt inne i statusteksten (eller i en
InlineNote som forklarte det samme), flytt lenken til `action`-raden som en
liten sekundærlenke ved siden av lagringsindikatoren/menyen, i stedet for å
hardkode en ny fri lenke-rad et annet sted. Meld fra til D-teamet som eier
`components/ui/` hvis dette dukker opp igjen 3+ steder — da er det trolig verdt
en `description?: ReactNode`-utvidelse (branch, ikke type-breaking siden
`ReactNode` aksepterer `string`).

---

## regel/lopende-tekst-65ch

**Kilde:** Founder natt til 14. sep 2026, «Årsmøte, innkomne saker»: «vi må ha ch på tekst, linjene blir for lange».

**Funn:** Løpende beskrivelsestekst i flere primitiver hadde ingen breddegrense og strakk seg til
hele foreldreelementets bredde. På `/arsmote`, `StepCard` («Innkomne saker», via `AddFormPanel` →
`SectionHeader`) brøt linjer ved over 90 tegn på 1280px — godt over lesbarhetsstandardens ~65 tegn
for løpende tekst.

**Regel:** Løpende beskrivelsestekst (ikke navngiving/label, ikke tabellceller) skal ha
`max-w-[65ch]` uansett hvor bred beholderen rundt er. Gjelder beskrivelses-/formålslinjer, ikke
titler, etiketter eller enkeltord.

**Rettet i (primitivnivå, retter alle kallsteder samtidig):**
- `components/ui/StepCard.tsx` — description-avsnittet.
- `components/ui/SectionHeader.tsx` — description-avsnittet.
- `components/PageHeader.tsx` — `children` (formålslinjen under tittelen).
- `components/ui/InlineNote.tsx` — innholdsbeholderen (denne eies primært av en annen agent fra
  13. sep 2026-leveransen; kun bredde lagt til her, `type-copy-14` fra før er urørt).

**Bevisst IKKE rørt:**
- `components/ui/EmptyState.tsx` — har allerede `max-w-sm` (24rem/384px) på beskrivelsesteksten,
  som er en egen, allerede-fornuftig bredde for SENTRERT tekst (annen layout-kontekst enn venstre-
  stilt løpende tekst). Ingen endring nødvendig.
- `components/ui/Callout.tsx` — innholdet har INGEN breddegrense i dag, og flere eksisterende
  kallsteder (f.eks. `app/(dashboard)/vedtekter/VedtekterClient.tsx`, `app/system/drift/page.tsx`)
  har synlig lange linjer som trolig også burde vært ~65ch. Ikke rettet i denne leveransen: Callout
  er i bruk på ~70 steder inkludert `app/(dashboard)/okonomi/**` (annen agents arbeidsområde akkurat
  nå), og en bred, ikke-eksplisitt autorisert endring i et så mye brukt primitiv midt i en parallell
  økt vurderes som for stor et sideeffekt-overflate å ta uten et eksplisitt founder-OK. **Åpent
  spørsmål til founder**: bør Callout få samme `max-w-[65ch]` på sitt innhold?

**Korreksjon (founder 14. sep 2026, /system/ai-bruk):** Callout FIKK 65ch samme morgen, og founder
avviste det samme ettermiddag: «Tekst burde dekke bredden av callout − padding.» Avgjørelse: en
Callout har INGEN breddegrense på teksten. Grunnen er at Callout er en tonet flate — tom farget
flate til høyre for teksten leses som en feil, ikke som luft, mens en beskrivelseslinje på nøytral
bakgrunn ikke har det problemet. Lesbarheten holdes i stedet av lengden: en callout er én til to
setninger (`regel/callout-er-melding-aldri-beholder`); trenger meldingen fem linjer, er den ikke
en callout — forklaringen hører i `Begrep` der ordet står, i sidens formålslinje eller i en
`InlineNote` (som beholder 65ch, founders opprinnelige bestilling). AI-bruk-callouten gikk fra
fem linjer til én, og «Estimert kost»/«Feilandel» ble `Begrep` i kolonnehodene.

**Statisk test:** `tests/unit/ui/stepCard.test.tsx`, `tests/unit/ui/sectionHeader.test.tsx`
(nye filer, renderToStaticMarkup, sjekker `max-w-[65ch]` i markup).

---

## regel/statcard-verdi-en-linje

**Kilde:** Founder natt til 14. sep 2026, «Vedlikeholdsfinansiering»: kortet «Estimert totalkostnad»
brøt tallet («651 000–893 000 kr») over to linjer i en 4-kolonners `StatCardRad` på 1280px.

**Regel:** `StatCard` sin `value` (når den er en streng/tallverdi, dvs. har en målbar tekstlengde)
skal ALLTID vises på én linje. Løsning i primitivet (`components/ui/StatCard.tsx`):
- `whitespace-nowrap` alltid på verdi-avsnittet.
- Skriftstørrelsen trappes ned etter strenglengde: ≤11 tegn → `type-heading-24` (uendret), 12–16
  tegn → `type-heading-20`, >16 tegn → `type-heading-16`.
- En `ReactNode`-verdi UTEN strenglengde (f.eks. en `Badge` eller annen komponent) beholder alltid
  `type-heading-24` — nedtrappingen måler kun `string`/`number`-verdier.

**Terskler målt mot:** 4-kolonners `StatCardRad` på 1280px (kortbredde ≈ 280px, ≈ 240px innenfor
`p-5`-paddingen) og full bredde på 375px. Bekreftet med Playwright (`getClientRects().length === 1`
for det faktiske eksempelet «651 000–893 000 kr», både 1280 og 375, lys og mørk tema).

**BudsjettView sitt `kortSpenn`** (`components/tasks/BudsjettView.tsx`, linje ~149) ble VURDERT men
IKKE endret: en lavere terskel for `formatBelopKort` (f.eks. ≥100 000 i stedet for ≥1 000 000) ble
sjekket mot det konkrete eksempelet — «0,65–0,89 mill. kr» og «651 000–893 000 kr» er begge nøyaktig
18 tegn, altså INGEN lengdegevinst av å bytte format, og «mill.»-avrunding til én desimal (100 000 kr
presisjon) er en reell presisjonskostnad for et budsjettall som ikke er nødvendig når primitivet
alene løser linjebruddet. Valg: behold `kortSpenn` uendret, la StatCard-primitivet bære fiksen.

**Statisk test:** `tests/unit/ui/statCard.test.tsx`, nytt describe-blokk
«StatCard — verdi-nedtrapping og whitespace-nowrap» (5 tester: kort/middels/lang streng, tallverdi,
ReactNode-verdi, nowrap alltid).

**Docs:** `app/design/components/demos/StatCard.tsx` fikk et nytt eksempel «Langt tall på én linje»
+ en setning i `whenToUse` + oppdatert `value`-prop-beskrivelse.

---

---

## regel/aktiv-rad-bakgrunn-uten-strek

**Regel:** En aktiv rad i sidemenyen (og andre navigasjonslister) markeres med bakgrunnsfarge
(`--sidebar-item-active`) og tekstfarge alene. Ingen vertikal aksentstrek, ingen glød, ingen
ekstra markør i kanten.

**Kilde:** Founder 14. sep 2026, skjermbilde av «Innstillinger» i sidemenyen: «Den blå
vertikale linjen skal bort. Det holder med bakgrunnsfarge for å markere noe.»

**Eksempel:** `app/(dashboard)/SidebarNav.tsx` — den absolutt-posisjonerte 3 px-streken med
`--color-accent-glow` ved aktivt toppunkt er fjernet; raden har `--sidebar-item-active` som
bakgrunn og `--color-accent-text` som tekstfarge.

---

## regel/sidehode-40px

**Regel:** Enhver kontroll i `PageHeader` sin `context`- eller `action`-slot
(`ByggVelger`/`Dropdown`, `YearSelector`, `PeriodeVelger`, `Button`, o.l.) er
40px på desktop og 44px på mobil — samme `min-h-11 lg:min-h-0`-mekanikk som
`Button`. Aldri komponentens egen standardstørrelse hvis den avviker (f.eks.
`Dropdown` sin standard er `sm`/32px — feil i denne konteksten).

**Scope:** `PageHeader` sin `context`- og `action`-prop, i hele appen.
Beslektet, men distinkt fra `regel/verktoylinje-en-hoyde` (som gjelder
`Toolbar` over lister/tabeller) — samme underliggende prinsipp, to ulike
steder kontrollene bor.

**Hvorfor:** Founder 14. sep 2026, to skjermbilder (Seksjoner sitt sidehode,
Regler-sidens bunnrad): «Knappen må ha samme høyde som byggvelgeren. Gjelder
gjennomgående der knapper står på samme plass som byggvelgeren» og «Knappene
må ha samme høyde. Det gjelder ALLE knapper som er satt ved siden av
hverandre.» Rotårsak: `Dropdown` sin standard `size` er `sm` (32px, tenkt for
navigasjon/innhold), mens `Button` sin standard er `md` (40px) — `ByggVelger`
sendte ingen `size` og ble dermed 8px lavere enn knappen ved siden av i
sidehodet på 8 av 8 sider som bruker mønsteret. `YearSelector` hadde samme
feil fra en annen rot: `h-11 lg:h-8` (32px desktop) i stedet for `lg:h-10`.

**Retting (14. sep 2026, denne leveransen):**
- `components/ByggVelger.tsx`: `<Dropdown size="md" .../>` — retter ALLE
  kallesteder i ett grep (ByggVelger er alltid bygget på Dropdown).
- `components/ui/YearSelector.tsx`: `h-11 lg:h-8` → `h-11 lg:h-10`, interne
  `IconButton` `sm` → `md` (fyller rammen likt som før).
- Sideknapper som eksplisitt satte `size="sm"` ved siden av ByggVelger i
  `action`-slotten (nå feil, siden ByggVelger ble 8px høyere): fjernet
  `size="sm"` i `app/(dashboard)/eiendom/bygginfo/page.tsx`,
  `app/(dashboard)/eiendom/page.tsx` (arbeidsbord-varianten, to knapper) og
  `components/historikk/HistorikkListe.tsx` (`RegistrerHendelseKnapp`).

**Kjent, IKKE rettet (forbudt-fil i denne leveransen):**
`app/(dashboard)/avtaler/register/page.tsx` — `context={<ByggVelger .../>}`
ved siden av `action={<Button ... size="sm">Ny avtale</Button>}`. Samme
mismatch, samme fiks (fjern `size="sm"`), men fila er en annen agents aktive
arbeidsområde i denne økten — rapportert i stedet for rettet.

**Unntak:** Ingen kjent. `OrgSwitcher` (sidebar/topbar) er IKKE i scope —
den bor i navigasjonschrome, ikke i `PageHeader`.

**Kilde:** Founder 14. sep 2026 (to skjermbilder: Seksjoner-sidehodet,
Regler-sidens bunnrad).

**Dårlig → godt:**
`<PageHeader context={<ByggVelger .../>} action={<Button size="sm">X</Button>} />`
(32px ved siden av 32px, men 8px lavere enn en Button `md` et annet sted på
samme side) →
`<PageHeader context={<ByggVelger .../>} action={<Button>X</Button>} />`
(ByggVelger er nå selv 40px via sin egen `size="md"`; `Button` sin standard
`md` trenger ingen eksplisitt prop).

---

---

## regel/knapperad-lik-storrelse

**Regel:** To eller flere `<Button>` (eller en komponent som RENDRER én, som
`SendToResidents`/`RegistrerHendelseKnapp`) satt som søsken i samme rad har
ALLTID samme `size`. Standard er `md` (40px). `sm` er riktig når raden ALT er
`sm` (rad/tabell/kort-hjørne — f.eks. `ActionBar` sin etablerte konvensjon,
`DataTable` sin masse-handlingsrad, `ListRow`-trailing). `lg` kun for ÉN stor
primærhandling ALENE (aldri i par).

**Scope:** Enhver rad med ≥2 knapper som søsken — `ActionBar`, `PageHeader`
action-slot, frittstående `<div className="flex gap-…">`-rader i sideinnhold.

**Hvorfor:** Founder 14. sep 2026: «Knappene må ha samme høyde. Det gjelder
ALLE knapper som er satt ved siden av hverandre.» Konkret funn: «Skriv ut /
PDF» (`variant="secondary" size="sm"`) ved siden av `SendToResidents` sin
«Send til beboere»-knapp (`Button` uten `size`, altså `md`) i BÅDE
`ReglerClient.tsx` og `VedtekterClient.tsx` sin `ActionBar` — 8px
høydeforskjell i en rad som IKKE er en frittstående sm-rad andre steder
(ActionBar sin egen showcase/demo og de fleste andre kallesteder bruker `sm`
konsekvent for BEGGE knappene). Tilsvarende i
`BuildingSettingsForm.tsx`: «Tilbake til bygget» (`sm`) ved siden av «Lagre
endringer» (`Button` uten `size`, `md`).

**Retting (14. sep 2026, denne leveransen):**
- `components/SendToResidents.tsx`: knappen fikk `size="sm"` — retter BÅDE
  Regler og Vedtekter i ett grep (delt komponent). Årsmøte bruker samme
  komponent ALENE (ingen nabo-knapp) — `sm` der er fortsatt riktig, bare mer
  kompakt enn før.
- `app/(dashboard)/eiendom/bygginfo/rediger/BuildingSettingsForm.tsx`:
  «Lagre endringer» fikk `size="sm"` (matcher «Tilbake til bygget»).
- `app/design/components/demos/DataTable.tsx`: eksempel-kodestrengen (ikke
  selve rendringen, som allerede brukte `size="sm"`) fikk `size="sm"` lagt
  til for å ikke vise et motstridende eksempel i dokumentasjonen.

**Håndhevelse:** `scripts/designvakt.mjs`, ny teller (#5) — heuristikk,
IKKE en JSX-parser: bokstavelige `<Button`-tagger med samme innrykk, brutt av
en linje med grunnere innrykk (= forlot forelderen). Fanger IKKE opp en
knapp gjemt inni en egen komponent (`SendToResidents` o.l.) — det tilfellet
over ble funnet manuelt, ikke av skriptet. `app/design/` er unntatt HELT:
showcase-sidene viser med vilje flere størrelser side om side for
dokumentasjon (Button-docens «Størrelser»-seksjon), det er ikke en reell rad.

**Unntak:** `app/design/` sine egne størrelse-sammenligningsdemoer (viser
bevisst `sm`+`md` side om side for å DOKUMENTERE forskjellen — det er
poenget med den seksjonen, ikke en feil).

**Kilde:** Founder 14. sep 2026 (skjermbilde av Regler-sidens bunnrad).

**Dårlig → godt:**
`<ActionBar><Button variant="secondary" size="sm">Skriv ut / PDF</Button><SendToResidents .../></ActionBar>`
(sm ved siden av en skjult `md`-standard inni `SendToResidents`) →
samme JSX, men `SendToResidents` sin interne knapp er nå eksplisitt `size="sm"`.

---

## regel/statcard-verdi-sub-maks-en-lenke

**Regel:** Et `StatCard` bærer verdi, ÉN sub-linje og maks ÉN lenke. Advarsler,
forklaringer og forutsetningslinjer som ikke er del av selve tallet hører
hjemme UTENFOR kortet — under raden, som egen `InlineNote`/tekst — ikke som
ekstra innhold (`children`) inni kortet.

**Scope:** Alle `StatCard`-forekomster i en `StatCardRad` (kortene i raden er
bevisst like høye — se `kort-pa-samme-rad-er-like-hoye` — så ett kort med
mye ekstra innhold drar HELE raden opp). Konkret utløst av `components/buildings/FinansieringPerSeksjon.tsx`
sitt «Per seksjon»-kort (`layout="card"`, brukt i 5-kort-raden på `/eiendom`):
verdi + sub + en forutsetningslinje (med `Begrep`) + en gul `Callout`
(manglende seksjoner) + lenken «Endre forutsetninger →», alt inni ÉTT
`StatCard`, mot naboene (Helse-indeks, Akutte, Fremdrift) som bare har
verdi + sub.

**Hvorfor:** «‘Per seksjon’-kortet gjør at alle kortene blir unormalt høye.
Hvordan kan vi komprimere innholdet i den?» — founder, 14. sep 2026. Raden
strekker allerede alle kortene til samme høyde (`items-stretch`); ett kort
med fire innholdselementer tvinger de andre fire til å bli like høye som
det tyngste, selv når de selv bare har to.

**Løsning i dette tilfellet:** sub slås sammen til én linje («per måned per
seksjon · annuitetslån 686 000 kr, 5 %, 20 år»), advarselen om manglende
seksjoner flyttes til en `InlineNote tone="warning"` UNDER raden (full
bredde, vises kun når seksjoner faktisk mangler), og «Endre forutsetninger →»
beholdes som kortets ene lenke (samme mønster som Helse-indeks sin
«Indeks 84 av 100»-lenke).

**Unntak:** Ingen kjent ennå.

**Kilde:** Founder, skjermbilde av StatCard-raden på `/eiendom` (5 KPI-kort:
Estimert total · Helse-indeks · Akutte · Fremdrift · Per seksjon), 14. sep
2026.

---

TVIL / IKKE UTFØRT (forrige agent): dette scratchpad-notatet ble opprinnelig
skrevet av en agent som fikk oppdraget å GJENNOMFØRE endringen i
`components/tasks/BudsjettView.tsx`, men fant at kortet founder beskriver
IKKE finnes der. Selve kode-endringen ble IKKE utført av den agenten, kun
denne regelutledningen.

---

UTFØRT 14. sep 2026 (denne agenten), i `components/buildings/FinansieringPerSeksjon.tsx`
og `app/(dashboard)/eiendom/page.tsx` (KPI-raden), nøyaktig etter regelen over:

1. **Kortet (`layout="card"`, default):** value + ÉN sub-linje (`subTekstKort`)
   + `{modal}` som eneste barn. Sub-linjen slår sammen den gamle `subTekst`
   (per måned per seksjon [· eierbrøk X–Y %]) med lånedetaljene, senket
   (`TYPE_NAVN_LC`, ny konstant) og med komma i stedet for `·` internt:
   «per måned per seksjon · annuitetslån 686 000 kr, 5 %, 20 år». For
   serielån (`faller`) legges « · faller til {sisteTekst} i år {lopetidAr}»
   til som SISTE ledd i samme linje — ingen egen `<p>`. `Begrep` på
   lånetypen er beholdt uendret (kun store/små bokstaver endret).
   `Callout`-importen er fjernet (ubrukt etter dette — advarselen flyttet ut,
   se pkt. 2). Verifisert med ekte data (Sameiet Bryggen Panorama, lanesum
   686 000, annuitet): fikk IKKE testet et serielån med `faller` i praksis
   (ingen slik seksjon i testdataene) — logikken er uendret fra før
   (samme `faller`/`sisteTekst`-beregning), kun flyttet inn i JSX-uttrykket,
   så risikoen vurderes som lav, men IKKE visuelt bekreftet.

2. **Advarselen** (manglende/ulik seksjonsdata) er trukket ut til en ny
   eksportert ren funksjon `finansieringAdvarsel(...)` (samme fil, over
   komponenten) som returnerer `{ tekst, href } | null`. Komponenten kaller
   den selv (både for `card` og `wide`, i stedet for å bygge `advarsler`
   lokalt — DRY, ingen duplisert forretningslogikk). `/eiendom/page.tsx`
   kaller den samme funksjonen uavhengig (samme argumenter som gis til
   `<FinansieringPerSeksjon>`) og rendrer resultatet som `InlineNote
   tone="warning"` RETT UNDER 5-kort-raden, full bredde, kun når advarselen
   ikke er null. Dette var founders foreslåtte «egen liten eksport»-løsning
   (se AGENTS.md-instruksen), valgt fremfor prop/callback fordi komponenten
   ikke trenger å vite noe om hvordan siden bruker resultatet.

3. **«Endre forutsetninger →»** er uendret (samme `ForutsetningerModal
   trigger="link"`, ingen ny styling — den komponenten eies ikke av denne
   leveransen) og er nå kortets ENESTE innhold under sub-linjen, rett under,
   uten Callout/faller-linje imellom — samme posisjonsmønster som
   Helse-indeks sin `sub`-eneste-innhold («Indeks 84 av 100»).

4. **`StatCardRad`** (`components/ui/StatCard.tsx`) støtter KUN 2/3/4
   kolonner (`KOL_CLASS: Record<2|3|4,...>`), ikke 5. Byttet IKKE til
   `StatCardRad` — beholdt det håndrullede `grid grid-cols-2 lg:grid-cols-3
   xl:grid-cols-5 gap-3` i `eiendom/page.tsx`, uendret. `components/ui/**`
   er uansett utenfor denne agentens eierskap.

5. **Målt høyde** (Playwright headless, `/eiendom?bygg=<building med 12
   seksjoner, 2 registrert>`, samme bygg/data før og etter, lys og mørk gir
   identisk px siden fargetema ikke endrer layout):
   - 1280px, alle 5 kort (stretch til høyeste): **298px → 196px**.
   - 375px (2 per rad), raden Fremdrift+Per seksjon (den høyeste paret):
     **362px → 244px**. Radene Estimert total (124, alene) og
     Helse-indeks+Akutte (124) var uendret — de har aldri vært kortets
     problem.
   - Ingen konsollfeil, ingen horisontal scroll, ingen skjelett
     (`.animate-pulse`/`template[id^="B:"]` fraværende) i noen av de 8
     kombinasjonene (2 bredder × 2 tema × før/etter).
   - Metode: siden andre agenter redigerer samme `eiendom/page.tsx`-fil
     parallelt, ble FØR-målingen tatt ved å reversere denne agentens EGNE
     edits presist (Edit med nøyaktig omvendt streng) i stedet for
     `git stash`/`checkout`, nettopp for ikke å rulle tilbake andres
     samtidige, ukommiterte endringer i samme fil.

6. **Verifisert**: `tsc --noEmit --skipLibCheck` (0 feil), `eslint` på begge
   filer (0 feil), `vitest run` (162/162 filer, 2223 av 2224 tester —
   1 skip, uendret), `designvakt.mjs` (6 avvik = samme tak som før, ingen
   nye), `kontrastmaal.mjs` (70/70 OK), `tekstvakt.mjs` (/eiendom: 477 ord,
   under taket på 481 — FEILET-linjen i output gjelder
   `app/(dashboard)/styret/page.tsx`, en annen agents fil, urørt her).
   Vedlikeholdsplan (`wide`-layout, uendret kode) sjekket manuelt i samme
   økt — rendrer identisk som før.

---

## regel/callout-er-melding-aldri-beholder

**Regel:** `Callout` er EN boks for ÉN sammenhengende melding (en setning eller to,
maks én CTA-knapp via `action`). Så snart innholdet er en LISTE av rader — flere
elementer med hver sin tittel/verdi/handling — er `Callout` feil beholder, uansett
hvor treffende tonen (`accent`/`warning`/…) er for situasjonen.

**Scope:** Alle steder som setter et `<ListRow>`- eller radlignende gjentakende
mønster som barn av `<Callout>`. Konkret rettet: `ServiceAgreementsPanel.tsx`,
seksjonen «Regnskapet viser utgifter uten registrert avtale» (nå «Fra regnskapet:
utgifter uten avtale») — bygget om til `Card` + `SectionHeader` + `ListRow`-liste +
`InlineNote`-fotnote.

**Hvorfor:** Founder på skjermbilde av /avtaler/register: spurte hvorfor feltet var
blått og hvorfor avstanden ned mot tabellen var for liten. Begge symptomene kom av
samme rotårsak — en FORSLAGSLISTE ble tvunget inn i en INFORMASJONSMELDING-
beholder. `Callout` sin faste `p-4`/`gap` er kalibrert for løpende tekst, ikke for
en radliste med egen indre rytme (divide-y, per-rad padding) — de to
avstandssystemene kolliderer og gir enten for tett eller for løs avstand uansett
hvilken `gap`-verdi man skrur på utsiden. `Card` + `SectionHeader` gir riktig
avstand fordi radlisten får style fra ListRow selv, ikke fra Callout sin
tekst-innpakning.

**Unntak:** En Callout med ÉN handlingsknapp (`action`) som gjelder HELE meldingen
er fortsatt riktig (se `AgreementForm` sine to regnskapsforslag-Callouts,
`ServiceAgreementsPanel.tsx` linje ~326 og ~342 — begge er én setning + maks én
knapp, ikke en liste, og ble derfor IKKE endret i denne leveransen).

**Kilde:** Founder-melding 14. sep 2026, punkt B, om `ServiceAgreementsPanel.tsx`.

**Dårlig → godt:** `<Callout tone="accent"><ListRow .../></Callout>` → `<Card><SectionHeader
.../><div className="divide-y">...<ListRow/></div><InlineNote>...</InlineNote></Card>`.

---

---

## regel/avkryssbare-chips-samme-form

**Regel:** Et sett med UAVHENGIGE avkrysningsbare chips (en for hver av N valgfrie
kategorier, «registrert»/«ikke registrert», «på»/«av» osv.) deler ALLTID nøyaktig
samme boks — høyde, border-radius, padding, kantbredde — uansett tilstand. Kun
farge (kant/fyll/tekst) og ikon skiller tilstandene fra hverandre.

**Scope:** «Standard avtaler»-raden på `/avtaler/register`
(`app/(dashboard)/avtaler/register/page.tsx`, lokal `AvtaleChip`). Generelt: enhver
fremtidig liste av avkrysningsbare/tilstand-chips i appen (HMS-sjekklister,
onboarding-steg m.m.) — se etter dette mønsteret før noe håndrulles på nytt.

**Hvorfor:** Founder på skjermbilde: de registrerte chipsene var en fylt pille uten
kant (Badge), de uregistrerte en hvit kantet pille i en ANNEN høyde/radius
(Button tertiary sm) — «ser veldig rare ut». To ulike FORMER for to tilstander av
samme valg leser som to ulike KOMPONENTER, ikke som av/på for én ting. En bruker
skal kunne skjønne mønsteret («fylt/farget = ferdig, tom kant = gjenstår») uten å
måtte lære to separate former først.

**Unntak:** Ingen kjent. Er de to tilstandene faktisk ulike HANDLINGER (ikke bare
ulik status på samme handling), er de ikke lenger samme mønster og reglen gjelder
ikke.

**Kilde:** Founder-melding 14. sep 2026, punkt A, skjermbilde av
`/avtaler/register`.

**Dårlig → godt:** `Badge` (fylt, radius-full, h-6, ingen kant) for registrert +
`Button variant="tertiary"` (kant, radius-sm, h-8/min-h-11) for uregistrert → én
lokal `AvtaleChip` som rendrer `<span>`/`<Link>` med samme klassestreng
(`AVTALE_CHIP`) og kun ulik `style`-farge.

---

## regel/callout-handling-til-hoyre

**Regel:** En `Callout` med handling bruker `action`-slotten. Handlingen står til høyre i raden på
desktop, øverst, og under teksten på mobil. Teksten får bredden (maks 65ch), ikke knappen. Aldri
en håndrullet `flex`-rad inne i Callout for å plassere en knapp.

**Kilde:** Founder 14. sep 2026, Fakturaer: «Bruk bredden her, ‘Slå av innboksen’ er malplassert
midt i, bør være helt til høyre, sikkert på toppen.» Tre kallsteder hadde egne flex-hacks.

**Eksempel:** `app/(dashboard)/okonomi/fakturaer/FakturaListe.tsx` (fakturaadressen) og
`components/buildings/ServiceAgreementsPanel.tsx` (beløpsforslag, innhent tilbud) bruker
`action={<Button …/>}`; primitivet legger den til høyre med `sm:ml-auto`.

---

## regel/badge-ikon-via-prop

**Regel:** Ikon i en `Badge` sendes som `icon={Ikon}`, aldri som barn. Barn legges i en
`truncate`-span, og et inline-SVG der havner på tekstlinjens grunnlinje og ser malplassert ut.

**Kilde:** Founder 14. sep 2026, Eiendom-listen: «‘God stand’-pillen: ikonet er malplassert.»
Tre kallsteder (Eiendom ×2, Felleskostnad «Låst») hadde ikonet som barn.

**Eksempel:** `<Badge variant={h.variant} icon={Aktivitet}>{h.label}</Badge>`.

---

## regel/tabellkolonner-aldri-innholdsstyrte

**Regel:** Kolonnebredder i `Table`/`DataTable` er faste (`px`) eller `minmax(px, Nfr)` — aldri
`max-content`, `min-content`, `auto` eller `fit-content`. Hver rad er sitt eget grid med samme
mal, og innholdsstyrte spor måles per rad, så hode og celler skiller lag.

**Kilde:** Founder 14. sep 2026, Seksjoner: «Header-celler og table-celler er ikke alignet.»
Status-kolonnen var `minmax(92px, max-content)`: hodet fikk 92 px, raden med «Mangler e-post»
122 px, og avviket vokste til 45 px mot høyre. `Table` advarer i dev når malen inneholder et
innholdsstyrt spor.

**Eksempel:** `components/buildings/UnitsPanel.tsx` — Status er `128px`.

**Tillegg 18. sep 2026 — det som stikker ut av tabellen:** en `sr-only`-overskrift (skjult
kolonnenavn for skjermlesere) er absolutt-posisjonert og slapp ut av Table sin rullebeholder fordi
beholderen ikke var posisjonert — 19 px body-sidescroll på /seksjoner ved 375 px, uten at noen
kolonne var for bred. Rullebeholderen er nå `relative`, så alt absolutt inne i en tabell klippes
med den. Sjekk for sidescroll måler `document.documentElement.scrollWidth`, ikke tabellen.

---

## regel/tidsfilter-to-typer

**Regel:** Lister med datoer får ett av to tidsfiltre, aldri begge og aldri et håndrullet:
- **Historikk og logger** (hva skjedde): `PeriodeVelger` i Toolbar — «I år», hvert år med data, «Siden
  start» som standard. Bank, Bygghistorikk, Aktivitet, Arkiv, Styremøter, Forsikringssaker,
  Felleskostnad (innbetalinger), Kommunikasjonslogg.
- **Arbeidslister** (hva forfaller): fristfaner som `PillTabs` med levende tellere — «Forfalt»,
  «Denne måneden», «Neste 3 måneder», «I år», «Alle», kumulative. Styreplikter, Å gjøre,
  Vedlikeholdsplan (planlagt år), Befaringer (kommende/gjennomførte), Mottatte tilbud.
Fakturaer er begge deler: fristfaner for status (Forfalt/Ubetalt/Betalt) og periode for oppslag.

**Kilde:** Founder 14. sep 2026: «Styreplikter, burde vi ikke ha filter her også på periode/tid som
på transaksjoner og bygghistorikk? Er det flere plasser i systemet vi trenger dette?» Inventar
samme dag: 14 lister med datofelt, 2 med tidsfilter.

**Eksempel:** `lib/plikter/frist.ts` (`FRIST_FANER`) på Styreplikter; `PeriodeVelger` på Bank.

**Utfall av utrullingen (samme ettermiddag, 14. sep 2026)** — og en tredje type:
- **Planlagt år** (hva er lagt til hvilket år, kan ligge FREM i tid): år-faner som `PillTabs` —
  «I år» (alt til og med inneværende år), hvert fremtidig år med rader, «Alle». `PeriodeVelger` er
  bygget for fortid (låser «Neste år» ved i år) og passer ikke; fristfanene dekker bare måneder
  innenfor året. Hjelper: `lib/tiltak/planlagtAar.ts`. Brukt på Vedlikeholdsplan, i SAMME Toolbar
  som søk og Legg til — ikke i en egen rad inne i listen (`regel/verktoylinje-en-hoyde`).
- Mottatte tilbud fikk `PeriodeVelger`, ikke fristfaner: `quote_requests` har bare mottatt/sendt-
  dato, ingen gyldighetsfrist — er datoen bakover, er listen historikk uansett hva den heter.
- Befaringer: «Kommende / Gjennomførte / Alle» — to faner er nok når skillet er i dag.
- Felleskostnad (innbetalinger) beholdt månedsstepperen: den er en arbeidsflate for ÉN periode
  om gangen (registrering), ikke et oppslag — «Siden start» gir ikke mening der.
- Rader uten dato vises kun under «Alle» (Å gjøre, Vedlikeholdsplan) — en rad uten frist er
  ikke «i år», den er udatert.
- Arkivets fane-tall (Dokumenter/Rapportgrunnlag) følger perioden (founder «gjennomfør», samme
  kveld): perioden ligger i URL-en (`?aar=2024&maaned=3`, som `?fane=`), serveren filtrerer begge
  listene FØR tellingen, og `aarListe` regnes på hele settet så år-chipsene aldri forsvinner.
  Regel som følger av det: når et fanetall regnes på serveren, må filteret som skal påvirke det
  også bo i URL-en — et klientside-filter kan aldri nå et servertall. Hjelper: `lib/arkiv/periode.ts`.

---

## regel/utskrifter-bygges-av-dokument

**Regel:** Alle utskrifter og PDF-er (vedtekter, husordensregler, eierregister, faktura,
purring, brev, byggrapport, generalforsamling, meglerpakke, skattegrunnlag) bygges av
`Dokument`-primitivene i `components/ui/Dokument.tsx` — `Dokument`, `DokumentHode`,
`DokumentSeksjon` (med `sideskiftFoer`), `DokumentNokkelverdi`, `DokumentTabell` (`Table variant="print"`),
`DokumentMerknad` (`default`/`viktig`/`advarsel`), `DokumentMottaker`, `DokumentEtikett` (prioritets-
pille i print-farger), `DokumentSignatur`, `DokumentFot` — på `--print-*`-tokenene og `.type-*`-klassene. Aldri et
håndrullet ark, hode eller tabell med egne stiler, og aldri en egen font-stack.

**Kilde:** Founder 14. sep 2026: «PDF-ene som blir generert i hele appen, burde vi ikke bruke
designsystemet til styling av disse?» Elleve utskriftssider brukte tokenene, men håndrullet
layouten hver for seg, og delte bare `PrintBar`.

**Eksempel:** `/design/components/dokument` («Faktura i miniatyr», «Vedtekter i miniatyr»,
«Brev i miniatyr»). Migreringslisten står i primitivets toppkommentar; Meglerpakke migreres først.

**Status etter første migreringsbølge (14. sep 2026, samme ettermiddag):** 7 av 11 sider er
migrert — meglerpakke (innlogget og delt lenke, samme `modus="print"`-rendering), vedtekter/
husordensregler, eierregister, faktura, purring og oppfølgingsbrev. Migreringen fant tre hull i
primitivet og tettet dem: `DokumentMerknad` (KID/betalingsboks), `DokumentMottaker` (brevets
adresseblokk) og `sideskiftEtter` (ett `Dokument` per seksjon i løkke, erstatter
`.faktura:last-child`-trikset). To feil funnet underveis: arket manglet `doc-sheet`-klassen som
gir redusert padding på telefon (der e-postlenker faktisk åpnes), og `DokumentTabell` uten
`minBredde` overlappet på 375 px. Samme kveld ble de siste fire migrert — byggrapport,
generalforsamling (én delt `GeneralforsamlingDokument` for innlogget side og delt lenke) og
skattegrunnlag (liggende `@page` beholdt lokalt) — så alle elleve bygger på primitivene, og
`lib/printStyles.ts` er uten kallere. **Løst samme kveld:**
markdown-innholdet i vedtekter kom fra `lib/markdownToHtml.ts` med inline-stiler delt med
e-post — `.type-*` kan ikke vinne over inline `style`. Oversetteren har nå to modus:
`'epost'` (standard, byte for byte som før, frosset i test) og `'utskrift'` (semantisk HTML uten
`style`, stilet av `.dokument-prosa` i globals.css som speiler `.type-heading-20/16/14` og
`.type-copy-14` på `--print-*`-tokenene). Regel: prosa fra markdown i en utskrift rendres alltid
med `modus: 'utskrift'` inne i `.dokument-prosa` — aldri e-postvarianten på papir.

**Tillegg samme kveld — skallet må også kunne skrives ut.** Byggrapport og generalforsamling
ligger UNDER dashbord-skallet (`app/(dashboard)/layout.tsx`: `h-[100dvh]` + `overflow-hidden` med
rullende `<main>`). Da printStyles' `#print-mount`-triks forsvant med migreringen, ga «Lagre som
PDF» én side — alt under bretten ble klippet. Løst globalt i `@media print` i globals.css:
skallet (`data-app-shell`) blir et flytende dokument, alt utenom `main` i innholdskolonnen
(`data-app-innhold`) skjules. Målt: generalforsamling 1 → 4 sider. Regel: en utskriftsside
løser ALDRI skallet lokalt (portaler, `display:none` på `body > *`) — skallet eier sin egen
utskriftsoppførsel, og det gjelder alle ruter under `(dashboard)/`.


---

## regel/gruppeoverskrift-naermest-innholdet

**Kilde:** Founder 14. sep 2026, /system/endringslogg: «Mangler padding under tittel, f.eks.
"14. september".»

**Funn:** Dagsoverskriftene i den rå loggen sto med 12 px til sitt eget kort og 24 px til kortet
over — med linjeboksen rundt 16 px-tekst ble det visuelt 16 mot 28. Overskriften så ut som en
fotnote til forrige gruppe, ikke som tittel på sin egen.

**Regel:** En overskrift over en gruppe (dato, kategori, bygg) står alltid NÆRMEST det den
er overskrift for: 16 px under (`SectionHeader` med `mb-4`, som alle andre seksjonshoder),
minst 32 px til forrige gruppe (`space-y-8` mellom gruppene). Bruk `SectionHeader` — ikke en
løs `<h2 className="type-heading-16">` — så vekt, farge og avstand er de samme som i resten
av appen. Nærhet er hierarki: det som hører sammen står tettest.

**Eksempel:** `app/system/endringslogg/EndringsloggClient.tsx` (fanen «Alt»).

---

## regel/nedtrekk-i-verktoylinje-fast-bredde

**Kilde:** Founder 14. sep 2026, /system/leverandorer: «Filterbar bryter over 2 linjer. Må være
1. Hva betyr +2?»

**Funn:** Et `<select>` er så bredt som sitt LENGSTE valg. Bransjefilteret inneholdt «Kabelbasert,
satellittbasert og trådløs telekommunikasjon» og ble 600 px; kundefilteret 470 px. `Toolbar`
sin `end`-gruppe er `shrink-0`, så nedtrekkene tok linjen, statusfanene (`PillTabs`) fikk
restplassen og kollapset to av tre faner til «+2», og sorteringen brøt til rad to. «+2» er
PillTabs sin overflytsmeny: antall faner som ikke fikk plass — en riktig mekanisme for smale
skjermer, men her utløst av et innholdsstyrt nedtrekk på en bred.

**Regel:** Et nedtrekk (`Select`/`Dropdown`) i en verktøylinje har FAST bredde (`w-40`–`w-56`
etter hva etiketten trenger), aldri innholdsstyrt. Lange valg klippes av nettleseren med
ellipse inne i feltet. Samme prinsipp som `regel/tabellkolonner-aldri-innholdsstyrte`: bredden
bestemmes av designet, ikke av det lengste datapunktet som tilfeldigvis finnes. Ser du «+N» på
PillTabs på en bred skjerm, er det et symptom — let etter det som stjeler plassen, ikke skjul
fanene.

**Rettet i:** `components/system/DataListe.tsx` (sortering `w-40`),
`app/system/leverandorer/LeverandorerPanel.tsx` (`w-40`, og sorteringsnedtrekket fjernet — kunde/
bransje-sortering var dekket av de to filtrene, og seks kontroller fikk ikke plass på 960 px) og
`app/system/kunder/KunderPanel.tsx` (`w-44`). Grensen som gjelder: søk (min 180) + faner + nedtrekk
skal summere til under sidens innholdsbredde (960 px på `wide`) — får de ikke det, er det én
kontroll for mye, ikke en for smal skjerm.

---

## regel/en-pillerad-per-verktoylinje

**Kilde:** Founder 14. sep 2026, Å gjøre: «Filtrere på frister her burde være en dropdown, tror du
ikke?» Skjermbildet viste to pillerader side om side i samme verktøylinje: fristfanene (fem
piller med tellere) og kildefilteret (Alle · Felleskostnad, uten tellere) — sju piller på rad, to
«Alle».

**Regel:** Én verktøylinje har maks ÉN pillerad. Pillene er for filteret som bærer TELLERE og
som brukeren leser som en oppsummering av listen (frist, status, retning). Alle andre dimensjoner
(kilde, kunde, bransje, bygg, kategori) er nedtrekk med fast bredde i `end`-slotten
(`regel/nedtrekk-i-verktoylinje-fast-bredde`). Grunnen til at fristene beholdt pillene og ikke ble
nedtrekket founder foreslo: tellerne «Forfalt (2) · Neste 3 måneder (3)» ER arbeidslistens
sammendrag, og Styreplikter har nøyaktig samme rad — to arbeidslister skal ikke filtrere ulikt.
Vil man ha ett nedtrekk for tid, gjelder det begge sidene samtidig.

**Rettet i:** `components/gjoremal/GjoremalListe.tsx` (kilde → `Select` «Alle kilder», `w-44`).

---

## regel/laan-vises-som-kostnad-per-aar

**Kilde:** Brukertest 14. sep 2026 (regneark, rad 19, Vedlikeholdsplan): «Hva betyr den
"annuitetslån 3 401 500 × 8 % / 25 år"? Er det totalen vi skal betale tilbake? I så fall er ikke
den så viktig — jeg tror det er viktigere å vise hva man betaler i året.»

**Funn:** Lånekortet ledet med parametrene (lånesum, rente, løpetid). Styret leste lånesummen som
totalkostnad. Det de skal ta stilling til er belastningen: hva det koster per år og per seksjon.

**Regel:** Et lån eller en finansiering vises alltid med KOSTNADEN først — «Kostnad per år: X kr»
(renter og avdrag, første år) og per seksjon per måned — og parametrene (lånetype, sum, rente,
løpetid) som sekundær linje i tertiærfarge under. Totalsummen over løpetiden er undertekst, aldri
tittel. Samme rekkefølge i det kompakte kortet og på Vedlikeholdsfinansiering-siden; tallene kommer
fra `lib/finansiering.ts` (`perMndForste × 12`, `totalKostnad`), aldri regnet lokalt.

**Rettet i:** `components/buildings/FinansieringPerSeksjon.tsx` (kortet på Vedlikeholdsplan og
Eiendom), `components/tasks/BudsjettView.tsx` (Vedlikeholdsfinansiering: «Kostnad per år» som
resultatblokk over forutsetningene).

---

## regel/sidepanel-gjore-med-kontekst

**Regel:** `SidePanel` (`components/ui/SidePanel.tsx`) brukes for gjøremål der
LISTEN/SIDEN BAK skal forbli synlig og relevant mens du handler — et gjøremål
åpnet fra en liste, en rad du vil se detaljer om og handle på uten å miste
resten av listen av syne. `Modal` brukes fortsatt for gjøre UTEN kontekst
(skjema, valg, bekreftelse/sletting — se `regel/modal-gjore-accordion-lese`
for skillet mot CollapsibleSection/accordion). `Popover` er fortsatt for
små, ankrede valg (meny, dropdown, kort hjelpetekst), ikke et helt gjøremål
med kropp og handlingsrad.

Tommelfingerregel i tre: **SidePanel** = gjøre MED kontekst. **Modal** = gjøre
UTEN kontekst. **Popover** = små valg ankret mot en trigger.

**Scope:** Alle nye «åpne et gjøremål/en detalj fra en liste»-flyter. Gjelder
foreløpig IKKE eksisterende sider — denne leveransen tar ikke component i
bruk noe sted (se oppdragsbeskrivelsen: primitivet er bygget og dokumentert,
ingen sider migrert).

**Hvorfor:** Brukertest 14. sep 2026, rad 4 («Å gjøre»), founder-sitat
ordrett: «Når man trykker på en oppgave, åpne den som popover eller sidebar
slide-in på DENNE siden, ikke send deg videre til andre undersider dersom
ikke nødvendig.» Founder godkjente planen (`arkiv/rapporter/
BRUKERTEST-PLAN-2026-09-18.md`, G1/bølge 1) 18. sep 2026. Verken `Modal`
(dekker midt på skjermen, skjuler listen bak et scrim man ikke ser forbi)
eller `Popover` (ankret, ment for små valg — ikke en hel kropp med
handlingsrad) lot brukeren beholde listen synlig ved siden av det man
akkurat åpnet.

**Unntak:** Ingen navngitt ennå — for tidlig, ingen kallsteder migrert.

**Kilde:** Brukertest 14. sep 2026 (rad 4, «Å gjøre»), founder-godkjenning
18. sep 2026, implementert i `components/ui/SidePanel.tsx` samme dag.

**Dårlig → godt:** Et gjøremål som åpner en `Modal` midt på skjermen (listen
forsvinner bak scrimen) → samme gjøremål åpnet i `SidePanel` til høyre, listen
fortsatt synlig og uendret bak.

**Innfletting (hovedagent, 18. sep):** SidePanel er et ankerløst fullskjerms-overlegg som Modal og
ConfirmDialog, og faller derfor under unntaket i `regel/flytende-lag-rendres-i-portal` (ingen
portal nødvendig). Scrim-klikk og Escape går via den delte `useKlikkUtenfor` med bare panelets ref
— et tredje, gyldig mønster ved siden av Modal/BottomNav sin lokale løsning, fordi hooken måler på
`pointerdown` og derfor ikke har «dra-marker-slipp utenfor»-fellen Modal måtte kode rundt.


---

## regel/styret-er-alltid-ansvarlig

**Kilde:** Brukertest 14. sep 2026 (regneark, rad 38, Styreplikter): «Noen steder står det at
vaktmester er ansvarlig. Styret er alltid ansvarlig — de kan delegere det til en vaktmester, men de
er alltid ansvarlig. Så ikke skriv andre enn styret.»

**Funn:** Standardpliktene ble seedet med «Vaktmester / styret», «Vaktmester», «Styret / heisfirma»
og «Styret / den enkelte utleier» som ansvarlig. Juridisk er det feil (styret bærer ansvaret etter
eierseksjonsloven og internkontrollforskriften), og for styret leses det som at noen andre har
jobben.

**Regel:** Feltet «ansvarlig» på en plikt, kontroll eller oppgave viser aldri andre enn styret.
Er oppgaven typisk delegert, står det i beskrivelsen som «Kan delegeres til vaktmester» — ansvar
og utførelse er to forskjellige ting, og bare det siste kan flyttes. Gjelder seed-data
(`app/api/buildings/[id]/duties/route.ts`), migrasjoner og all kopi.

**Rettet i:** `supabase/migrations/20260921_plikter_styret_ansvarlig.sql` (eksisterende rader),
`defaultDuties()` i duties-ruten (nye bygg).

---

## regel/redigeringsmodus-er-eksplisitt

**Kilde:** Brukertest 14. sep 2026 (regneark, rader 35–36, Husordensregler og Vedtekter): «Ikke helt
intuitivt når man lagrer / hvordan man går tilbake til hovedsiden.»

**Funn:** Lesevisning og redigering delte sidetopp og tittel; lagring ble kvittert med en liten
tekst i sidehodet som ble oversett, og det var uklart hvordan man kom «tilbake».

**Regel:** En side som kan redigeres har to tydelige tilstander. Lesevisning: tittelen er
dokumentets navn, én primærhandling «Rediger». Redigering: tittelen sier «Rediger <navn>»,
«Lagre» (primær) og «Avbryt» (sekundær) står SAMMEN i sidehodet og ingen andre steder, «Avbryt»
går til lesevisningen uten å lagre, og lagring kvitteres med Toast «Lagret» og går til
lesevisningen. Tilstanden og lagringen deles i én hook når flere sider har samme livssyklus
(`components/useRedigerbartDokument.ts`), så de aldri sklir fra hverandre.

**Rettet i:** `app/(dashboard)/regler/ReglerClient.tsx`, `app/(dashboard)/vedtekter/VedtekterClient.tsx`.

---

## regel/a-gjore-er-ryggraden

**Kilde:** Brukertest 14. sep 2026 (regneark, rader 4–5): «Når man trykker på en oppgave, åpne
den som popover eller sidebar slide-in på DENNE siden, ikke send deg videre til andre undersider
dersom ikke nødvendig.» Og om Årshjul: «Kan ta bort denne og heller ha at alt som ble generert inn
her blir generert inn i Å gjøre-listen.» Founder godkjente 18. sep.

**Regel:** Alt som krever en handling fra styret havner på Å gjøre, og handlingen skjer DER: raden
åpner et `SidePanel` med kontekst (kilde, bygg, frist, detaljer) og «Merk utført» når kilden har
en trygg én-kalls-API, ellers «Åpne kilden». Ingen annen side er en parallell arbeidskø — en
visning som bare viser de samme gjøremålene på en annen måte (Årshjul) legges ned, og
dyplenkene dens sendes til kilden. Nye kilder kobles på `lib/gjoremal` (hent) og får sin
handling i `components/gjoremal/handling.ts`; Dashboard peker inn med `/gjoremal?apne=<id>`.

**Eksempel:** `components/gjoremal/GjoremalListe.tsx`; redirects for `/arshjul` i `next.config.ts`.

---

## regel/nedleggelse-sjekker-redirect-sloyfer

**Kilde:** Bølge 2, 18. sep 2026: da `/eiendom` ble en redirect til `/eiendom/vedlikehold`, hadde
Vedlikeholdsplan selv `redirect('/eiendom')` som tomtilstand (org uten bygg) — en uendelig sløyfe
for enhver org uten bygg, og for alle sidene som falt tilbake til `/eiendom` ved manglende tilgang.

**Regel:** Når en side legges ned og får redirect, grep FØRST etter alle `redirect('/<sti>')`,
`router.push('/<sti>')` og `href="/<sti>"` i `app/`, `components/` og `lib/` — også
tilbakefall og tomtilstander — og pek dem til den nye kilden (eller `/buildings/new` når
tomtilstanden er «ingen bygg»). En sløyfe synes ikke i tsc eller tester, bare i nettleseren for
den ene brukeren uten data. Sjekk deretter at ingen fane/undermeny peker på den nedlagte siden
(`AvtalerNav` hadde en «Oversikt»-fane som ville pekt på seg selv).

**Eksempel:** `app/(dashboard)/eiendom/vedlikehold/page.tsx` (tomtilstand → `/buildings/new`),
`components/AvtalerNav.tsx`.

---

## regel/styret-er-en-side-to-faner` når det er godkjent, og fjern
(eller marker som ERSTATTET, med dato og lenke hit) den gamle regelen
`styret-viser-verv-team-viser-tilgang`.

---

## regel/primitiv-importerer-bare-lib-og-ui

**Kilde:** Bundlevakt rød 18. sep 2026 på skissen av «Bygget»: docs-bundelen vokste 460 → 549 kB
fordi `components/ui/BygningsdelKort.tsx` importerte `tgVariant` fra
`components/tasks/TaskColumnsView.tsx` — og dermed hele kolonnevisningen (modal, API-klient,
toast) inn i alt som brukte primitivet, inkludert docs-siden.

**Regel:** En primitiv i `components/ui/` importerer bare fra `lib/` (rene funksjoner, typer) og
andre `components/ui/`-primitiver. Aldri fra `components/<domene>/`, `app/` eller noe som drar
inn nettverkskall eller sidespesifikk logikk. Trenger primitivet en liten hjelper som bor i en
domenekomponent (som `tgVariant`), flyttes hjelperen til `lib/` først. Bundlevakten fanger det
etterpå; regelen fanger det før.

**Rettet i:** `lib/tilstandsgrad.ts` (ny), `components/tasks/TaskColumnsView.tsx`,
`components/tasks/TaskDetailModal.tsx`, `components/ui/BygningsdelKort.tsx`.

---

## regel/mobilsveip-foer-promotering

**Kilde:** Founder 19. sep 2026, etter at brukertest-bølgene 0–7 var promotert: «Har du koblet
deg til på mobil og gjort alt og sett over der også?» Svaret var nei: hver agent hadde målt 375 px
på SIN flate (Bygget, Årsmøte-knappen, Seksjoner-tabellen), ingen hadde gått gjennom alle sidene.

**Funn:** Ett sveip over 21 innloggede ruter på 375 × 812 fant tre feil ingen enkeltflate-måling
kunne fange, fordi de satt i delte lag: (1) `ActionBar` («Fortsett der du slapp», «Skriv ut / PDF»)
fløt 136 px over BottomNav og over innholdet, fordi Chromium måler `position: sticky` mot
rulle-beholderens INNHOLDSBOKS, og `main` hadde `padding-bottom: 136px`. (2) `Toolbar` med en
Select i `end` klemte pillene til 88 px, så «+4»-brikken lå oppå den ene synlige pillen. (3)
Dokumenter hadde to søkefelt under hverandre (sidens søk + fanens filter).

**Regel:** Før en bølge promoteres, kjøres `node scripts/mobilsveip.mjs` mot dev-serveren, og
funnene rettes i primitivet de sitter i — ikke på siden som viste dem. Sveipet måler DOM (sidescroll,
elementer utenfor 375 px, klippet nowrap-tekst, h1-høyde, ActionBar mot BottomNav, Toolbar-bredde,
skjelett igjen), ikke skjermbilder; skjermbilder brukes til å se det målingen peker på. Per-flate
375-sjekk i hver agentleveranse består, men erstatter ikke sveipet. Tre tekniske følgeregler:
padding hører på en indre wrapper, aldri på rulle-beholderen `main` (sticky-avstander skal være
motoruavhengige); en verktøylinjes barn har minstemål 16 rem så `end` bryter ned i stedet for å
klemme; én søkeboks per side.

**Rettet i:** `app/(dashboard)/layout.tsx` (padding til wrapper), `components/ui/Toolbar.tsx`
(min-w-[16rem]), `components/buildings/DocumentsPanel.tsx` (indre søk fjernet),
`scripts/mobilsveip.mjs` (ny, `npm run vakt:mobil`).

**Tillegg 19. sep kveld (founder: «Ekte gjennomgang»):** sidesveipet er ikke nok. Komponentene
gjennomgås på komponentnivå (`--modus docs`, alle /design-sidene) i BÅDE Chromium og WebKit
(`--motor webkit`, Safaris motor), og lagene i appen (Modal, SidePanel, OverflowMenu, PillTabs-arket,
MultiSelect, Tabs- og Table-hint, bekreftelser) åpnes og måles. Trykkflater under 40 px telles; målet
er 44 på mobil. Gjennomgangen 19. sep fant én ekte feil (OverflowMenu i klikkbar rad utløste radens
klikk) og fire klasser små trykkflater, alle rettet i primitivene; rapport i
`arkiv/rapporter/MOBILSVEIP-KOMPONENTER-2026-09-19.md`.

---

## regel/bunnraden-speiler-sidekartet

**Kilde:** Founder 19. sep 2026: «Pass på at mobilmenyen også stemmer, med de viktigste tingene
som synlig og resten bak "mer".»

**Funn:** Bunnraden hadde sin egen liste. Etter sidekart v2 og brukertest-bølgene manglet
«Styret og møter» (som gruppe) og Kommunikasjon i «Mer», «Å gjøre» — ryggraden — lå bak «Mer»
mens «Møter» hadde fast plass, og tre av målene («/eiendom», «/avtaler», «/rapportering») var
ruter som redirecter.

**Regel:** Bunnraden har fire faste plasser — Hjem, Å gjøre, Eiendom, Økonomi — og «Mer».
«Mer» bygges av sidemenyens liste (`NAV_ITEMS` i SidebarNav), i samme rekkefølge, minus de fire;
det finnes ingen egen liste å glemme. Målene er gruppens landingsside, samme href som sidemenyen,
aldri en rute som redirecter (regel/nedleggelse-sjekker-redirect-sloyfer). Hvilke fire som er faste
er en founder-beslutning; bytter den, byttes bare `FASTE` i BottomNav.

**Rettet i:** `app/(dashboard)/BottomNav.tsx` (bygger «Mer» av `SidebarNav.NAV_ITEMS`),
`app/(dashboard)/SidebarNav.tsx` (lista eksportert).

---

## regel/server-trygg-primitiv-uten-hooks

**Kilde:** CI rød 19. sep 2026 på dyplenke-leveransen: `Table` fikk `useRef` for å rulle en markert
rad inn i syne. tsc, eslint og alle vaktene var grønne lokalt; `next build` stoppet med «You're
importing a module that depends on useRef into a React Server Component module».

**Funn:** Utskriftssidene (Dokument-familien, `DokumentTabell`) rendrer `Table` fra Server
Components med `celle`-funksjoner som props. Funksjoner kan ikke krysse en klientgrense, så
`'use client'` på Table var heller ikke en utvei. Ingen lokal vakt skiller server fra klient.

**Regel:** En primitiv i `components/ui/` uten `'use client'` bruker ingen React-hooks. Trenger
den én effekt (rull inn i syne, fokus, måling), legges effekten i en liten klientøy som rendres
inni primitivet (`RullInnISyne` er mønsteret: `hidden`-span som virker på forelderen), så
primitivet forblir server-trygt og kan ta funksjons-props fra Server Components.
`scripts/rscvakt.mjs` (`npm run vakt:rsc`) håndhever det lokalt og i CI.

**Rettet i:** `components/ui/Table.tsx`, `components/ui/RullInnISyne.tsx` (ny), `scripts/rscvakt.mjs` (ny).

---

## regel/trykkflate-uten-layoutendring

**Kilde:** Mobilgjennomgangen 19. sep 2026 (founder: «Det som står igjen: fiks det») — 291 chips på
docs-sidene, fjern-kryss på 11 px, sorteringsknapper på 16 px, inline termlenker på 20 px, tøm-knapper
på 13 px.

**Regel:** Alt interaktivt har trykkflate på minst 40 × 40 px på mobil (44 der det er naturlig), målt
som elementets rektangel. Tre måter, i denne rekkefølgen: (1) standalone handlingslenker er
`Button variant="link"` (arver knappehøydene); (2) elementer inne i løpende tekst eller tette rader
(Begrep, Markdown-lenker, fjern-kryss, tøm-knapper, avkrysning, Switch) får trykkflaten via padding
pluss like stor negativ margin (`py-3 -my-3 px-1 -mx-1`), så layouten og linjeflyten er uendret;
(3) felt med `size="sm"` er 40 på mobil og 32 fra 640 px (`min-h-10 sm:min-h-8`). Aldri gjør selve
ikonet større for å nå målet. `npm run vakt:mobil -- --modus docs` teller alt under 40 px.

**Rettet i:** `Button`, `Begrep`, `Markdown`, `SearchInput`, `BrregSearch`, `Checkbox`, `Switch`,
`MultiSelect`, `ReasoningTrace`, `Input`/`Select`, `ComponentDocPage`, `Table`/`DataTable`,
`OverflowMenu`, `BygningsdelKort`, `StatCard`.

