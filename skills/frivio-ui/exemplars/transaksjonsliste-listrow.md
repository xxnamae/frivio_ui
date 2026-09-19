# Transaksjonsliste: Table → ListRow

**Situasjon:** Transaksjonslisten på `/okonomi` (bankfeedens transaksjoner) var
bygget på `Table` — den delte primitiven for ren datavisning. Hver rad
åpner faktisk en handling (velge/overstyre kategori via en `Dropdown`), men den
ble ikke lagt merke til fordi `Table` ble bygget i Fase 2 av
bank-arbeidet, FØR `ListRow`/`Table`-skillet var skjerpet, og transaksjons-
listen ble glemt i den senere Økonomi-sveipens migreringsliste. Founder måtte
si «listekomponenter gjennomgående» to ganger på tvers av flere leveranser før
dette konkrete tilfellet ble sett.

**Beslutning:** Migrert til `ListRow` i en `divide-y`-beholder.

**Hvorfor:** Doktrinen («raden har en handling → `ListRow`; ren datavisning →
`Table`», se `regel/liste-med-handling-er-listrow`) sa hele tiden hva
raden skulle vært — det var ikke en ny regel, det var en gammel regel anvendt
riktig for første gang på denne listen. Etter fiksen ble doktrinen i tillegg
SKJERPET på selve showcase-siden (`/system/design`) og i `public/design.md`
med akkurat denne listen som det konkrete anti-eksempelet, slik at neste
person som bygger en radbasert visning har et navngitt presedens å sjekke mot,
ikke bare en abstrakt regel.

**Feilen å unngå:** Å anta at «det ble bygget riktig i sin fase» betyr «det er
fortsatt riktig» — et primitiv-valg som var korrekt (eller udefinert) DA en
flate ble bygget, kan bli feil når systemet skjerpes senere. En migreringsliste
som lister «alle steder Table brukes feil» er ikke komplett før den er
kryssjekket mot ALLE flater som ble bygget FØR skillet fantes, ikke bare de som
ble bygget etter.

**Kilde:** SYSTEM.md, endringslogg 2026-08-31 («Kjør på-runden: Felleskostnad
omkomponert … KONSISTENSFIKS», founder: «listekomponenter gjennomgående»,
«Detaljer ser ikke ut som en knapp», «Om revisor for høyt oppe»).
