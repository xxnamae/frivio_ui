# Coverage gaps — «ingen standard ennå»

Ting designsystemet bevisst IKKE har bestemt et svar på. Dette er ikke det
samme som teknisk gjeld (kjente, uløste feil) og ikke det samme som en
`regel/*` med et navngitt unntak (der finnes et svar, bare med en avgrensning).
Et gap her betyr: spør founder før du gjør noe her, eller løs det lokalt og
navngi det tydelig som en avgrensning i toppkommentaren, i stedet for å anta
at et mønster fra en annen del av appen overføres.

Én linje per gap: hva, hvorfor det står åpent, hva som ville avgjort det.

| Gap | Hvorfor åpent | Hva ville avgjort det |
|---|---|---|
| **Datavisualisering** (grafer, sparklines, trendlinjer) | Appen har `LoadBar` (mengde i forhold til andre rader) og `StatCard`/`InlineNote`, men ingen linje-/stolpediagram-primitiv — alle tallpresentasjoner så langt har løst seg med tabell eller enkelttall. | Et konkret behov for å vise en TREND over tid (f.eks. felleskostnad-utvikling flere år) som en tabell ikke kommuniserer godt — da må formvalg (linje vs. stolpe), aksestil og fargebruk (kun grå + én aksent, jf. `regel/farger-via-tokens`) besluttes samlet, ikke ad-hoc på første kallested. |
| **Radio-knapper** | Finnes fra 2026-09-10 (`Radio`/`RadioGroup`), men KUN for lange lister med beskrivelse per valg — 2–4 valg er fortsatt `PillTabs`/`Select`, se unntaket i `regel/velg-en-av-fa-ingen-radio`. |
| **PDF-typografi utenfor GF/protokoll** | `printDokumentCss()` (`lib/printStyles`) dekker generalforsamlings- og protokolldokumenter samlet. Vedlikeholdsplanens print-side (`buildings/[id]/print`) har sitt eget `.print-root`-prefikserte sett, bevisst IKKE konsolidert i samme opprydding (2026-09-01). Fakturaer/purringer bruker `--print-*`-tokens direkte uten en delt typografifunksjon. | En tredje print-flate som trenger SAMME struktur som GF/protokoll — da avgjør om det er verdt å utvide `printDokumentCss()` sitt scope, eller om vedlikeholdsplanens egne sett skal trekkes inn først (det er det eldste og mest brukte). |
| **E-post-layout utover Markdown-subsettet** | `markdownToHtml()` dekker `##`, `**fet**`, `*kursiv*`, `` `kode` ``, lenker, lister, sitat, `---`, tabeller — det subsettet editoren (`RichTextEditor`) faktisk kan produsere. Rikere e-post-layout (kolonner, bilder inline, knapper med bakgrunnsfarge) er ikke forsøkt, fordi e-postklienter har inkonsekvent CSS-støtte og feilslag der er usynlige for avsender. | Et konkret behov for et element Markdown ikke uttrykker (f.eks. en tydelig CTA-knapp i en påminnelse) — da må det legges til i BEGGE implementasjonene samtidig (skjerm + e-post), se advarselen i `public/design.md` om at subsettet allerede har driftet én gang. |
| **Onboarding-sjekkliste utover `GettingStartedChecklist`** | Én sjekkliste finnes (dashboard, fire grupper, se AGENTS.md-historikken 2026-08-18). Ingen generell «sjekkliste»-primitiv er trukket ut av den — den er fortsatt spesifikk for onboarding. | Et andre bruksområde for samme mønster (steg + fremdrift + gruppering) et annet sted enn onboarding — da er det tid for å vurdere om `StepIndicator`/`Progress` dekker det, eller om en tredje primitiv trengs. |
| **Tastatursnarveier utover ⌘K** | Kommandopaletten (⌘K) er det eneste globale tastatursnarveimønsteret. Enkeltsider har ingen dokumenterte side-lokale snarveier. | Et konkret ønske om en side-lokal snarvei (f.eks. `n` for «ny sak») — da må kollisjon med ⌘K og skjermleser-fokus vurderes FØR den bygges, ikke etterpå. |
| **«Avansert modus»** | Produktet har ingen nybegynner/avansert-bryter noe sted — «rett og rolig»-prinsippet (`regel/rett-og-rolig`) har så langt betydd ÉN flate for alle, ikke to detaljnivåer. | Et konkret ønske fra en maktbruker (regnskapsfører, forretningsfører) om mer tetthet/flere felt enn styremedlemmet trenger — da må det avgjøres om svaret er en rolle-gate (annerledes for regnskapsfører-rollen) eller en eksplisitt modus-bryter, som er to helt ulike arkitekturer. |
| **InlineEdit for Kari-tekstrettelser** (før/etter-diff av en AI-foreslått tekstendring, med «Rett»/«Avvis») | Spectrum-lab-en 2026-09-12 (punkt 6) viste at mønsteret er FEIL verktøy for manuell inntasting (et rename-felt løses fortsatt av `Input` + `SaveIndicator`), men interessant for en annen oppgave: Kari foreslår en rettelse i en beskrivelse/tiltakstekst og brukeren godtar diffen. Kari foreslår ikke tekst i dag, så ingen kallsted finnes å bygge mot. | At Kari får en handling som FORESLÅR tekst (ikke bare svarer) — da revurderes om det trengs en egen før/etter-primitiv i `components/ui/`, eller om `Callout` + to knapper dekker det. Ikke bygg den før kallstedet finnes. |
| **Tomme søk** (søk uten treff) | `SearchInput`/`Autocomplete` har ingen dokumentert standard for «0 treff»-tilstanden utover det generelle `EmptyState`-mønsteret (`regel/tomtilstander-laerer`). Ingen egen «prøv et annet søkeord»-komponent er bygget. | Et konkret tilfelle der det generelle `EmptyState`-mønsteret viser seg utilstrekkelig for et søkefelt spesifikt (f.eks. forslag om nærmeste treff, «mente du…») — i dag løses det ad-hoc per kallested. |

