/**
 * Toroglo SEO Keywords Database
 * Comprehensive keyword list for SEO and AI search engine optimization
 */

export const TOROGLO_KEYWORDS = {
  // Core Brand & Category Keywords
  core: [
    "Toroglo Ghana",
    "Organic hair care Ghana",
    "Natural skin care products Ghana",
    "Ghanaian organic supplements",
    "Herbal beauty shop Accra",
    "Herbal beauty shop Winneba",
    "Organic hair and skin store",
    "Best organic products in Ghana",
    "Chemical-free beauty Ghana",
    "Eco-friendly cosmetics Ghana",
    "Holistic wellness products Ghana",
  ],

  // Women's Hair Growth (Niche Focused)
  womensHair: [
    "Hair growth oil for 4C hair",
    "How to grow edges fast Ghana",
    "Natural hair growth treatment Accra",
    "Natural hair growth treatment Winneba",
    "Natural hair growth treatment Cape Coast",
    "Natural hair growth treatment Tamale",
    "Natural hair growth treatment Takoradi",
    "Organic hair booster for women",
    "Sulphate-free shampoo Ghana",
    "Best hair growth pomade Ghana",
    "Chebe hair products in Ghana",
    "Deep conditioner for natural hair",
    "Hair vitamins for thickness Ghana",
    "Protective styling hair care",
    "Organic leave-in conditioner",
    "Hair growth serum for African hair",
    "Scalp treatment for dandruff Ghana",
    "Ayurvedic hair herbs Ghana",
    "Hair breakage treatment for women",
  ],

  // Grey Hair Niche
  greyHair: [
    "Organic grey hair treatment Ghana",
    "Natural remedy for premature greying",
    "Grey hair darkening pomade Ghana",
    "Herbal hair dye for black hair",
    "Organic shampoo for grey hair",
    "How to darken grey hair naturally",
    "Anti-greying hair serum Ghana",
    "Melanin boosting hair products",
    "Grey hair care for African textures",
    "Henna and Indigo mix Ghana",
  ],

  // Beard & Men's Grooming
  mensGrooming: [
    "Beard growth oil Ghana",
    "Best beard booster in Accra",
    "Organic beard kit for men",
    "How to grow a full beard naturally",
    "Beard softener for black men",
    "Patchy beard solution Ghana",
    "Men's facial hair growth serum",
    "Organic beard soap",
    "Beard grooming products Kumasi",
    "Luxury beard oil Ghana",
    "Thicker beard growth tips",
    "Beard itch relief organic",
    "Men's organic skincare Ghana",
    "Beard filler and growth products",
    "Sandalwood beard oil Ghana",
  ],

  // Facial & Skin Care
  skincare: [
    "Organic black soap for acne",
    "Organic body lotion for glowing skin",
    "Best face serum for hyperpigmentation",
    "Ghanaian organic face wash",
    "Natural skin brightening lotion",
    "Non-bleaching skin products",
    "Organic soap for sensitive skin",
    "Facial cleanser for oily skin Ghana",
    "Natural sun protection Ghana",
    "Organic moisturizer for dark skin",
    "Anti-aging organic face cream",
    "Vitamin C serum price in Ghana",
    "Organic honey soap Ghana",
    "Turmeric and ginger face mask",
    "Skin glowing supplements Ghana",
    "Handmade organic soaps Accra",
  ],

  // Supplements & Wellness
  supplements: [
    "Organic hair growth supplements Ghana",
    "Biotin for hair growth Accra",
    "Natural skin vitamins Ghana",
    "Organic wellness store Ghana",
    "Supplements for glowing skin",
    "Weight management organic tea",
    "Detox supplements Ghana",
    "Immune boosting organic products",
    "Herbal supplements for hair loss",
    "Collagen supplements Ghana price",
  ],

  // Local SEO & Shopping Intent
  local: [
    "Buy organic hair products online Ghana",
    "Organic beauty shop in Accra",
    "Fast delivery beauty products Ghana",
    "Organic skincare price in Ghana",
    "Natural hair products Kumasi",
    "Wholesale organic products Ghana",
    "Toroglo reviews Ghana",
    "Beauty delivery service Accra",
    "Organic cosmetics shop near me",
    "Cash on delivery beauty products Ghana",
  ],

  // Long-Tail & AI-Question Phrases
  longTail: [
    "Where can I buy organic hair growth oil in Accra?",
    "Best organic soap for glowing skin in Ghana",
    "How to grow my hair fast with natural products",
    "Which organic lotion is best for dark skin in Ghana?",
    "Is Toroglo organic hair oil safe for kids?",
    "Natural remedies for beard growth in Ghana",
    "Price of organic shampoo and conditioner in Ghana",
    "Organic skincare routine for Ghanaian weather",
    "Top 10 organic beauty brands in Ghana",
    "How to fix thinning hair naturally in Ghana",
  ],

  // Ingredients & Benefits
  ingredients: [
    "Raw Shea butter products",
    "Organic Cocoa butter lotion",
    "Moringa hair growth oil",
    "Neem oil for skin Ghana",
    "Aloe Vera facial gel",
    "Coconut oil for hair growth",
    "Essential oils for skin Ghana",
    "Paraben-free skin care",
    "100% natural ingredients",
    "Cruelty-free beauty Ghana",
  ],

  // Problem-Solution Keywords
  problemSolution: [
    "Treatment for receding hairline Ghana",
    "How to clear dark spots naturally",
    "Solution for itchy scalp Ghana",
    "Natural glow without bleaching",
    "Organic stretch mark oil Ghana",
    "Eczema relief organic soap",
    "Heat damage repair for hair",
    "Toning cream without chemicals",
    "Organic under-eye circle treatment",
    "Natural remedy for razor bumps",
  ],

  // Trending & Social Media Tags
  trending: [
    "#OrganicGhana",
    "#AccraBeauty",
    "#NaturalHairGhana",
    "#TorogloGlow",
    "#GhanaMadeBeauty",
    "#OrganicSkincareAccra",
    "#BeardGangGhana",
    "#HealthySkinGhana",
    "#GhanaianBeautyStore",
    "#OrganicLivingGhana",
  ],
};

/**
 * Get all keywords as a flat array
 */
export function getAllKeywords(): string[] {
  return Object.values(TOROGLO_KEYWORDS).flat();
}

/**
 * Get keywords for a specific category
 */
export function getKeywordsByCategory(category: keyof typeof TOROGLO_KEYWORDS): string[] {
  return TOROGLO_KEYWORDS[category] || [];
}

/**
 * Get keywords for meta tags (limited to most relevant)
 */
export function getMetaKeywords(): string {
  const relevant = [
    ...TOROGLO_KEYWORDS.core,
    ...TOROGLO_KEYWORDS.womensHair.slice(0, 5),
    ...TOROGLO_KEYWORDS.mensGrooming.slice(0, 5),
    ...TOROGLO_KEYWORDS.skincare.slice(0, 5),
    ...TOROGLO_KEYWORDS.local.slice(0, 3),
  ];
  return relevant.join(", ");
}
