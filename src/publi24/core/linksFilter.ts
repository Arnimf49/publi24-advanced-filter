import {WWStorage} from "./storage";
import {utils} from "../../common/utils";

const BLACKLISTED_LINKS: string[] = [
  'https://meiwakucheck.com/',
  'https://www.jpnumber.com/',
  'https://telefonforsaljare.nu/',
  'https://www.180.se/',
  'https://www.180.dk/',
  'https://www.eniro.se/',
  'https://z1kk2ror.canina101.es/',
  'https://www.telefonforsaljare.nu/',
  'https://denwam.com/',
  'https://cinetesuna.ro/',
  'https://www.france-inverse.com/',
  'http://www.zibadpl.blogfa.com/',
  'https://www.telephoneannuaire.fr/',
  'https://nmqzg.forschungsstelle-ordensgeschichte.de/',
  'https://k6q4ubh5h.echantillon-lipton.fr/',
  'https://4qkhz6bjo.thiasbarber.fr/',
  'https://www.denwam.com/',
  'https://www.leelam.af/',
  'http://kto-zvonil.com.ua/',
  'https://www.hitta.se/',
  'https://chonso.mobifone.vn/',
  'http://chonso.mobifone.vn/',
  'https://denwacho.net/',
  'https://www.telefonforsaljare.nu/',
  'https://sunat.ro/',
  'https://www.telefoncontact.online/',
  'https://www.telefonreclamatii.online/',
  'https://www.contact-telefon.online/',
  'https://mobile.inelenco.com/',
  'https://genealogic.review/',
  'https://www.merinfo.se/',
  'https://telefon-kontakte.ch/',
  'http://www.telefonforsaljare.nu/',
  'https://www.telnavi.jp/',
  'https://www.reverseau.com/',
  'https://www.telguarder.com/',
  'https://information.com/people/',
  'https://health.information.com/reverse-phone-lookup/',
  'https://www.reverseaustralia.com/',
  'https://unmask.com/',
  'https://www.e-aidem.com/',
  'https://phone-book.tw/',
  'https://escorte.lol/',
  'https://haisalut.ro/',
  'https://tel-search.net/',
  'https://www.publi24.ro/cv?jobapplyid=',
];

const SAFE_LAST_DOMAIN_PARTS: string[] = [
  '.ro',
  'nimfomane.com',
  'ddcforum.com',
  'escorte.pro',
  'escortsromania.net',
  'excorte.net',
  'brailaescorte.com',
  'sexyro.com',
  'xlamma.com',
  'escorte-cluj.com',
  'escorte365.com',
  'anunt.online',
  'escort-romania.com',
  'letgosex.com',
  'sexy-escorte.com',
  'escortero.net',
  'escorteromania.info',
];

const PRIO_DOMAINS: string[] = [
  'publi24.ro',
  'www.publi24.ro',
  'nimfomane.com',
  'ddcforum.com',
];