## Ikke et gap, men ofte forvekslet med ett

- **Popover vs. `NotificationBell`:** IKKE et åpent spørsmål — `NotificationBell`
  er et bevisst, dokumentert unntak fra Popover-migreringen (se
  `skill/frivio-ui/exemplars/notificationbell-ikke-popover.md`), ikke et
  ikke-avgjort mønster.
- **BrregSearch vs. `Autocomplete`:** IKKE et åpent spørsmål på samme måte —
  begge finnes med vilje, se
  `skill/frivio-ui/exemplars/supplierlist-ikke-brregsearch.md`.
- **Angre-mønster:** IKKE lenger et gap — `Toast` (`components/ui/Toast.tsx`)
  og `regel/angre-etter-framfor-bekreft-for` (`references/produktskjonn.md`)
  avgjorde det 2026-09-07. Nevnt her fordi denne raden fantes til og med den
  datoen, og en agent som husker den fra en eldre lesning bør se at den er
  avgjort, ikke bare forsvunnet.

- **Rettighetsforklaring: reaktiv eller proaktiv?** IKKE lenger et gap —
  `regel/rettighet-vises-for-forsoket` (`references/produktskjonn.md`) avgjorde det
  2026-09-08: proaktiv er normen overalt, `disabledReason` er bygget inn i
  `Button`/`IconButton`. Nevnt her fordi denne raden fantes fra tilstandsmatrise-
  kartleggingen 2026-09-07 til den datoen, og en agent som husker den fra en eldre
  lesning bør se at den er avgjort, ikke bare forsvunnet.

## Restanse fra tidligere år (2026-09-09)

`Saldo & restanse` og betalingsoppfølgingen regner begge fra januar i inneværende år
(`FeePaymentsPanel.hentSaldo`, `lib/oppfolging/hent.ts` `periodeFra`). En seksjon som
ikke betalte november i fjor får verken restanse i saldoboksen eller en sak i stigen
etter nyttår. Åpent spørsmål til founder: skal vinduet være «fra og med første
periode med registrert felleskostnad», med en synlig «regnet fra <periode>»-linje,
i BEGGE flatene samtidig? Det som ikke skal skje: ulike vinduer i de to — det ga
7 500 mot 20 000 kr for samme seksjon på samme skjerm 9. september.

**Avgjort 2026-09-09 (founder): ja — implementert, se `hentPeriodeFra`.**

## Finnes i appen, ikke i skill-kittet (2026-09-10, designrunde 2)

