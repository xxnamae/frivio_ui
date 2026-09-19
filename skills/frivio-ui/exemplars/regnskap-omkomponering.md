# Regnskap-omkomponeringen: komponent-hygiene ≠ omkomponering

**Situasjon:** Økonomi-sveipen (Fase 5, 2026-08-31) migrerte Regnskap-sidens
rå elementer til delte primitiver — riktig arbeid, men det ALENE. Founder så
resultatet og reagerte: kontoene «spiste skjermen» (noe man kobler ÉN gang
skulle ikke dominere hver visning), siden hadde enorm scroll, transaksjons-
listen brukte fortsatt ikke `Table` (den ble bygget i Fase 2, FØR
primitiven fantes, og ble glemt i sveipens egen migreringsliste), og spørsmålet
kom rett ut: «har du virkelig tatt en UI/UX-audit?» Svaret var nei — sveipen
hadde vært komponent-hygiene (bytte rå elementer mot primitiver), ikke en
vurdering av om SIDENS STRUKTUR selv var riktig.

**Beslutning:** Siden ble faktisk omkomponert, ikke bare re-tokenisert:
bankstatus redusert til ÉN linje med en Detaljer-modal for alt man GJØR med
koblingen (`BankDetaljerModal`), tre `PillTabs`-faner (Oversikt / Transaksjoner
/ Kontantbeholdning) i stedet for én lang scroll, inspirert av Fiken/Tripletex
sitt mønster (kompakt sammendrag, detaljer bak faner/modal, én jobb per
visning) — men holdt INNENFOR Frivios eget system, ikke en kopi av et fremmed
formspråk.

**Hvorfor:** Komponent-hygiene (rå `<input>` → `Input`, håndrullet boks →
`Callout`) og omkomponering (er SIDENS oppbygning riktig for oppgaven
brukeren faktisk har?) er to forskjellige spørsmål, og å svare på det ene
oppleves ikke som et svar på det andre — en side kan bestå av 100 % riktige
primitiver og likevel være strukturelt feil (for mye scroll, feil ting
øverst). En audit eller sveip som bare sjekker «bruker denne rå elementer?»
finner aldri dette klasse problem, fordi svaret på det spørsmålet var allerede
ja.

**Feilen å unngå:** Å rapportere en komponent-migrering som om den var en
UX-gjennomgang. De bruker ofte samme verb («ryddet», «migrert», «forbedret»)
og kan gjøres av samme agent i samme økt, men de svarer på ulike spørsmål —
en leveranse som kaller seg en «sveip» eller «audit» bør eksplisitt si HVILKET
av de to den er, slik at et manglende strukturelt blikk ikke blir borte i en
liste over vellykkede primitiv-bytter.

**Kilde:** SYSTEM.md, endringslogg 2026-08-31 («Regnskap-siden omkomponert
etter founder-kritikk … Founder: kontoene spiste skjermen … og ‘har du
virkelig tatt en UI/UX-audit?’ — nei, sveipen var komponent-hygiene, ikke
omkomponering»).