const ESCORT_LISTING_SITE_DOMAINS: Record<string, string[]> = {
  general: [
    'secrethostess.com',
    'eurogirlsescort.com',
    'eurogirlescort.it',
    'eurogirlsescort.cz',
    'eurogirlsescort.fr',
    'eurogirlsescort.ru',
    'eurogirlsescort.de',
    'eurogirlsescort.es',
    'gentsnav.com',
    'happyescorts.com',
    'erobella.com',
    'escortnews.eu',
    'escortnews.com',
    'europescortguide.com',
    'scarletamour.com',
    '1escorts.net',
    'erosgirlsguide.com',
    'atlasescorts.com',
    'eurogirlescort.nl',
    'myescort.network',
    'escortdirectory.com',
    'escorthub.org',
    'escortlist.vip',
    'escortface.com',
    'celebrityvipescorts.com',
    'loquovip.com',
    'devozki.com',
    'ondate.com',
    'seductiveseekers.com',
    'lovehub.com',
    'ukrgo.com',
    'escort.club',
    'luxuryescorts.webnode.page',
    'roksati.com',
    'escort-list.com',
    'meendorux.net',
    'sexbroker.io',
    'smooci.com',
    'adultwork.com',
    'thesextown.com',
    'superxgirls.com',
    'escort-guide.tv',
    'bourdela.com',
    'glamourescorts.net',
    'escortinside.com',
    'escort-galleries.com',
  ],
  pl: [
    'city-love-companions.com',
    'hot.com',
    'dolores.sex',
    'erozone.com',
  ],
  ua: [
    'intim‑uslugi.info',
    'intim-kiev.com',
    'prostikom.net',
    'golapristan.com',
    'kiev-girls.info',
    'prostitutkikieva.biz',
    'seksdoska.com',
    'delux-odessa.club',
    'sexodessa.me',
  ],
  gb: [
    'ukescorts.directory',
    'vivastreet.co.uk',
    'prostitutenearme.co.uk',
    'escortfinderuk.co.uk',
    'fireescorts.co.uk',
    'cupidescorts.co.uk',
    'local-escorts-birmingham.co.uk',
    'my-local-escorts.co.uk',
    'escortguide.co.uk',
    'escortrankings.uk',
    'worldescortshub.com',
    'hallo.co.uk',
    'uescort.com',
    'escortsnet.co.uk',
    'ennvy.com',
    'pumpsmag.com',
    'londonbelles.co.uk',
    'nefertarigirls.com',
    'escortdirectory-uk.com',
    'voguerre.com',
  ],
  ie: [
    'escort-ireland.com',
  ],
  ru: [
    'bordelya.net',
    'craftmari.ru',
    'intimlike.com',
    'itinka.ru',
    'prostitutkimurmanska.biz',
    'putana74.net',
    'dosugbarbrn.com',
  ],
  ee: [
    'voodi.ee',
    'gpointestonia.com',
    'sexintallinn.com',
  ],
  lt: [
    'skelbiu.lt',
  ],
  it: [
    'torchemada.net',
    'escort-advisor.com',
    'escort.it',
    'escorta.com',
    'trovagnocca.com',
    'itaincontri.com',
    'moscarossa.biz',
    'torchemada.r.worldssl.net',
    'tantralux.com',
    'bakecaincontrii.com',
    'escort-donna.com',
    'sexyguidaitalia.com',
    'donnecercauomo.xxx',
    'trans-advisor.com',
    'bakeca.it',
    'tutto-incontri.com',
    'vivastreet.it',
    'incontri18.it',
    'massaggiamilano.it',
    'escortdimension.net',
    'paginelucirosse.it',
  ],
  fi: [
    'realescort.fi',
  ],
  se: [
    'realescort.se',
  ],
  no: [
    'realescort.eu',
  ],
  dk: [
    'escortify.dk',
    'escort-side.dk',
    'annoncelight.dk',
    'sexlyst.dk',
    'realescort.dk',
    'nympho.dk',
  ],
  be: [
    'redlights.be',
    'kinky.be',
    'escortmarket.be',
    'escortservice.xxx',
    'quartier-rouge.be',
    'hotescorts.be',
  ],
  lv: [
    'intim24.eu',
    'eskortpakalpojumi.lv',
    'sexlaguna.eu',
  ],
  es: [
    'escort-advisor.xxx',
    'mundosexanuncio.com',
    'nuevoloquo.ch',
    'loquosex.com',
    'citapasion.com',
    'nuevapasion.com',
    'milescorts.es',
    'nuescorts.com',
    'milcitas.com',
    'clasf.es',
    'chicasparaelsequito.com',
  ],
  nl: [
    'kinky.nl',
    'amsterdamescort.net',
    'amsterdamescort24.com',
    'hillegomescorts.nl',
    'hotelescort-amsterdam.nl',
    'hotelescort-schiphol.nl',
    'hotelescortdenhaag.nl',
    'hotelescortrotterdam.nl',
    'hotelescortutrecht.nl',
    'redlights.nl',
    'vianenescorts.nl',
    'seduce.nl',
  ],
  bg: [
    'adamieva.info',
    'samo.sex',
    'kompanionki.bg',
    'sexzona.bg',
    'topescort.bg',
    'bezplatno.net',
    'alo.bg',
  ],
  de: [
    'badeladies.de',
    'escortin-berlin.com',
    "ladies.de",
    'escorts24.de',
    'nymphomaneladies.de',
    'zaertlicheladies.de',
    'rasierteladies.de',
    'zierlicheladies.de',
    'dominaboard.com',
    'escortboard.de',
    'lustscout.men',
    'oldiedate.com',
    'orhidi.com',
    'ladies.community',
    'snatchlist.com',
    'sexdo.com',
    'fickemich.com',
    'lady-discreet.de',
    'myescortgirls.com',
    'privatmodellefrankfurt.com',
    'intim.to',
    'ladies-phone.com',
    'erotik.quoka.de',
    'erotik.markt.de',
    'sexgirls-leipzig.de',
    'lustscout.to',
    'lusthaus.cc',
    'map-escort-de.com',
    'ladies-forum.de',
    'berlinintim.de',
    'escort-advisor.de',
    'escortbabylon.de',
    'sexwelt24.de',
    'eros-esslingen.de',
    'girlnextdoor.de',
    '6profis.de',
    'moneylove.de',
    'deutsche-geishas.de',
    '6today.de',
  ],
  cz: [
    'secretgirlprague.com',
  ],
  hr: [
    'ljubavni-oglasnik.net',
  ],
  tr: [
    'bodrumtraba.com',
    'clip-art-center.com',
    "degisiklink.com",
    "digiescort.com",
    'erzuruminsaat.com',
    "fromjtoz.com",
    'humpaki.com',
    'istanbularel.com',
    "karasuemlakilanlari.com",
    'maltepeokul.com',
    'sakaryaceliktekstil.com',
    'sakaryamedya.net',
    'theamazing.net',
    'antalyadolmus.com',
    'pornerclub.com',
  ],
  gr: [
    'escortathens.info',
    'adoos.com.gr',
    'escortaroma.eu',
    'escorterotica.gr',
    'lovelist.com.gr',
    'openday.gr',
    'prosopikesaggelies.gr',
    'sexylist.gr',
    'sexgr.net',
    'eroticportal.com',
    'ierodoules.com',
    'kalosex.com',
    'kanesex.com',
    'magictrans.gr',
    'marmeladies.gr',
    'pipoula.gr',
    'sexaki.gr',
    'sexorama.eu',
    'vradinosex.com',
    'escortforumgr.com',
    'synodoi.com',
    'tescort.com',
    'vriskosex.gr',
  ],
  mt: [
    'escortsitemalta.com',
    'sexomalta.com',
    'maltadates.com',
  ],
  mc: [
    'onseconnait.com',
  ],
  ge: [
    '10xgeorgia.me',
  ],
  at: [
    "peepshowwien.at",
    'booksusi.com',
    '24escort.at',
    'laufhaus-lienz-maxim.at',
    'lh182.at',
    'sexmagazin.at',
    'erotik.land',
    'wien-girls.at',
    'hotbunny.at',
    'laendleanzeiger.at',
    'love-haus.at',
    'laufhaus-a9.at',
    'laufhaus-valentin.at',
    'escortlook.org',
    'fick-markt.com',
    'das-laufhaus.at',
    'kauf6.com',
    'locanto.at',
    'goldkore.com',
  ],
  ch: [
    'fgirl.ch',
    'ladys.one',
    'cherry.ch',
    'amesia.ch',
    'clubaphrodisia.ch',
    'slavic-companions.com',
    'sex4u.ch',
    'xdiva.ch',
    'hot.ch',
    '6inserate.ch',
    'edengirls.ch',
    'markt.ch',
    'sexnews.ch',
    'and6.com',
    'lust24.ch',
    'tantra-venus.ch',
    'escorts.ninja',
    'gotasex.com',
    'meetescorts.ch',
  ],
  rs: [
    'seksi-adresar.co',
    'topescort.com',
  ],
  pt: [
    'mundoacompanhantes.com',
    'classificadosx.net',
  ],
  fr: [
    'massagerepublic.com',
    'sexemodel.com',
    '1baiser.com',
    '6annonce.net',
    'annonceerotique.com',
    'escorteintime.com',
    'calinemoi.com',
    'rencontres-sanslendemain.com',
    'ruedelarencontre.com',
    'privatemodele.com',
  ],
  cl: [
    'locanto.cl',
  ],
  cy: [
    'topescort.cy',
  ],
  br: [
    'garotacomlocal.com',
    'hotters.com.br',
    'photoacompanhantes.com',
    'rua69.com',
  ],
  ae: [
    'hot-secret.com',
    'hottiesofdubai.com',
    'escortgirls.guru',
  ],
  us: [
    'callescortgirls.ca',
    'trystpage.com',
    'bedpage.com',
    'sugarasian.org',
    'backpagegals.com',
    'birchplace.com',
    'escortsbabes.com',
    'adultsearch.com',
  ],
  ca: [
    'leolist.cc'
  ],
  in: [
    'goa.anjalirana.com',
  ],
  co: [
    'govips.com'
  ],
  au: [
    'locanto.com.au',
    'aussietopescorts.com',
    'escortsandbabes.com.au',
    'scarletblue.com.au',
  ],
  il: [
    'dira247.com',
  ]
}