`skill/frivio-ui/assets/frivio-kit.tsx` speiler nå API-ene til bølge 3
(Button/Badge/Callout/Tabs/PillTabs/Input-familien/Checkbox/Radio/Switch/
Modal/Toast/OverflowMenu/Table/ListRow/StatCard/Card/EmptyState/Field/
DescriptionList/Pagination/LoadBar/Progress/StepCard/IconTile/
SectionHeader/CollapsibleSection/FormError/Text/IconButton/ConfirmDialog/
SearchInput/Avatar/StatusDot/Separator/Kbd/Spinner/Skeleton/Tooltip) EKSAKT
— samme prop-navn (inkludert norske som `verdi`, `steg`, `hoyde`, `antall`,
`side`), samme varianter, samme standardverdier. Sju komponenter er BEVISST
utelatt. Dette er ikke et åpent spørsmål (svaret er «nei, ikke i kittet», med
en konkret grunn per komponent) — listet her fordi det er nøyaktig den typen
rad denne fila samler, og for å hindre at noen legger dem til uten å lese
grunnen først:

- **`Popover`** — den delte ankrede-panel-primitiven (5 forbrukere i appen)
  avhenger av `.popover-panel`/`.popover-scrim`-CSS-klasser og et
  mobil-ark-brytpunkt som lever i `app/globals.css`, ikke i tokenlaget
  (`frivio-tokens.css`). `OverflowMenu` (som ER i kittet) bygger i stedet inn
  sin egen minimale versjon av chromet den trenger — ankret dropdown,
  Escape/klikk-utenfor, ingen mobil-ark, ingen `auto`-plassering.
- **`Dropdown`** — bygget PÅ Popover, pluss `next/link`/`useRouter` for
  lenke-modus. To avhengigheter kittet bevisst ikke har (Popover over, og
  routing i det hele tatt).
- **`FeatureIntro`** — engangs-onboardingkort låst til Frivios egen
  produktbeslutning («ny funksjonalitet skal introduseres i flaten», se
  AGENTS.md) og en spesifikk localStorage-nøkkelkonvensjon
  (`frivio_intro_<id>`). Et produktvalg, ikke et generisk UI-primitiv.
- **`Confetti`** — feiringseffekt (canvas) knyttet til onboarding-fullføring.
  En pynt-detalj, ikke et gjenbrukbart UI-primitiv.
- **`Autocomplete`** — combobox-chrome som med vilje overlater debounce/
  fetch-timing til kallstedet (BrregSearch/AdresseFelt/SupplierList trenger
  hver sin timing) — avhenger av Popover, som er utelatt over.
- **`BrregSearch`** — Brønnøysund-oppslag (norsk foretaksregister), bygget på
  Autocomplete. Rent domenespesifikt.
- **`Dropzone`** — angitt som app-spesifikk i oppdragsbeskrivelsen for denne
  runden. Komponenten i seg selv har ingen Popover-/next-avhengighet og
  kunne vært portet uten friksjon — utelatt denne runden for å matche
  oppdragets eksplisitte omfang, ikke fordi den faktisk trenger appen rundt
  seg. Kandidat å ta med i en senere runde uten ny avveining.

`ConfirmDialog` og `SearchInput` var ikke eksplisitt nevnt i noen av de to
listene i oppdraget (verken «speil EKSAKT» eller «kan utelates»), men står
begge i «filer du eier (les disse, speil dem)». Begge er tatt MED i kittet:
ingen av dem har en Popover-/next-avhengighet eller Frivio-spesifikk
forretningslogikk — `SearchInput` er `Input` med et søkeikon og en
tøm-knapp, `ConfirmDialog` er `Modal`+`ModalActions`+`Button`. Nevnt her i
tilfelle en senere leser lurer på hvorfor de ikke sto i utelatelses-listen.

## Medeiere og kontaktperson (2026-09-09)

En seksjon kan nå ha flere eiere med andel (`unit_eierperioder`), men faktura, påminnelse,
inkassovarsel, restanse og bankmatching adresserer fortsatt ÉN kontaktperson per seksjon
(`units.owner_*`). Medeiere er solidarisk ansvarlige for felleskostnaden, så det er forsvarlig —
og founder avgjorde 2026-09-09: **nei, medeiere trenger ikke kopi** — én kontaktperson per seksjon
forblir modellen. Ikke foreslå e-post per eierperiode igjen uten founder-initiativ.
