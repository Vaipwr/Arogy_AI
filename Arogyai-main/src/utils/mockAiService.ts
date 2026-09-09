import { SkincareType } from '../components/SkincareApp';
import { AIStructuredResponse } from './aiService';

// Re-exporting the interface so we don't break imports if we remove aiService.ts later
// Ideally, this interface should be in a shared types file
export interface StructuredResponse extends AIStructuredResponse { }

const knowledgeBase: Record<string, { generic: StructuredResponse; ayurvedic: StructuredResponse }> = {
    acne: {
        generic: {
            info: "Acne is caused by clogged pores, excess oil production, and bacteria. Treatment focuses on unclogging pores and reducing inflammation.",
            products: [
                "Salicylic Acid Cleanser (2%)",
                "Benzoyl Peroxide Spot Treatment (2.5-5%)",
                "Oil-Free Non-Comedogenic Moisturizer",
                "Niacinamide Serum"
            ],
            precautions: [
                "Don't pick or pop pimples (causes scarring)",
                "Avoid scrubbing skin too hard",
                "Watch out for drying side effects",
                "Use SPF as treatments increase sun sensitivity"
            ],
            plans: [
                "Morning: Gentle Cleanse -> Niacinamide -> Moisturize -> SPF",
                "Evening: Salicylic Acid Cleanse -> Benzoyl Peroxide (spots) -> Moisturize"
            ],
            tips: [
                "Change pillowcases twice a week",
                "Keep hair off your face",
                "Avoid high-glycemic foods",
                "Stay hydrated"
            ],
            dietPlan: {
                breakfast: "Oatmeal with flaxseeds and berries",
                lunch: "Grilled salmon with leafy greens and quinoa",
                dinner: "Lentil soup with turmeric and sautéed spinach",
                snack: "Walnuts or a small piece of dark chocolate"
            }
        },
        ayurvedic: {
            info: "In Ayurveda, acne (Yuvana Pidakas) is caused by an imbalance in Pitta and Kapha doshas, leading to toxins (Ama) in the blood.",
            products: [
                "Neem and Turmeric Face Pack",
                "Sandalwood Paste",
                "Aloe Vera Gel",
                "Kumkumadi Tailam (Oil)"
            ],
            precautions: [
                "Avoid spicy, oily, and fermented foods",
                "Don't suppress natural urges",
                "Minimize sun exposure during mid-day",
                "Reduce stress (Pitta aggravating)"
            ],
            plans: [
                "Morning: Wash with Neem water -> Apply Aloe Vera -> Drink Warm Water",
                "Evening: Apply Sandalwood pack (15 min) -> Moisturize with Kumkumadi"
            ],
            tips: [
                "Drink water stored in a copper vessel",
                "Meditate for 10 minutes",
                "Sleep before 10 PM",
                "Practice cooling pranayama (Sitali)"
            ],
            dietPlan: {
                breakfast: "Stewed apples with cinnamon and cardamom",
                lunch: "Mung dal khichdi with cooling coconut and coriander",
                dinner: "Steamed zucchini and carrot soup with ghee",
                snack: "Soaked almonds (peeled) or sweet seasonal fruits"
            }
        }
    },
    dry_skin: {
        generic: {
            info: "Dry skin lacks oil and moisture, leading to a tight, flaky feeling. The goal is to repair the skin barrier and lock in hydration.",
            products: [
                "Creamy/Milky Cleanser (Non-foaming)",
                "Hyaluronic Acid Serum",
                "Ceramide-rich Moisturizer",
                "Facial Oil (Jojoba/Squalane)"
            ],
            precautions: [
                "Avoid hot water showers",
                "Avoid products with alcohol/fragrance",
                "Don't over-exfoliate",
                "Apply moisturizer on damp skin"
            ],
            plans: [
                "Morning: Water rinse only -> Hyaluronic Acid -> Moisturizer -> SPF",
                "Evening: Cream Cleanser -> Moisturizer -> Facial Oil"
            ],
            tips: [
                "Use a humidifier in your room",
                "Drink plenty of water",
                "Eat healthy fats (avocado, nuts)",
                "Pat skin dry, don't rub"
            ]
        },
        ayurvedic: {
            info: "Dry skin is a sign of Vata dosha accumulation. It needs nourishment (Snehana) with warm, heavy, and oily substances.",
            products: [
                "Sesame Oil or Almond Oil",
                "Milk and Honey Cleanser",
                "Shatavari or Ashwagandha Ghrita",
                "Rose Water Mist"
            ],
            precautions: [
                "Avoid cold, dry, and windy environments",
                "Skip drying clay masks",
                "Avoid caffeine and dry foods",
                "Don't skip oil massage"
            ],
            plans: [
                "Morning: Oil massage (Abhyanga) -> Warm bath -> Rose water",
                "Evening: Milk wash -> Almond oil massage"
            ],
            tips: [
                "Eat warm, cooked oily foods",
                "Include Ghee in diet",
                "Practice deep breathing (Pranayama)",
                "Sleep early to rejuvenate"
            ]
        }
    },
    oily_skin: {
        generic: {
            info: "Oily skin produces excess sebum, leading to shine and potential breakouts. The goal is to balance oil without stripping the skin.",
            products: [
                "Gel-based Foaming Cleanser",
                "Salicylic Acid Toner (BHA)",
                "Niacinamide Serum",
                "Lightweight Gel Moisturizer"
            ],
            precautions: [
                "Don't wash face more than twice daily",
                "Avoid heavy creams/oils",
                "Don't skip moisturizer (causes more oil)",
                "Use non-comedogenic makeup"
            ],
            plans: [
                "Morning: Gel Cleanse -> Niacinamide -> Gel Moisturizer -> SPF",
                "Evening: Double Cleanse -> BHA Toner -> Gel Moisturizer"
            ],
            tips: [
                "Use blotting papers during day",
                "Wash face after sweating",
                "Manage stress levels",
                "Limit sugary foods"
            ]
        },
        ayurvedic: {
            info: "Oily skin is aggravated Kapha dosha. It needs purification and light, drying herbs to absorb excess oil.",
            products: [
                "Multani Mitti (Fuller's Earth) Mask",
                "Besan (Gram Flour) Cleanser",
                "Rose Water Toner",
                "Neem Oil"
            ],
            precautions: [
                "Avoid dairy and fried foods",
                "Don't use heavy oils on face",
                "Avoid sleeping during the day",
                "Don't over-wash"
            ],
            plans: [
                "Morning: Besan wash -> Rose water",
                "Evening: Multani Mitti mask (2x week) -> Aloe Vera"
            ],
            tips: [
                "Drink warm ginger water",
                "Engage in active exercise",
                "Eat light, spicy, and bitter foods",
                "Scrub gently with oatmeal"
            ]
        }
    },
    aging: {
        generic: {
            info: "Aging skin loses collagen and elasticity. Focus is on cell turnover, hydration, and sun protection.",
            products: [
                "Gentle Hydrating Cleanser",
                "Retinol/Retinoid (Night)",
                "Vitamin C Serum (Day)",
                "Peptide Moisturizer",
                "Broad Spectrum SPF 50"
            ],
            precautions: [
                "Introduce Retinol slowly (start 2x week)",
                "Strict sun protection is mandatory",
                "Avoid pulling on skin",
                "Don't ignore neck and hands"
            ],
            plans: [
                "Morning: Cleanse -> Vitamin C -> Moisturizer -> SPF",
                "Evening: Cleanse -> Retinol -> Peptide Moisturizer"
            ],
            tips: [
                "Sleep on your back",
                "Wear sunglasses to prevent squinting lines",
                "Eat antioxidant-rich foods",
                "Stay consistent with routine"
            ]
        },
        ayurvedic: {
            info: "Aging (Jara) represents Vata dominance. Rasayana (Rejuvenation) therapy is used to nourish tissues and delay aging.",
            products: [
                "Kumkumadi Tailam (Saffron Oil)",
                "Saffron & Milk Mask",
                "Ghee (Clarified Butter)",
                "Amalaki (Amla) Powder"
            ],
            precautions: [
                "Avoid stress and staying up late",
                "Don't let skin get dry",
                "Avoid excessive travel/wind",
                "Limit dry and cold foods"
            ],
            plans: [
                "Morning: Oil massage -> Warm bath -> Saffron water",
                "Evening: Milk wash -> Kumkumadi Oil massage"
            ],
            tips: [
                "Consume Amla daily (Vitamin C)",
                "Practice Facial Yoga",
                "Meditate to reduce worry lines",
                "Daily self-massage (Abhyanga)"
            ]
        }
    },
    pigmentation: {
        generic: {
            info: "Hyper-pigmentation is caused by excess melanin production. Treatment focuses on inhibiting melanin and exfoliating surface spots.",
            products: [
                "Brightening Cleanser",
                "Vitamin C Serum",
                "Alpha Arbutin or Kojic Acid",
                "Glycolic Acid (AHA) Exfoliant",
                "Strict SPF 50+"
            ],
            precautions: [
                "Sun exposure will reverse all progress",
                "Be patient (takes 8-12 weeks)",
                "Don't pick at spots",
                "Avoid irritating products"
            ],
            plans: [
                "Morning: Cleanse -> Vitamin C -> Alpha Arbutin -> SPF",
                "Evening: Cleanse -> Glycolic Acid (alt nights) -> Moisturizer"
            ],
            tips: [
                "Wear wide-brimmed hats",
                "Reapply sunscreen every 2 hours",
                "Eat colorful vegetables",
                "Consider professional peels"
            ]
        },
        ayurvedic: {
            info: "Pigmentation (Vyanga) is a Pitta-Vata imbalance affecting blood tissue. Cooling and blood-purifying therapies are needed.",
            products: [
                "Manjistha Powder Mask",
                "Sandalwood Paste",
                "Licorice (Yashtimadhu) Root",
                "Potato Juice (Natural Bleach)"
            ],
            precautions: [
                "Avoid direct sun exposure",
                "Avoid hot and spicy foods",
                "Manage anger and stress",
                "Don't use lemon juice directly on sun"
            ],
            plans: [
                "Morning: Potato juice spot treat -> Rinse -> Aloe",
                "Evening: Manjistha & Honey mask -> Wash -> Rose oil"
            ],
            tips: [
                "Apply raw milk on spots",
                "Drink water kept in silver vessel",
                "Eat cooling fruits like pomegranate",
                "Do Pitta-pacifying yoga"
            ]
        }
    },
    sensitive: {
        generic: {
            info: "Sensitive skin reacts easily to products and environment. The goal is to soothe, repair the barrier, and avoid triggers.",
            products: [
                "Ultra-Gentle Cleanser (Soap-free)",
                "Centella Asiatica (Cica) Serum",
                "Panthenol (Vitamin B5) Cream",
                "Mineral Sunscreen (Zinc Oxide)"
            ],
            precautions: [
                "Avoid fragrance, alcohol, and dyes",
                "Patch test EVERYTHING",
                "Avoid hot water",
                "Skip harsh exfoliants"
            ],
            plans: [
                "Morning: Water rinse -> Cica Serum -> Moisturizer -> Mineral SPF",
                "Evening: Gentle Cleanse -> Panthenol Cream"
            ],
            tips: [
                "Wash clothes with hypoallergenic detergent",
                "Keep skincare simple (less is more)",
                "manage stress",
                "Identify your specific triggers"
            ]
        },
        ayurvedic: {
            info: "Sensitive skin is often high Pitta. It tends to be red, warm, and easily irritated. Cooling and soothing herbs are best.",
            products: [
                "Rose Water",
                "Coconut Oil",
                "Aloe Vera (Fresh)",
                "Sandalwood"
            ],
            precautions: [
                "Avoid fermented foods and vinegar",
                "Stay out of midday sun",
                "Avoid heating spices (chili, mustard)",
                "Don't use rough scrubs"
            ],
            plans: [
                "Morning: Rose water spray -> Coconut oil light layer",
                "Evening: Aloe Vera gel massage -> Cool water rinse"
            ],
            tips: [
                "Moon bathing (exposure to moonlight)",
                "Drink fennel seed water",
                "Wear cotton fabrics",
                "Use ghee in diet"
            ]
        }
    },
    glow: {
        generic: {
            info: "Dull skin can be caused by dehydration, poor cell turnover, or lack of sleep. The goal is to brighten and hydrate.",
            products: [
                "Vitamin C Serum (10-20%)",
                "Glycolic Acid Toner (AHA)",
                "Hyaluronic Acid Essence",
                "Radiance-boosting Moisturizer"
            ],
            precautions: [
                "Don't overuse acids (can cause irritation)",
                "Vitamin C is unstable; store in cool dark place",
                "Always wear SPF with AHAs",
                "Patch test first"
            ],
            plans: [
                "Morning: Cleanse -> Vitamin C -> Moisturizer -> SPF",
                "Evening: Double Cleanse -> AHA Toner -> Night Cream"
            ],
            tips: [
                "Exercise to improve blood circulation",
                "Eat Vitamin C rich foods (oranges, berries)",
                "Get 7-8 hours of sleep",
                "Exfoliate 1-2 times a week"
            ]
        },
        ayurvedic: {
            info: "Radiance (Tejas) comes from healthy digestion and balanced Pitta. Accumulation of toxins (Ama) causes dullness.",
            products: [
                "Kumkumadi Tailam (Saffron Oil)",
                "Ubtan (Chickpea & Turmeric Scrub)",
                "Rose Water",
                "Sandalwood & Milk Mask"
            ],
            precautions: [
                "Don't scrub too hard with Ubtan",
                "Avoid heavy, oily foods at night",
                "Ensure proper bowel movements",
                "Don't skip meals"
            ],
            plans: [
                "Morning: Ubtan wash -> Rose water",
                "Evening: Kumkumadi Oil massage (leave overnight)"
            ],
            tips: [
                "Drink warm water with lemon and honey",
                "Practice Surya Namaskar (Sun Salutation)",
                "Eat glowing foods: Almonds, Dates, Ghee",
                "Meditation for inner glow"
            ]
        }
    },
    dark_circles: {
        generic: {
            info: "Dark circles can be genetic, or due to thin skin, fatigue, or allergies. Caffeine and retinoids help.",
            products: [
                "Caffeine Eye Cream",
                "Retinol Eye Cream (low strength)",
                "Vitamin K Cream",
                "Hydrating Eye Gel"
            ],
            precautions: [
                "Eye skin is very delicate; tap gently",
                "Don't get retinol inside the eye",
                "Avoid rubbing eyes",
                "Sleep on your back if possible"
            ],
            plans: [
                "Morning: Caffeine Eye Cream -> SPF",
                "Evening: Retinol Eye Cream -> Sleep"
            ],
            tips: [
                "Cold compress/spoons in morning",
                "Reduce salt intake (reduces puffiness)",
                "Sleep with head slightly elevated",
                "Screen breaks every 20 mins"
            ]
        },
        ayurvedic: {
            info: "Dark circles often indicate Vata imbalance, stress, or lack of sleep. Nourishing oils and cooling packs help.",
            products: [
                "Almond Oil",
                "Cucumber Slices",
                "Rose Water Eye Pads",
                "Saffron Milk"
            ],
            precautions: [
                "Limit screen time especially at night",
                "Avoid staying awake late (Ratri Jagran)",
                "Don't strain eyes in low light",
                "Reduce caffeine intake"
            ],
            plans: [
                "Morning: Rose water eye packs (10 mins)",
                "Evening: Almond oil massage around eyes"
            ],
            tips: [
                "Place cold cucumber slices on eyes",
                "Practice Trataka (candle gazing) for eye health",
                "Netra Basti (professional treatment)",
                "Sleep by 10 PM"
            ]
        }
    }
};

