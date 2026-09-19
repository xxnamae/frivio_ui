# SupplierList: bevisst ikke BrregSearch

**Situasjon:** Da de tre siste rå BRREG-søkefeltene ble migrert til den delte
`Autocomplete`-primitiven (2026-09-01), var `BrregSearch` det opplagte
alternativet for `SupplierList` sitt leverandørsøk — den fantes allerede, var
nettopp selv migrert til å bruke `Autocomplete` internt, og løser nøyaktig
samme underliggende problem (søk mot BRREG-enhetsregisteret).

**Beslutning:** `SupplierList` bruker `Autocomplete<BrregEnhet>` DIREKTE, ikke
`BrregSearch`.

**Hvorfor:** `BrregSearch` sin oppgave er å UPSERTE en leverandørrad i det
øyeblikket brukeren VELGER et treff i søket — riktig for flater der valget ER
handlingen (f.eks. `RegisterFlow`). I `SupplierList` er valget bare et steg i
et skjema som først lagres ved SUBMIT; bruker `BrregSearch` der, ville et
avbrutt skjema (brukeren velger en leverandør, angrer, lukker skjemaet uten å
lagre) latt en foreldreløs leverandørrad ligge igjen i databasen — data uten
et skjema som noensinne fullførte. Løsningen bruker i stedet
`Autocomplete<BrregEnhet>` bart: `onSelect` fyller kun navnefeltet, og raden
lagres først når skjemaet faktisk sendes inn.

**Feilen å unngå:** Å velge gjenbruk basert på «løser samme datahentings-
problem» i stedet for «har samme SKRIVE-kontrakt». To komponenter kan dele
nøyaktig samme søkelogikk og likevel være feil for hverandre fordi den ene
skriver til databasen ved valg og den andre ikke gjør det — det er en
skrivekontrakt-forskjell, ikke en presentasjonsforskjell, og den avgjør om
gjenbruk er trygt. En senere audit-agent vurderte nøyaktig dette forslaget
(gjenbruke `BrregSearch` sin auto-lagring et annet sted) og AVVISTE det av
samme grunn — presedensen holdt.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («De tre siste rå søkefeltene
migrert til Autocomplete») og («Audit-rettevåg 2–4», der et lignende forslag om
BrregSearch-gjenbruk som auto-lagrer ble avvist av en agent som fulgte denne
presedensen).