interface ProcessedLink {
  link: string;
  isDead: boolean;
  isSafe: boolean;
  isSuspicious: boolean;
}

interface DomainInfo {
  links: ProcessedLink[];
  isSafe: boolean;
}

interface ImageLinkDomainGroup {
  domain: string;
  links: ProcessedLink[];
  isSafe: boolean;
}

function getFlagForDomain(domain: string): string | null {
  for (const [cc, domains] of Object.entries(ESCORT_LISTING_SITE_DOMAINS)) {
    if (domains.some(d => domain.endsWith(d))) {
      if (cc === 'general') {
        return '🌐';
      }
      return utils.countryCodeToFlagEmoji(cc);
    }
  }
  return null;
}

export const linksFilter = {
  filterLinks(links: string[], itemUrl: string): string[] {
    return links.filter((l: string) => !BLACKLISTED_LINKS.some((b: string) => l.indexOf(b) === 0) && itemUrl !== l);
  },

  sortLinks(links: string[]): string[] {
    return links.sort((l1: string, l2: string): number => {
      const d1: number = PRIO_DOMAINS.findIndex((d: string) => l1.includes('//' + d));
      const d2: number = PRIO_DOMAINS.findIndex((d: string) => l2.includes('//' + d));

      if (d1 !== -1 && d2 !== -1) {
        return d1 - d2;
      }
      if (d2 !== -1) {
        return 1;
      }
      if (d1 !== -1) {
        return -1;
      }

      return l1.localeCompare(l2);
    });
  },

  processImageLinks(id: string, links: string[], itemUrl: string): ImageLinkDomainGroup[] {
    const domainMap: { [domain: string]: DomainInfo } = {};
    const duplicatesInOtherLoc: string[] = WWStorage.getAdDuplicatesInOtherLocation(id);
    const duplicatesNotOldInOtherLoc: string[] = WWStorage.getAdNotOldDuplicatesInOtherLocation(id);
    const deadLinks: string[] = WWStorage.getAdDeadLinks(id);

    links
      .filter((link: string): boolean => {
        return !(link.startsWith("https://www.publi24.ro/") && !link.includes("/anunt/")) &&
          link.replace(/.+\/([^.\/]+)\.html.*/, '$1') !== itemUrl.replace(/.+\/([^.\/]+)\.html.*/, '$1');
      })
      .forEach((link: string) => {
        try {
          const urlObj = new URL(link);
          let domain = urlObj.hostname.replace(/^www\./, '');

          const isSafeLastDomain = SAFE_LAST_DOMAIN_PARTS.some(part =>
            domain.endsWith(part)
          );


          let isDomainSafe = false;
          let isDomainSuspicious = false;

          if (isSafeLastDomain) {
            isDomainSafe = !duplicatesInOtherLoc.includes(link);
            isDomainSuspicious = duplicatesNotOldInOtherLoc.includes(link);
            domain = `🇷🇴  ${domain}`;
          } else {
            const externalEscortListingFlag = getFlagForDomain(domain);
            if (externalEscortListingFlag) {
              isDomainSafe = false;
              isDomainSuspicious = true;
              domain = `${externalEscortListingFlag} ${domain}`;
            }
          }

          const linkObj: ProcessedLink = {
            link,
            isDead: deadLinks.includes(link),
            isSafe: isDomainSafe,
            isSuspicious: isDomainSuspicious,
          };

          if (!domainMap[domain]) {
            domainMap[domain] = { links: [linkObj], isSafe: isSafeLastDomain };
          } else {
            function getPriority(link: ProcessedLink) {
              if (link.isDead) return 4;
              if (!link.isSafe && link.isSuspicious) return 2;
              if (!link.isSafe) return 1;
              if (link.isSuspicious) return 3;
              return 4;
            }
            const newPriority = getPriority(linkObj);
            const insertIndex = domainMap[domain].links.findIndex(existing => {
              const existingPriority = getPriority(existing);
              return newPriority < existingPriority;
            });

            if (insertIndex === -1) {
              domainMap[domain].links.push(linkObj);
            } else {
              domainMap[domain].links.splice(insertIndex, 0, linkObj);
            }
          }
        } catch (error: any) {
          console.error(`Error processing link "${link}":`, error.message);
        }
      });

    return Object.entries(domainMap)
      .map(([domain, {links: domainLinks, isSafe}]: [string, DomainInfo]): ImageLinkDomainGroup => ({
        domain,
        links: domainLinks,
        isSafe
      }))
      .sort((groupA: ImageLinkDomainGroup, groupB: ImageLinkDomainGroup): number => {
        const isPrioA = PRIO_DOMAINS.includes(groupA.domain);
        const isPrioB = PRIO_DOMAINS.includes(groupB.domain);

        if (isPrioA && !isPrioB) return -1;
        if (!isPrioA && isPrioB) return 1;
        if (groupA.isSafe && !groupB.isSafe) return -1;
        if (!groupA.isSafe && groupB.isSafe) return 1;
        return groupA.domain.localeCompare(groupB.domain);
      });
  },
};
