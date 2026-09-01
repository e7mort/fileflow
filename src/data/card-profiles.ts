export type CardProfile = {
  id: string;
  name: string;
  set: string;
  language: "EN" | "JP" | "Both";
  era: string;
  riskLevel: "extreme" | "high" | "elevated";
  whyTargeted: string;
  telltaleIds: string[];
  specificNotes: string[];
  sources: string[];
};

export const cardProfiles: CardProfile[] = [
  {
    id: "masaki-gengar",
    name: "Masaki Gengar",
    set: "Japanese promo / Masaki-related Gengar prints",
    language: "JP",
    era: "Vintage JP",
    riskLevel: "extreme",
    whyTargeted:
      "High-value Japanese Gengar collectible with multiple documented high-quality counterfeit variants circulating on selling platforms and in-person deals.",
    telltaleIds: [
      "color-saturation",
      "evolution-box",
      "art-detail-teeth",
      "font-weight",
      "energy-symbols",
      "jp-kanji-font",
      "price-too-good",
      "card-back",
      "rosette-print",
    ],
    specificNotes: [
      "Blues/greens in background often muted on fakes vs authentic saturation.",
      "Evolution box color/font frequently wrong — authentic stage font should be bolder.",
      "Gengar’s teeth on authentic art look dirty/unflossed; many fakes clean them up.",
      "“LV. 40” font next to HP is commonly wrong on counterfeits.",
      "Energy symbol position and light shading on the energy ball often incorrect.",
      "Critical JP text tell: fakes may print katakana カ instead of kanji 力 (Power). Check stroke size and the lip at the bottom-right tip.",
      "Kanji weight on real cards is bolder; fakes often look thinner.",
      "Other fake variants miss hiragana す font or Pokédex entry text — do not assume one tell covers all variants.",
    ],
    sources: ["gengar-guide", "gengar-megathread"],
  },
  {
    id: "base-charizard",
    name: "Base Set Charizard (incl. 1st Edition / Shadowless risk)",
    set: "Base Set",
    language: "EN",
    era: "1999–2000 Vintage",
    riskLevel: "extreme",
    whyTargeted:
      "Most counterfeited English card historically; raw copies without rigorous authentication are high risk.",
    telltaleIds: [
      "spelling-grammar",
      "font-weight",
      "copyright-line",
      "holo-pattern",
      "card-back",
      "energy-symbols",
      "set-symbol-number",
      "light-core",
      "rosette-print",
      "price-too-good",
      "slab-cert",
    ],
    specificNotes: [
      "Demand era-correct shooting-stars / diagonal holo behavior — flat rainbow foil is a classic fake.",
      "Compare HP font, attack text, and copyright strip to verified scans.",
      "For graded copies, always verify cert databases; fake slabs target Charizard heavily.",
    ],
    sources: ["hardcore-collectors", "tcgplayer-spot-fakes", "legitapp-guide"],
  },
  {
    id: "pikachu-illustrator",
    name: "Pikachu Illustrator",
    set: "CoroCoro promo",
    language: "JP",
    era: "1998 Promo",
    riskLevel: "extreme",
    whyTargeted: "Ultra-high value trophy card; any raw or suspiciously cheap listing warrants expert review.",
    telltaleIds: [
      "jp-kanji-font",
      "font-weight",
      "color-saturation",
      "card-back",
      "rosette-print",
      "thickness-feel",
      "price-too-good",
      "slab-cert",
    ],
    specificNotes: [
      "Treat every listing as hostile until proven otherwise via grading cert + community experts.",
      "Do not rely on a single photo checklist for six-figure cards — escalate to graders/experts.",
    ],
    sources: ["hardcore-collectors", "legitapp-guide", "pokemon-support-counterfeit"],
  },
  {
    id: "black-star-promos",
    name: "Black Star Promos (high-value)",
    set: "Various Black Star Promo",
    language: "EN",
    era: "Vintage–Modern",
    riskLevel: "high",
    whyTargeted: "Frequently counterfeited alongside Base holos; promo numbering and foiling often wrong.",
    telltaleIds: [
      "set-symbol-number",
      "holo-pattern",
      "font-weight",
      "card-back",
      "copyright-line",
      "price-too-good",
    ],
    specificNotes: [
      "Confirm promo number formatting and foiling style against known authentic copies of that exact promo.",
    ],
    sources: ["hardcore-collectors", "tcgplayer-spot-fakes"],
  },
  {
    id: "modern-mega-ex",
    name: "Modern Mega Evolution ex / high-end modern chase",
    set: "2026 Mega Evolution era & recent SV-era chase",
    language: "Both",
    era: "Modern 2024–2026",
    riskLevel: "elevated",
    whyTargeted:
      "2026 reporting highlights sophisticated fakes aiming at new textured Mega Evolution ex / Chaos Holo styles.",
    telltaleIds: [
      "holo-pattern",
      "thickness-feel",
      "font-weight",
      "card-back",
      "energy-symbols",
      "rosette-print",
      "light-core",
      "price-too-good",
    ],
    specificNotes: [
      "Feel for deep texture/etch vs smooth waxy fakes.",
      "Modern fakes may pass glance tests — use macro + comparison + community check for expensive singles.",
    ],
    sources: ["athlon-2026", "pokewallet-10-tests", "pixel-hub-checklist"],
  },
  {
    id: "general-unknown",
    name: "Unknown / general single",
    set: "Any",
    language: "Both",
    era: "Any",
    riskLevel: "elevated",
    whyTargeted: "Default checklist when the exact counterfeit profile is unknown.",
    telltaleIds: [
      "spelling-grammar",
      "font-weight",
      "copyright-line",
      "color-saturation",
      "energy-symbols",
      "set-symbol-number",
      "card-back",
      "holo-pattern",
      "light-core",
      "thickness-feel",
      "rosette-print",
      "price-too-good",
    ],
    specificNotes: [
      "Start with text, back, and energy icons — highest catch-rate for casual fakes.",
      "If the card is Japanese text-heavy, add kanji/hiragana micro-checks.",
      "If still unsure after checklist, post to a researcher community or grade.",
    ],
    sources: ["tcgplayer-spot-fakes", "pokewallet-10-tests", "tcgrader-auth"],
  },
];

export function getCardProfile(id: string) {
  return cardProfiles.find((p) => p.id === id);
}