const defaultResponse: { generic: StructuredResponse; ayurvedic: StructuredResponse } = {
    generic: {
        info: "I'm not sure I understand. I can help with Acne, Dryness, Oily skin, Aging, Pigmentation, Sensitivity, Dark Circles, and Glowing Skin. Try simple keywords like 'acne' or 'dry skin'.",
        products: ["Basic Cleanser", "Moisturizer", "Sunscreen"],
        precautions: ["Patch test new products", "Consult a doctor for severe issues"],
        plans: ["Morning: Cleanse -> Moisturize -> SPF", "Evening: Cleanse -> Moisturize"],
        tips: ["Stay hydrated", "Sleep well", "Eat a balanced diet"]
    },
    ayurvedic: {
        info: "I didn't quite catch that. I know remedies for Acne, Dryness, Pitta/Vata/Kapha issues, Aging, and Radiance. Try asking about 'pimples' or 'glowing skin'.",
        products: ["Aloe Vera", "Turmeric", "Neem"],
        precautions: ["Check for allergies", "Use natural organic ingredients"],
        plans: ["Morning: Warm water -> Herbs", "Evening: Oil massage"],
        tips: ["Follow Dinacharya (Daily Routine)", "Eat fresh foods"]
    }
};

export const generateMockResponse = (
    query: string,
    mode: SkincareType
): StructuredResponse => {
    const lowerQuery = query.toLowerCase().trim();

    // 0. Handle Greetings
    if (lowerQuery.match(/^(hi|hello|hey|greetings|hola|namaste)/)) {
        return {
            info: mode === 'ayurvedic'
                ? "Namaste! I am your Ayurvedic Skin Guide. Tell me about your skin concern (e.g., 'I have acne' or 'dry skin tips')."
                : "Hello! I'm your AI Skin Consultant. How can I help you today? (Try asking about 'acne', 'anti-aging', or 'routine').",
            products: [],
            precautions: [],
            plans: [],
            tips: ["Try being specific about your skin type or issue."]
        };
    }

    // 1. Acne / Pimples / Breakouts
    if (lowerQuery.match(/(acne|pimple|breakout|zit|comedones|whitehead|blackhead|clogged)/)) {
        return knowledgeBase.acne[mode];
    }

    // 2. Dry / Dehydrated / Flaky
    if (lowerQuery.match(/(dry|flake|flaky|rough|tight|dehydrated|parched|winter)/)) {
        return knowledgeBase.dry_skin[mode];
    }

    // 3. Oily / Greasy / Shine
    if (lowerQuery.match(/(oil|greasy|shine|shiny|sebum|grease|pore)/)) {
        return knowledgeBase.oily_skin[mode];
    }

    // 4. Aging / Wrinkles
    if (lowerQuery.match(/(age|aging|wrinkle|line|sag|firm|youth|mature|crow's feet)/)) {
        return knowledgeBase.aging[mode];
    }

    // 5. Pigmentation / Dark Spots / Scars
    if (lowerQuery.match(/(pigment|dark spot|sun spot|melasma|scar|blemish|discolor|uneven)/)) {
        return knowledgeBase.pigmentation[mode];
    }

    // 6. Sensitive / Redness
    if (lowerQuery.match(/(sensitive|red|rosacea|irritat|burn|sting|itch|reaction|allergy)/)) {
        return knowledgeBase.sensitive[mode];
    }

    // 7. Glow / Dullness / Brightening
    if (lowerQuery.match(/(glow|dull|bright|radiant|radiance|party|pale|tired)/)) {
        return knowledgeBase.glow[mode];
    }

    // 8. Dark Circles / Puffy Eyes
    if (lowerQuery.match(/(dark circle|eye|puffy|bag|sleep)/)) {
        return knowledgeBase.dark_circles[mode];
    }

    return defaultResponse[mode];
};
