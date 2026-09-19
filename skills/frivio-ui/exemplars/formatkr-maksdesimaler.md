# formatKr med maksDesimaler på betalingskrav

**Situasjon:** Kronebeløp-formatering var håndrullet på ~60 kallesteder i 31
filer — `toLocaleString('nb-NO')` og `Intl.NumberFormat` skrevet ut på nytt
hver gang, med små, usystematiske variasjoner i hvor mange desimaler som ble
vist. Revisjonen 24. august kalte dette «høyeste rente» i verstinglista over
teknisk gjeld.

**Beslutning:** Ett delt `formatKr(n, opts)` i `lib/utils.ts`, med to
eksplisitt navngitte modi: `desimaler` (FAST antall, brukes der beløpet alltid
skal vise øre — banksaldo, transaksjonsbeløp) og `maksDesimaler` (viser øre
KUN når de finnes — brukes på betalingskrav: faktura, purring, restanse i
e-post, fakturainnboksen). Konsolideringen ble verifisert med golden-tester
som regner forventet streng fra det GAMLE inline-uttrykket ved kjøretid, for
å garantere byte-identisk utfall og ikke bare «ser riktig ut».

**Hvorfor:** Beløp som desimalkapable `numeric`-verdier (bank/faktura, se
SYSTEM.md §4 om `numeric` vs. `integer`) ble tidligere avrundet inkonsekvent —
noen steder til hele kroner alltid, andre steder med øre alltid. På et
BETALINGSKRAV er det en reell feil: et krav som viser 1 001 kr når 1 000,50 kr
faktisk skyldes, får mottakeren til å betale feil sum. `maksDesimaler: 2` ble
derfor eksplisitt gjeninnført på nettopp betalingskrav-flatene etter at den
første rydderunden hadde avrundet ALT til hele kroner, inkludert kravene — se
`regel/avrunding-aldri-pa-betalingskrav`.

**Feilen å unngå:** Et automatisk søk etter «brukes `formatKr` her allerede?»
under selve konsolideringen ga et FALSKT «0 treff» på ett kallested (`formatKr`
var faktisk brukt 9 steder der), fordi søket kjørte samtidig med et tungt
bakgrunnssøk fra en annen agent. Feilen ble oppdaget ved å faktisk reprodusere
og telle på nytt — nøyaktig AGENTS.md sitt prinsipp «en måling som gir 0 funn
skal alltid mistenkes for å ha målt ingenting», anvendt på et grep-søk, ikke
bare på nettleser-målinger.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Teknisk gjeld ryddet —
formatKr … golden-tester»). `lib/utils.ts`, toppkommentaren over `formatKr`.
