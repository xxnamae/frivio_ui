# NotificationBell: bevisst ikke på Popover

**Situasjon:** Popover-migreringen (2026-09-01) konsoliderte fem spredte
popover-implementasjoner ned til den delte `Popover`-primitiven —
`OverflowMenu` og `Dropdown` (OrgSwitcher, ByggVelger) gikk over uten
friksjon, og eier nå kun det som faktisk er unikt for hver (rollemeny vs.
listbox-navigasjon), mens `Popover` overtok chrome: forankring, Escape,
klikk-utenfor, fokusretur og mobil-ark.

`NotificationBell` ble vurdert til samme migrering og BEVISST IKKE flyttet.

**Beslutning:** `NotificationBell` forblir sin egen implementasjon: en
`role="dialog"` på `--color-surface` (ikke `surface-2`, som `Popover` bruker),
med et TOPPFORANKRET mobilpanel (ikke `Popover` sitt bunnark) og egen
rullehøyde for en potensielt lang varselliste.

**Hvorfor:** Å tvinge den inn i `Popover` ville krevd inline-overstyringer av
akkurat de tingene som gjør `Popover` gjenkjennelig — overflaten, mobil-
forankringen og rulleoppførselen — og disse overstyringene ville kollidert med
`Popover` sin egen mobil-ark-CSS. En migrering som trenger å overstyre halve
komponentens chrome for å få riktig resultat, er ikke lenger en
konsolidering; den er en ny, skjult variant av `Popover` bygget inni
kallestedet. Beslutningen står kommentert i BEGGE filene (`Popover.tsx` og
`NotificationBell.tsx`), slik at neste person som vurderer samme migrering ser
begrunnelsen på begge sider uten å måtte lete den opp.

**Feilen å unngå:** Å telle et konsolideringsprosjekt som «ferdig» eller
«mislykket» basert på om ALT ble migrert, i stedet for om RIKTIG ting ble
migrert. Fem popovers ble til to (`Popover` + `NotificationBell` sitt
dokumenterte unntak) — det er den korrekte sluttilstanden, ikke en, fordi ikke
alle fem faktisk var samme mønster under overflaten.

**Kilde:** SYSTEM.md, endringslogg 2026-09-01 («Popover-migrering: OverflowMenu
og Dropdown på den delte primitiven; NotificationBell vurdert og beholdt som
dokumentert unntak»). Kommentaren i `components/dashboard/NotificationBell.tsx`
(linje ~69–78) og i `components/ui/Popover.tsx` (toppkommentar).
