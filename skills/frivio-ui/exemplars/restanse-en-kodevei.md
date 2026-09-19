# Restanse: tre kodeveier slått sammen til én

**Situasjon:** Felleskostnad-restanse (hvem skylder hva) ble regnet ut flere
steder uavhengig av hverandre — klientsiden hadde sin egen `±monthly_fee`-
beregning ved delbetaling, og saldo-/send-flyten hadde en annen antakelse om
rekkefølgen mellom `amount_paid` og `paid`-status. To uavhengige
utregningsveier for samme tall drifter fra hverandre i det øyeblikket én av
dem oppdateres uten den andre.

**Beslutning:** All restanselogikk samlet i `lib/felleskostRestanse.ts`, som
eneste kilde. Klientens ±monthly_fee-feil ved delbetaling og
amount_paid-før-paid-rekkefølgefeilen i saldo/send-flyten ble rettet SOM DEL AV
konsolideringen, ikke som separate feilrettinger — fordi feilene bare var
synlige NÅR man samlet koden ett sted og sammenlignet hva de faktisk regnet.

**Hvorfor:** Samme mønster som `regel/ib-tastes-en-gang-ub-utledes`: et tall
som kan regnes ut to steder VIL til slutt regnes ut feil ett av dem, fordi en
endring i den ene forretningsregelen (f.eks. hvordan delbetaling telles) må
huskes manuelt inn i den andre. Én funksjon, importert overalt, gjør det
strukturelt umulig for de to stedene å si ulike ting.

**Feilen å unngå:** Å behandle «tallet stemmer i dag» som bevis på at
utregningen er riktig strukturert. To uavhengige implementasjoner kan gi
samme svar på de fleste testtilfeller og likevel divergere akkurat på
kantsaken (delbetaling, feil rekkefølge på statusfelt) ingen har testet ennå —
konsolidering til én funksjon er forebygging, ikke opprydding etter at noen
har oppdaget avviket.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Teknisk gjeld ryddet … Restanse
samlet i lib/felleskostRestanse.ts; klientens ±monthly_fee-feil ved
delbetaling og amount_paid-før-paid-rekkefølgen i saldo/send rettet»).
