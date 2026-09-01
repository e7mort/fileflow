export type Source = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  kind: "community" | "guide" | "marketplace" | "official" | "tool";
  notes: string;
};

export const sources: Source[] = [
  {
    id: "gengar-guide",
    title: "Guide to identifying counterfeit cards (Masaki Gengar)",
    url: "https://www.reddit.com/r/GengarMasterSet/s/jPCewF8er0",
    publisher: "SakuretsuSensei / r/GengarMasterSet",
    kind: "community",
    notes:
      "Card-specific Japanese fake tells: muted colors, evolution box, teeth, LV font, energy shading, カ vs 力 kanji.",
  },
  {
    id: "gengar-megathread",
    title: "Gengar Authenticity Check Megathread",
    url: "https://www.reddit.com/r/GengarMasterSet/comments/1vw1j7v/gengar_authenticity_check_megathread/",
    publisher: "r/GengarMasterSet",
    kind: "community",
    notes: "Community authenticity checks via close-up photos/videos; mod-mail option for privacy.",
  },
  {
    id: "tcgplayer-spot-fakes",
    title: "How to Spot Fake Pokémon Cards",
    url: "https://www.tcgplayer.com/content/article/How-to-Spot-Fake-Pok%C3%A9mon-Cards/0b3c551c-39e2-4949-ac46-3cb27e215b04",
    publisher: "TCGplayer",
    kind: "marketplace",
    notes:
      "Read text, compare backs, compare to scans and known authentic cards; cautions on light/bend/rip tests; sealed tells.",
  },
  {
    id: "hardcore-collectors",
    title: "Complete Detection Guide",
    url: "https://hardcorecollectors.com/articles/fake-pokemon-cards",
    publisher: "Hardcore Collectors",
    kind: "guide",
    notes: "Font analysis, holo light transmission notes, weight/thickness, rosette pattern, energy symbols.",
  },
  {
    id: "pokewallet-10-tests",
    title: "10 Authentication Tests You Can Do at Home",
    url: "https://www.pokewallet.io/blog/how-to-spot-fake-pokemon-cards-authentication-guide",
    publisher: "PokéWallet",
    kind: "guide",
    notes: "Light core, font, holo eras, magnification, energy icon geometry, yellow tone checks.",
  },
  {
    id: "from-japan-blog",
    title: "How to Spot Fake Pokémon & One Piece Cards",
    url: "https://blog.fromjapan.co.jp/en/other/how-to-spot-fake-pokemon-cards.html",
    publisher: "FROM JAPAN Blog",
    kind: "guide",
    notes: "Paper quality, shade, character outlines, relief texture, JP packaging/font micro-differences.",
  },
  {
    id: "athlon-2026",
    title: "2026 Authentication Guide",
    url: "https://athlonsports.com/collectibles/collectibles-how-to-spot-fake-pokemon-cards-2026",
    publisher: "Athlon Sports",
    kind: "guide",
    notes: "Modern Mega Evolution ex / Chaos Holo context; texture, weight, UV, microscope notes.",
  },
  {
    id: "pixel-hub-checklist",
    title: "2026 Step-by-Step UK Checklist",
    url: "https://pixel-hub.co.uk/blogs/news/how-to-spot-fake-pokemon-tcg-cards",
    publisher: "Pixel Hub",
    kind: "guide",
    notes: "Print, back, texture, holo, weight, light, fonts, sealed packs, seller risk, grading.",
  },
  {
    id: "tcgrader-auth",
    title: "Community Card Authentication",
    url: "https://www.tcgrader.com/authenticate",
    publisher: "TCGrader",
    kind: "tool",
    notes: "Free community voting (authentic/fake/unsure) with expert collector feedback.",
  },
  {
    id: "legitapp-guide",
    title: "Pokémon Card Authentication Guide",
    url: "https://legitapp.com/blog/a-pokemon-card-authentication-guide-by-legit-app",
    publisher: "LEGIT APP",
    kind: "tool",
    notes: "Paid photo authentication service model; slab cert database checks; AI-assisted review.",
  },
  {
    id: "pokemon-pricetracker-2026",
    title: "Spot Fake Pokemon Cards in 2026",
    url: "https://www.pokemonpricetracker.com/blog/posts/spot-fake-pokemon-cards-in-2026-authentication-guide",
    publisher: "Pokemon Price Tracker",
    kind: "guide",
    notes: "Set symbols, comparison workflow, reporting channels, advanced tech notes.",
  },
  {
    id: "pokemon-support-counterfeit",
    title: "Did I purchase fake or counterfeit cards?",
    url: "https://support.pokemon.com/hc/en-us/articles/360002068953-Did-I-purchase-fake-or-counterfeit-cards",
    publisher: "The Pokémon Company International",
    kind: "official",
    notes: "Official acknowledgment of counterfeits; recommends caution and specialist help.",
  },
  {
    id: "collectibles-guide",
    title: "How to spot fake Pokemon Cards",
    url: "https://collectibles.com/blog/how-to-spot-fake-pokemon-cards-keep-your-collection-genuine",
    publisher: "Collectibles / Cardbase",
    kind: "guide",
    notes: "Rarity symbols, set numbers, holo quality, back design, material spacing.",
  },
];

export function getSource(id: string) {
  return sources.find((s) => s.id === id);
}
