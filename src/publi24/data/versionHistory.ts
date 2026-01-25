export type VersionData = {
  version: string;
  releaseDate: string;
  changeNew?: string[];
  changeImprove?: string[];
  changeFix?: string[];
};

export const versionHistory: VersionData[] = [
  {
    version: '2.42.3',
    releaseDate: '25 ianuarie 2026',
    changeFix: [
      'Configurări noi necesare pentru livrare pe Firefox.',
    ],
  },
  {
    version: '2.42.2',
    releaseDate: '25 ianuarie 2026',
    changeFix: [
      'Rezultate inconsistente sau neculese pe \'căutare telefon\'.',
    ],
  },
  {
    version: '2.42.1',
    releaseDate: '14 ianuarie 2026',
    changeImprove: [
      'Încărcare mai rapidă a UI-ului pe Google search.',
    ],
    changeFix: [
      'Tutorial nefuncțional când mod focus activat.',
      'Animație mai simplă pe \'Rezultate\' când sistemul cere animații reduse.',
      'Aliniere button logo și închidere pe mobil în modalul de poze.',
      'Anumite poze nu se încarcau.',
    ],
  },
  {
    version: '2.42',
    releaseDate: '13 ianuarie 2026',
    changeNew: [
      'Setare nouă: căutare manuală pentru telefon și poze.',
      'Pe Desktop implicit căutare manuală pornită în setări pe poze.',
      'Modal cu explicații la apăsare pe titluri rezultate.',
      'Animație puls când rezultatele sunt actualizate.',
      'Layout nou butoane globale cu logo și meniu.',
      'Tutorial refăcut și adăugat în meniu.',
      'Istoricul versiunilor în meniu.',
      'Separarea anunțurilor active și inactive în modalul de favorite.',
      'Animație pe butonul modalului de favorite la schimbare.',
      'Protecție la ștergerea tuturor pe modalul de favorite.',
      'Reafișare modal la reîncărcarea paginii, îmbunătățind UX pe iOS.',
    ],
    changeImprove: [
      'Modalele se închid la apăsarea înapoi și nu navighează pagina.',
      'Motiv ascundere îmbunătățit.',
      'Redenumire titlurilor de rezultate sub anunț.',
      'Afișare eroare la încărcarea pozelor.',
      'Prevenire limitare rată îmbunătățită și încărcare leneșă imagini.',
      'Afiș mai scurt al link-urilor rezultate pe căutare telefon.',
      'Firefox: scos stilul "neclar" de pe modaluri pentru performanță mai bună.',
    ],
    changeFix: [
      'Înălțimea imaginilor în modalul de imagini.',
      'Căutare poze nefuncțională în pagina anunțului când rulat din modalul de duplicate.',
    ],
  },
  {
    version: '2.41',
    releaseDate: '28 decembrie 2025',
    changeNew: [
      'Colectare date analitice de utilizare (nicio informație personală nu este colectată). Consultați politica de confidențialitate pe GitHub.',
    ],
  },
  {
    version: '2.40',
    releaseDate: '2 decembrie 2025',
    changeNew: [
      'Gestionare mai bună a erorilor și afișare efectivă pentru acțiuni cheie.',
    ],
  },
  {
    version: '2.39.2',
    releaseDate: '1 decembrie 2025',
    changeFix: [
      'Problemă cu încărcarea extensiei pe pagina de listare publi24.',
      'Problemă cu iconița Whatsapp pe Opera.',
      'Problemă cu determinarea locației pentru rezultatele căutării de imagini publi24.',
    ],
  },
  {
    version: '2.39.1',
    releaseDate: '30 noiembrie 2025',
    changeNew: [
      'Indicator de primă apariție / vârstă pentru numărul de telefon (când a fost văzut prima dată de extensie).',
    ],
    changeImprove: [
      '150 de site-uri suplimentare de tip escort indexate pentru rezultatele căutării de imagini.',
      'Încărcare mai rapidă a paginii pentru extensie pe publi24.',
    ],
  },
  {
    version: '2.38',
    releaseDate: '28 noiembrie 2025',
    changeFix: [
      'Compatibilitate cu ultimele modificări de pe paginile de anunțuri pe Publi24.',
    ],
  },
  {
    version: '2.37',
    releaseDate: '13 noiembrie 2025',
    changeNew: [
      'Setări pentru adăugarea unui mesaj WhatsApp predefinit.',
    ],
    changeImprove: [
      'Îmbunătățirea performanței, stabilității și indicatorului vizual la căutarea de imagini.',
      'Remedieri și îmbunătățiri minore.',
    ],
  },
  {
    version: '2.36.1',
    releaseDate: '1 noiembrie 2025',
    changeFix: [
      'Link-uri invalide analizate și afișate la efectuarea căutării de imagini.',
    ],
  },
  {
    version: '2.36',
    releaseDate: '14 octombrie 2025',
    changeNew: [
      'Motive îmbunătățite de ascundere cu categorii principale și subcategorii.',
      'Motiv temporar de ascundere. Va ascunde timp de 15 zile apoi se va reseta.',
      'Motivele poze false și doar deplasări se vor reseta după 90 și, respectiv, 15 zile.',
      'Configurare opțională pentru selectarea categoriei implicite de motiv de ascundere.',
      'Indicator de siguranță circular pentru rezultatele imaginilor, bazat pe domenii sigure / suspicioase / nesigure și timpul căutării.',
    ],
    changeImprove: [
      'Îmbunătățiri minore de funcționalitate și actualizări de stil.',
    ],
  },
  {
    version: '2.35',
    releaseDate: '17 septembrie 2025',
    changeNew: [
      'Include anunț temporar.',
    ],
  },
  {
    version: '2.34',
    releaseDate: '28 august 2025',
    changeNew: [
      'Import și export date în setări. Migrarea datelor între dispozitive diferite.',
    ],
    changeFix: [
      'Remediere detectare lipsă pe trans.',
    ],
  },
  {
    version: '2.33',
    releaseDate: '6 august 2025',
    changeNew: [
      'Adăugată temă care se potrivește cu tema întunecată de pe Publi24.',
      'Numărul de favorite fără anunțuri se afișează acum separat în buton față de cele cu anunțuri.',
      'Setare pentru activarea săriturii peste anunțuri noi, dar ascunse automat când se caută următorul anunț vizibil.',
      'Vârsta, greutatea și înălțimea specifice anunțului au acum prioritate față de cele generale ale telefonului, în cazul anunțurilor duplicate.',
    ],
    changeFix: [
      'Rezultatele imaginilor legate de București de pe Publi24 nu avertizau despre anunțuri active în altă locație.',
    ],
  },
  {
    version: '2.32.3',
    releaseDate: '29 iulie 2025',
    changeFix: [
      'Favoritele fără anunțuri nu se reîmprospătează cu anunțuri când apare anunț pe telefon.',
      'Telefonul și conținutul unui anunț nu sunt reanalizate, cauzând comportament ciudat, în special pe modalul de duplicate care arată numere diferite când numărul se schimbă pe anunț.',
    ],
  },
  {
    version: '2.32.2',
    releaseDate: '25 iulie 2025',
    changeFix: [
      'Anunțurile mai vechi, nevăzute niciodată, ar fi invizibile când deduplicarea anunțurilor este activată în setări.',
      'Butonul de anunț următor ar sări la anunțuri ascunse din cauza deduplicării activate.',
    ],
    changeImprove: [
      'Afișare număr eliminat când se deschide modalul de duplicate, îmbunătățirea formulării.',
    ],
  },
  {
    version: '2.32.1',
    releaseDate: '12 iulie 2025',
    changeNew: [
      'Date pe listarea imaginilor nimfomane.',
    ],
    changeFix: [
      'Duplicatele nu se afișează după căutarea telefonului.',
      'Deduplicarea anunțurilor ascunde toate anunțurile când acestea au aceeași dată.',
      'Ajustări mici ale criteriilor de ascundere automată.',
    ],
  },
  {
    version: '2.32',
    releaseDate: '29 iunie 2025',
    changeNew: [
      'Rezultatele imaginilor de pe site-uri de escortă străine sunt acum colorate în galben și afișează steagul țării înaintea domeniului.',
      'Setări suplimentare: Singur Anunț: Dacă este activat pentru numerele de telefon care au mai multe anunțuri, doar primul se va afișa pe pagina de listare.',
    ],
    changeFix: [
      'Favoritele pot rămâne blocate din cauza schimbărilor de telefon.',
      'Remedieri probleme ale criteriilor de ascundere automată.',
    ],
  },
  {
    version: '2.31',
    releaseDate: '4 iunie 2025',
    changeFix: [
      'Imaginile uneori nu se încarcă pe nimfomane.',
      'Adăugare mesaj pentru rezultate goale pentru lista imaginilor nimfomane.',
      'Remediere auto-filtrare potrivire imagini publi.',
      'Eliminare criteriu auto-ascundere "servicii totale" în favoarea "risc bts".',
    ],
  },
  {
    version: '2.30',
    releaseDate: '31 mai 2025',
    changeNew: [
      'Link-urile de conținut comentarii nimfomane sunt toate făcute clicabile.',
    ],
    changeImprove: [
      'Remedieri minore.',
    ],
  },
  {
    version: '2.29.1',
    releaseDate: '26 mai 2025',
    changeFix: [
      'Remedieri mici de stil.',
    ],
  },
  {
    version: '2.29',
    releaseDate: '25 mai 2025',
    changeNew: [
      'Imaginile pot fi căutate acum pe anunțuri fără număr de telefon.',
      'FUNCȚIE NOUĂ: Imagini subiect pe forumul nimfomane. Listare imagini profil utilizator într-un modal.',
    ],
    changeFix: [
      'Remedieri mici de stil și funcționalitate.',
    ],
  },
  {
    version: '2.28',
    releaseDate: '8 mai 2025',
    changeNew: [
      'Buton specific forum ddc când link în rezultatele căutării.',
    ],
    changeImprove: [
      'Remedieri și îmbunătățiri de stil.',
    ],
  },
  {
    version: '2.27.3',
    releaseDate: '28 aprilie 2025',
    changeFix: [
      'Remediere căutare Google aplicată în contexte nedorite.',
    ],
  },
  {
    version: '2.27.2',
    releaseDate: '28 aprilie 2025',
    changeFix: [
      'Remediere căutare Google nefuncțională.',
    ],
  },
  {
    version: '2.27.1',
    releaseDate: '27 aprilie 2025',
    changeFix: [
      'Remedieri mici de stil.',
      'Remediere duplicate lipsă din favorite.',
    ],
  },
  {
    version: '2.27',
    releaseDate: '26 aprilie 2025',
    changeNew: [
      'Buton de salt la următorul vizibil adăugat în partea de jos a paginii după paginare.',
    ],
    changeImprove: [
      'Performanță îmbunătățită de redare și responsivitate.',
    ],
    changeFix: [
      'Remediere: imaginile webp sunt acum căutabile.',
    ],
  },
  {
    version: '2.26',
    releaseDate: '12 aprilie 2025',
    changeNew: [
      'Utilizatorii noi primesc un mini tutorial.',
      'Mai multe anunțuri pentru același număr de telefon sunt afișate, dacă există, și le poți compara într-un modal.',
      'Ascunderea unui anunț poate fi motivată opțional, anunțurile cu rezultate de imagini de pe site-uri dubioase sunt marcate automat cu motivul imagini furate.',
      'Ascunderea automată a anunțurilor poate fi activată, care poate fi bazată pe mai multe criterii, cum ar fi înălțimea.',
      'Modul focus poate fi activat pentru a vedea doar anunțuri noi, cele pe care le-ai ascuns anterior nu vor apărea deloc.',
      'Favoritele pot fi adăugate și văzute într-un modal, grupate pe locație.',
    ],
    changeImprove: [
      'Mai multe îmbunătățiri în căutarea de link-uri și imagini.',
      'Pe listă, făcând clic pe imaginea anunțului, se afișează direct sliderul fără a părăsi listarea.',
    ],
  },
];
