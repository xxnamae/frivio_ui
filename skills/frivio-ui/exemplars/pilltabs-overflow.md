# PillTabs-overflow: feil i primitivet traff sider ingen rørte

**Situasjon:** `PillTabs` sin skjulte målerad (brukt til å beregne hvor mange
piller som får plass før resten går bak «…») hadde `w-0 overflow-hidden` uten
`shrink-0` på barna. Den absolutt posisjonerte, `nowrap`-satte målingsraden
strakk scroll-beholderen SIDELENGS, slik at Felleskostnad-siden lastet
forhåndsscrollet på 375 px — synlig som at siden åpnet midt i en horisontal
scroll i stedet for ved venstre kant. Funnet av UI-revisjonen 2026-09-01 som
eneste P0 der (verifisert i nettleser, 1280 + 375, lys + mørk).

**Beslutning:** `shrink-0` lagt til på målingsradens barn, slik at den skjulte
måleraden ikke lenger kan påvirke scroll-bredden til den SYNLIGE beholderen
rundt den.

**Hvorfor:** Feilen satt i PRIMITIVET (`components/ui/PillTabs.tsx`), ikke i
en enkelt side — og traff derfor Felleskostnad selv om ingen hadde endret
akkurat den siden. Dette er selve poenget med et delt designsystem sett fra
skyggesiden: en feil i ett sted forplanter seg til alle bruksstedene
automatisk, PRESIS som en fiks ville gjort. AGENTS.md sin regel «Delte
primitiver må tåle smal bredde selv» ble skrevet nøyaktig av denne klassen
hendelse (se `PageHeader`/`ListRow`-eksempelet i samme seksjon).

**Feilen å unngå:** Å lete etter årsaken til et responsivt bug PÅ SIDEN det
observeres, når kilden faktisk er i et primitiv siden bruker. Et symptom på
én side ("Felleskostnad ser rar ut på mobil") skal alltid sjekkes mot: bruker
andre sider samme primitiv, og viser DE samme symptomet? Hvis ja, fiks
primitivet én gang — en side-lokal fiks ville latt feilen ligge igjen for
alle andre `PillTabs`-brukere.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Full systemrevisjon nr. 2 …
UI (nettleser, 1280 + 375, lys + mørk) 1 P0/3 P1 — PillTabs sin målerad lekker
overflow») og («Mot 9/10, sjekkpunkt 1 … UI P0: PillTabs sin målerad har w-0
overflow-hidden + shrink-0 på barna»).
