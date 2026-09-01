export type Researcher = {
  id: string;
  name: string;
  type: "community" | "guide-author" | "service" | "grader" | "official";
  url: string;
  focus: string;
  howToEngage: string;
  cost: string;
  notes: string;
};

export const researchers: Researcher[] = [
  {
    id: "sakuretsu-gengar",
    name: "SakuretsuSensei + r/GengarMasterSet",
    type: "community",
    url: "https://www.reddit.com/r/GengarMasterSet/",
    focus: "Japanese Gengar / Masaki fakes, JP text micro-tells",
    howToEngage:
      "Post clear macros to the authenticity megathread, or mod-mail for privacy. Include front, back, text close-ups.",
    cost: "Free (community)",
    notes:
      "Origin of the Masaki Gengar counterfeit guide that inspired HoloCheck’s first card-specific profile.",
  },
  {
    id: "tcgrader",
    name: "TCGrader Authentication Community",
    type: "community",
    url: "https://www.tcgrader.com/authenticate",
    focus: "Crowd + expert votes on Pokémon/MTG/sports card authenticity",
    howToEngage: "Upload front/back and wait for Authentic / Fake / Unsure votes with comments.",
    cost: "Free",
    notes: "Good escalation when HoloCheck score is inconclusive.",
  },
  {
    id: "r-pokemontcg",
    name: "r/PokemonTCG",
    type: "community",
    url: "https://www.reddit.com/r/PokemonTCG/",
    focus: "Broad Pokémon TCG collecting; frequent fake ID threads",
    howToEngage: "Post well-lit front/back macros; search prior fake threads before posting.",
    cost: "Free",
    notes: "Large audience; quality varies — pair with specialized subs for JP grails.",
  },
  {
    id: "legitapp",
    name: "LEGIT APP",
    type: "service",
    url: "https://legitapp.com/what-we-authenticate/pokemon",
    focus: "Paid photo authentication for Pokémon singles (raw/graded)",
    howToEngage: "Submit required photo set through their trading-card Pokémon flow.",
    cost: "Paid per item (service pricing)",
    notes: "Useful competitor/partner-style model; HoloCheck aims cheaper guided self-checks.",
  },
  {
    id: "psa",
    name: "PSA",
    type: "grader",
    url: "https://www.psacard.com/cert",
    focus: "Professional grading + cert verification",
    howToEngage: "Verify slab certs online; submit high-value cards for authentication/grading.",
    cost: "Submission fees",
    notes: "Gold standard for high-value; still verify slabs — fake holders exist.",
  },
  {
    id: "bgs",
    name: "Beckett (BGS)",
    type: "grader",
    url: "https://www.beckett.com/",
    focus: "Professional grading/authentication",
    howToEngage: "Submit cards or verify graded labels via Beckett resources.",
    cost: "Submission fees",
    notes: "Pair with marketplace comps and clear photos when buying slabs.",
  },
  {
    id: "cgc",
    name: "CGC Trading Cards",
    type: "grader",
    url: "https://www.cgctradingcards.com/",
    focus: "TCG grading and authentication",
    howToEngage: "Submit high-value raw cards; verify certs when buying graded.",
    cost: "Submission fees",
    notes: "Another trusted third-party path when checklist confidence is low.",
  },
  {
    id: "tcgplayer-guides",
    name: "TCGplayer Content / Authentication Education",
    type: "guide-author",
    url: "https://www.tcgplayer.com/content/article/How-to-Spot-Fake-Pok%C3%A9mon-Cards/0b3c551c-39e2-4949-ac46-3cb27e215b04",
    focus: "Marketplace-backed how-to guides and buying standards",
    howToEngage: "Use as reference while shopping; buy from reputable sellers with buyer protection.",
    cost: "Free guides",
    notes: "Strong sealed-product tells and practical cautions on destructive tests.",
  },
  {
    id: "from-japan",
    name: "FROM JAPAN Blog researchers",
    type: "guide-author",
    url: "https://blog.fromjapan.co.jp/en/other/how-to-spot-fake-pokemon-cards.html",
    focus: "JP market paper quality, relief texture, character outlines",
    howToEngage: "Use JP-specific checks before importing; compare against trusted JP scans.",
    cost: "Free guides",
    notes: "Especially useful for Japanese singles and packaging.",
  },
  {
    id: "hardcore-collectors",
    name: "Hardcore Collectors",
    type: "guide-author",
    url: "https://hardcorecollectors.com/articles/fake-pokemon-cards",
    focus: "Detailed detection methodology for high-value singles",
    howToEngage: "Study guides; apply loupe/rosette and font protocols on grails.",
    cost: "Free guides",
    notes: "Good technical depth for building future CV training labels.",
  },
  {
    id: "pokemon-company",
    name: "Pokémon Support (TPCi)",
    type: "official",
    url: "https://support.pokemon.com/hc/en-us/articles/360002068953-Did-I-purchase-fake-or-counterfeit-cards",
    focus: "Official counterfeit acknowledgment / consumer guidance",
    howToEngage: "Report counterfeit product issues via official support channels.",
    cost: "N/A",
    notes: "Not a photo-check service; important for reporting and policy context.",
  },
];
