export type TelltaleCategory =
  | "print"
  | "font"
  | "color"
  | "holo"
  | "physical"
  | "symbols"
  | "back"
  | "text-japanese"
  | "packaging"
  | "market";

export type Telltale = {
  id: string;
  category: TelltaleCategory;
  title: string;
  realSign: string;
  fakeSign: string;
  weight: number; // 1–10 importance
  howToCheck: string;
  appliesTo: "all" | "holo" | "japanese" | "sealed" | "modern" | "vintage";
  sources: string[];
};

export const telltales: Telltale[] = [
  {
    id: "spelling-grammar",
    category: "print",
    title: "Spelling & grammar",
    realSign: "Correct Pokémon spelling (with accent), clean English/Japanese text",
    fakeSign: "Typos, missing é in Pokémon, 'Pocket Monster' on EN cards, nonsense HP",
    weight: 10,
    howToCheck:
      "Read every line. HP over ~380 (as of 2026 English sets) is an immediate red flag. Compare attack names to an official scan.",
    appliesTo: "all",
    sources: ["tcgplayer-spot-fakes", "tcgrader-auth"],
  },
  {
    id: "font-weight",
    category: "font",
    title: "Font weight & letter shapes",
    realSign: "Proprietary TCG font; crisp edges; consistent weight",
    fakeSign: "Too bold/thin letters, wrong lowercase 'a', soft/pixelated edges",
    weight: 9,
    howToCheck:
      "Zoom on HP, LV., damage numbers, and attack text. Compare letter shapes to a trusted database scan side-by-side.",
    appliesTo: "all",
    sources: ["hardcore-collectors", "pokewallet-10-tests", "gengar-guide"],
  },
  {
    id: "copyright-line",
    category: "font",
    title: "Copyright microtext",
    realSign: "Tiny but razor-sharp copyright line at bottom",
    fakeSign: "Blurry, truncated, misspelled, or wrong year/rights text",
    weight: 8,
    howToCheck:
      "Macro photo of the bottom strip. If you cannot read it cleanly while known-real cards of that era stay sharp, treat as suspicious.",
    appliesTo: "all",
    sources: ["pokewallet-10-tests", "hardcore-collectors"],
  },
  {
    id: "color-saturation",
    category: "color",
    title: "Color saturation & palette",
    realSign: "Vivid, accurate palette matching official prints for that set/era",
    fakeSign: "Muted blues/greens, washed-out navy, or oversaturated neon tones",
    weight: 8,
    howToCheck:
      "Compare under the same light to a known authentic card or high-res official scan. Background washes are often first to drift.",
    appliesTo: "all",
    sources: ["gengar-guide", "from-japan-blog", "tcgrader-auth"],
  },
  {
    id: "energy-symbols",
    category: "symbols",
    title: "Energy symbol geometry",
    realSign: "Correct proportions, shading, and placement for each type icon",
    fakeSign: "Wrong flame count, droplet shape, psychic points, or energy ball shading",
    weight: 9,
    howToCheck:
      "Close-up attack cost icons. Fire should have three distinct tongues; Water a clean droplet; Psychic the correct starburst. Compare positions vs authentic.",
    appliesTo: "all",
    sources: ["gengar-guide", "pokewallet-10-tests", "hardcore-collectors"],
  },
  {
    id: "set-symbol-number",
    category: "symbols",
    title: "Set symbol & collector number",
    realSign: "Correct set icon, size, color, and collector number for that print",
    fakeSign: "Wrong icon, soft edges, bad spacing, mismatched rarity symbol",
    weight: 8,
    howToCheck:
      "Verify set symbol against Pokémon TCG databases. Confirm rarity glyph matches the card’s known rarity.",
    appliesTo: "all",
    sources: ["tcgplayer-spot-fakes", "collectibles-guide"],
  },
  {
    id: "card-back",
    category: "back",
    title: "Card back color & border",
    realSign: "Deep navy with distinct border separation from interior blues",
    fakeSign: "Washed purple/blue, bleeding borders, off-center Poké Ball art",
    weight: 9,
    howToCheck:
      "Photograph the full back under even light. Compare border contrast and centering to a known-real English/Japanese back of the same era.",
    appliesTo: "all",
    sources: ["tcgplayer-spot-fakes", "pixel-hub-checklist", "from-japan-blog"],
  },
  {
    id: "light-core",
    category: "physical",
    title: "Light / core layer check",
    realSign: "Opaque blackish core; limited light bleed on most prints",
    fakeSign: "Bright light-through, grey/white core, inconsistent glow",
    weight: 7,
    howToCheck:
      "Phone flashlight behind the card. Note: light behavior varies by era/foil — use as supporting evidence, not sole proof (TCGplayer cautions against over-reliance).",
    appliesTo: "all",
    sources: ["pokewallet-10-tests", "athlon-2026", "tcgplayer-spot-fakes"],
  },
  {
    id: "thickness-feel",
    category: "physical",
    title: "Stock thickness & flex",
    realSign: "~0.30–0.35mm feel; consistent flex vs other real cards",
    fakeSign: "Too flimsy, waxy, greasy, or overly stiff laminated feel",
    weight: 7,
    howToCheck:
      "Compare flex and edge feel to a known authentic card from a similar era. Avoid destructive bend/rip tests on valuable cards.",
    appliesTo: "all",
    sources: ["hardcore-collectors", "athlon-2026", "from-japan-blog"],
  },
  {
    id: "holo-pattern",
    category: "holo",
    title: "Holo / texture pattern",
    realSign: "Era-correct repeating holo (stars, cosmos, etched modern textures)",
    fakeSign: "Flat sticker shine, rainbow smear, missing etch, wrong pattern for set",
    weight: 9,
    howToCheck:
      "Tilt under a single lamp. Look for depth and a repeating geometric motif, not uniform plastic rainbow.",
    appliesTo: "holo",
    sources: ["pokewallet-10-tests", "hardcore-collectors", "collectibles-guide"],
  },
  {
    id: "rosette-print",
    category: "print",
    title: "Offset rosette under magnification",
    realSign: "Clean CMYK rosette / halftone dots from commercial offset print",
    fakeSign: "Inkjet dither spray, laser toner clumps, pixelation from scanned art",
    weight: 9,
    howToCheck:
      "10x loupe or phone macro on a gradient area (sky/background). Irregular dots or banding strongly suggest consumer printing.",
    appliesTo: "all",
    sources: ["pokewallet-10-tests", "hardcore-collectors", "athlon-2026"],
  },
  {
    id: "evolution-box",
    category: "color",
    title: "Evolution / stage box styling",
    realSign: "Correct box color, bold stage font for the print",
    fakeSign: "Wrong box tint, thin fonts, mismatched stage treatment",
    weight: 7,
    howToCheck:
      "Especially useful on Japanese vintage evolution lines — compare stage box color and boldness to authentic scans.",
    appliesTo: "all",
    sources: ["gengar-guide"],
  },
  {
    id: "jp-kanji-font",
    category: "text-japanese",
    title: "Japanese character accuracy",
    realSign: "Correct kanji/hiragana/katakana forms and boldness",
    fakeSign: "Wrong character (e.g. カ vs 力), missing stroke lips, unbolded kanji",
    weight: 10,
    howToCheck:
      "Macro the attack name and Pokédex entry. Compare stroke endings and weight to a known Japanese authentic copy.",
    appliesTo: "japanese",
    sources: ["gengar-guide", "from-japan-blog"],
  },
  {
    id: "art-detail-teeth",
    category: "print",
    title: "Artwork micro-details",
    realSign: "Intended shading/dirt/linework preserved (e.g. dirty teeth on Masaki Gengar)",
    fakeSign: "Cleaned-up or smoothed art that loses small intended imperfections",
    weight: 6,
    howToCheck:
      "Compare facial/line details in art boxes. Counterfeiters often ‘clean’ or lose subtle shading.",
    appliesTo: "all",
    sources: ["gengar-guide"],
  },
  {
    id: "price-too-good",
    category: "market",
    title: "Price & seller risk",
    realSign: "Market-aligned price from reputable seller with clear macros",
    fakeSign: "Deal too good to be true, vague photos, refusal to provide close-ups",
    weight: 6,
    howToCheck:
      "Check recent comps. Demand front, back, edge, and text macros before paying. Walk away if seller resists.",
    appliesTo: "all",
    sources: ["gengar-guide", "pixel-hub-checklist", "pokemon-pricetracker-2026"],
  },
  {
    id: "sealed-wrap",
    category: "packaging",
    title: "Sealed product wrap & crimp",
    realSign: "Soft cellophane with Poké Ball logo; straight pack seals; tight packing",
    fakeSign: "Hard crackly wrap, missing logo, wavy/ribbed seals, loose cards inside",
    weight: 8,
    howToCheck:
      "Inspect box wrap logos and pack crimps. Mixed card orientations + impossible hit rates are classic fake packs.",
    appliesTo: "sealed",
    sources: ["tcgplayer-spot-fakes", "pixel-hub-checklist"],
  },
  {
    id: "slab-cert",
    category: "market",
    title: "Graded slab verification",
    realSign: "Cert number matches PSA/BGS/CGC database photos and label details",
    fakeSign: "Fake labels/holograms, mismatched cert photos, tampered case",
    weight: 10,
    howToCheck:
      "Look up the cert on the grader’s site and compare label text + card image. Fake slabs exist — never trust the plastic alone.",
    appliesTo: "all",
    sources: ["legitapp-guide", "athlon-2026", "pixel-hub-checklist"],
  },
];

export function getTelltale(id: string) {
  return telltales.find((t) => t.id === id);
}
