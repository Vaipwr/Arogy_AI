// Diet and nutrition plan generator dynamically tailored to detected skin conditions

export interface MealPlan {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  benefits: string[];
  calories: number;
  prepTime: number;
  skinBenefit: string;
}

export interface AvoidFoodItem {
  name: string;
  reason: string;
}

export interface SkinBenefitsInfo {
  conditionTitle: string;
  conditionPoints: string[];
  generalTitle: string;
  generalPoints: string[];
}

export interface ActiveDietPlanMeals {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

// Normalize disease string into a category key
export function normalizeCondition(conditionName?: string): string {
  if (!conditionName) return 'general';
  const lower = conditionName.toLowerCase();
  if (lower.includes('acne')) return 'acne';
  if (lower.includes('psoriasis')) return 'psoriasis';
  if (lower.includes('eczema') || lower.includes('atopic')) return 'eczema';
  if (lower.includes('rosacea')) return 'rosacea';
  if (lower.includes('tinea') || lower.includes('fungal') || lower.includes('ringworm')) return 'fungal';
  if (lower.includes('candida')) return 'candida';
  if (lower.includes('vitiligo')) return 'vitiligo';
  if (lower.includes('lupus') || lower.includes('vasculitis')) return 'autoimmune';
  if (lower.includes('lichen')) return 'lichen';
  if (lower.includes('keratosis') || lower.includes('sun') || lower.includes('photo')) return 'sun_damage';
  if (lower.includes('bullous')) return 'bullous';
  return 'general';
}

// 1. Generate Condition-Specific Active Diet Plan (Breakfast, Lunch, Dinner, Snack)
export function generateActiveDietPlan(conditionName?: string): ActiveDietPlanMeals {
  const norm = normalizeCondition(conditionName);

  switch (norm) {
    case 'acne':
      return {
        breakfast: 'Berry & Spinach Chia Bowl with Pumpkin Seeds (Zinc-Rich, Low-Glycemic)',
        lunch: 'Salmon & Quinoa Salad with Sliced Avocado, Cucumber, and Olive Oil Dressing',
        dinner: 'Baked Turmeric Lemon Chicken with Steamed Broccoli and Sweet Potato',
        snack: 'Handful of Raw Walnuts with Antioxidant Green Tea',
      };

    case 'psoriasis':
      return {
        breakfast: 'Warm Steel-Cut Oatmeal with Blueberries, Ground Flaxseeds & Almond Butter (Omega-3)',
        lunch: 'Mediterranean Lentil Salad with Mixed Greens, Walnuts, and Cold-Pressed Olive Oil',
        dinner: 'Wild-Caught Salmon Fillet with Turmeric-Roasted Sweet Potatoes & Steamed Asparagus',
        snack: 'Sliced Crisp Apple with Natural Walnut Butter or Carrot Sticks with Tahini',
      };

    case 'eczema':
      return {
        breakfast: 'Papaya, Blueberry & Flaxseed Smoothie with Fortified Coconut Milk (Quercetin & Omega-3)',
        lunch: 'Warm Quinoa & Bone Broth Bowl with Steamed Zucchini, Sweet Potato, and Olive Oil',
        dinner: 'Poached Cod Fillet or Lentil Stew with Steamed Green Beans, Carrots, and Brown Rice',
        snack: 'Fresh Blueberries with Lightly Toasted Pumpkin Seeds',
      };

    case 'rosacea':
      return {
        breakfast: 'Cooling Coconut Milk Oatmeal with Chia Seeds, Sliced Pears, and Mint (Anti-Flushing)',
        lunch: 'Chilled Quinoa, Cucumber, and Spinach Salad with Avocado and Pumpkin Seeds',
        dinner: 'Mild Steamed White Fish with Bok Choy, Jasmine Rice, and Coconut Aminos Dressing',
        snack: 'Fresh Watermelon Slices and Soothing Iced Chamomile Tea',
      };

    case 'fungal':
    case 'candida':
      return {
        breakfast: 'Sugar-Free Probiotic Greek Yogurt with Crushed Walnuts and Ground Pumpkin Seeds',
        lunch: 'Garlic & Herb Grilled Chicken Breast Salad with Olive Oil, Spinach, and Radishes',
        dinner: 'Baked Salmon with Steamed Cauliflower Mash and Sautéed Garlic Kale',
        snack: 'Fresh Celery Sticks with Fresh Guacamole and Pau d\'Arco Herbal Tea',
      };

    case 'vitiligo':
      return {
        breakfast: 'Folic Acid & B12 Rich Oatmeal with Soaked Walnuts, Figs, and Pumpkin Seeds',
        lunch: 'Lentil & Spinach Dal with Brown Rice, Grated Carrot Salad, and Cold-Pressed Olive Oil',
        dinner: 'Grilled Salmon or Tofu with Steamed Broccoli, Roasted Beets, and Chickpeas',
        snack: 'Handful of Soaked Almonds with Fresh Amla (Indian Gooseberry) Juice',
      };

    case 'autoimmune':
    case 'lichen':
      return {
        breakfast: 'Anti-Inflammatory Chia Seed Pudding with Blueberries, Walnuts, and Almond Milk',
        lunch: 'Warm Mediterranean Lentil & Kale Soup with Extra Virgin Olive Oil and Lemon',
        dinner: 'Wild Salmon Fillet with Steamed Zucchini, Sweet Potato, and Golden Turmeric',
        snack: 'Sliced Cucumber with Fresh Avocado Guacamole and Hibiscus Tea',
      };

    case 'sun_damage':
      return {
        breakfast: 'Lycopene-Packed Pink Grapefruit & Berry Bowl with Flaxseeds and Green Tea',
        lunch: 'Mediterranean Sardine or Salmon Salad with Dark Leafy Greens and Olive Oil',
        dinner: 'Grilled Chicken or Tofu with Steamed Bell Peppers, Tomatoes, and Brown Rice',
        snack: 'Handful of Mixed Berries and Cup of High-EGCG Green Tea',
      };

    default:
      return {
        breakfast: 'Anti-Inflammatory Smoothie Bowl with Blueberries, Spinach, Chia Seeds & Turmeric',
        lunch: 'Salmon & Quinoa Bowl with Sliced Avocado, Cucumber, and Fresh Lemon',
        dinner: 'Turmeric Lentil Curry with Coconut Milk, Fresh Spinach, and Ginger',
        snack: 'Green Tea with Handful of Raw Almonds and Walnuts',
      };
  }
}

// 2. Generate Condition-Specific Avoid Foods
export function generateAvoidFoods(conditionName?: string): AvoidFoodItem[] {
  const norm = normalizeCondition(conditionName);

  switch (norm) {
    case 'acne':
      return [
        { name: 'Dairy & Skim Milk', reason: 'Elevates IGF-1 hormone levels which trigger excess sebum secretion and follicular clogging' },
        { name: 'High-Glycemic Foods & Refined Sugars', reason: 'Cause rapid insulin spikes that stimulate pore inflammation and oil production' },
        { name: 'Whey Protein Supplements', reason: 'Promotes androgenic activity, accelerating the development of comedones' },
        { name: 'Deep-Fried Foods & Trans Fats', reason: 'Promote systemic oxidative stress and lipid oxidation within facial pores' },
        { name: 'Excessive Alcohol', reason: 'Dehydrates skin tissue and impairs hepatic clearance of inflammatory toxins' }
      ];

    case 'psoriasis':
      return [
        { name: 'Nightshade Vegetables (Tomatoes, Eggplant, Peppers)', reason: 'Contain solanine, an alkaloid that can trigger psoriatic flare-ups and joint inflammation' },
        { name: 'Red Meat & Saturated Animal Fats', reason: 'Rich in arachidonic acid which directly fuels psoriatic plaque inflammation and scaling' },
        { name: 'Alcohol & Beer', reason: 'Triggers systemic vasodilation, liver stress, and immune-mediated flare-ups' },
        { name: 'Ultra-Processed Foods & Refined Sugar', reason: 'Drive chronic systemic inflammation and rapid, abnormal skin keratinocyte turnover' },
        { name: 'Gluten & Dairy (if sensitive)', reason: 'May increase intestinal permeability and heighten systemic immune reactivity' }
      ];

    case 'eczema':
      return [
        { name: 'High-Histamine Foods (Aged cheeses, cured meats, wine)', reason: 'Can provoke intense cutaneous itching and exacerbate atopic dermatitis flares' },
        { name: 'Dairy & Eggs', reason: 'Common food allergens known to trigger eczema flares in sensitized individuals' },
        { name: 'Artificial Preservatives & Food Colorings', reason: 'Known chemical irritants that heighten immune hypersensitivity and flare severity' },
        { name: 'Excessive Citrus & Nightshades', reason: 'Can provoke contact tingling and irritate active erythematous eczema patches' },
        { name: 'Refined Sugars & Sweetened Drinks', reason: 'Disrupt gut microbiome balance and weaken skin epidermal barrier defenses' }
      ];

    case 'rosacea':
      return [
        { name: 'Spicy Foods & Chili Peppers', reason: 'Capsaicin causes immediate facial vasodilation, severe flushing, and stinging' },
        { name: 'Alcohol (especially Red Wine)', reason: 'Potent vasodilator that provokes persistent facial erythema and capillary leakage' },
        { name: 'Hot-Temperature Soups & Beverages', reason: 'Thermal heat activates facial vascular reflex arcs, worsening redness' },
        { name: 'Cinnamaldehyde Foods (Tomatoes, Citrus, Cocoa)', reason: 'Can stimulate neurovascular flushing episodes in rosacea-prone skin' },
        { name: 'Aged & Fermented Foods', reason: 'High histamine content triggers facial warmth, redness, and papulopustules' }
      ];

    case 'fungal':
    case 'candida':
      return [
        { name: 'Refined Sugars & Syrups', reason: 'Directly nourish superficial dermatophyte and Candida fungal cell proliferation' },
        { name: 'High-Yeast Baked Breads & Pastries', reason: 'Encourage fungal overgrowth and disrupt epidermal microbiome equilibrium' },
        { name: 'Beer, Wine & Fermented Alcohols', reason: 'Disrupt gut and cutaneous microbiota, accelerating fungal propagation' },
        { name: 'High-Sugar Dried Fruits & Fruit Juices', reason: 'Cause blood glucose surges that feed cutaneous fungal microbes' },
        { name: 'Refined White Flour & Starches', reason: 'Rapidly convert to simple sugars that support fungal growth in warm skin folds' }
      ];

    case 'vitiligo':
      return [
        { name: 'Excessive High-Dose Vitamin C (>1000mg)', reason: 'High-dose ascorbic acid can inhibit tyrosinase activity and interfere with melanin synthesis' },
        { name: 'Ultra-Processed Foods & Additives', reason: 'Increase oxidative stress and free radical damage to vulnerable melanocytes' },
        { name: 'Sour / Fermented Curds & Heavy Pickles', reason: 'Regarded in holistic medicine as incompatible (Viruddha Ahara) for depigmenting skin' },
        { name: 'Heavy Alcohol Consumption', reason: 'Depletes zinc, selenium, and copper micronutrients required for melanogenesis' },
        { name: 'Refined Vegetable Oils', reason: 'High omega-6 content promotes oxidative cascades that threaten melanocyte viability' }
      ];

    case 'autoimmune':
    case 'lichen':
      return [
        { name: 'Alfalfa Sprouts & Mung Bean Sprouts', reason: 'Contain L-canavanine which stimulates auto-antibodies and triggers systemic flares' },
        { name: 'High-Sodium Processed Snacks', reason: 'Elevates blood pressure and exacerbates vascular endothelial inflammation' },
        { name: 'Red Meat & Trans Fatty Acids', reason: 'Promote inflammatory prostaglandin synthesis and connective tissue stress' },
        { name: 'Artificial Sweeteners (Aspartame/Sucralose)', reason: 'Trigger inflammatory immune signaling and gut barrier disruption' },
        { name: 'Excessive Alcohol', reason: 'Interacts negatively with medications and compromises hepatic antioxidant defense' }
      ];

    default:
      return [
        { name: 'Dairy products', reason: 'May trigger skin inflammation and pore congestion in sensitive individuals' },
        { name: 'High-glycemic foods', reason: 'Can increase systemic inflammation and elevate oil production' },
        { name: 'Processed sugar', reason: 'Contributes to advanced glycation end-products (AGEs) and premature skin aging' },
        { name: 'Trans fats & fried items', reason: 'Increase systemic inflammation and degrade skin cellular integrity' },
        { name: 'Excessive alcohol', reason: 'Dehydrates skin tissue and depletes essential micronutrient reserves' }
      ];
  }
}

// 3. Generate Weekly Meal Plans (Monday through Sunday)
export function generateWeeklyMealPlans(conditionName?: string): Record<string, MealPlan[]> {
  const norm = normalizeCondition(conditionName);
  const target = conditionName || 'Skin Health';

  // Condition-specific details for benefits and descriptions
  const benefitBadge = 
    norm === 'acne' ? 'Reduces acne inflammation & regulates oil' :
    norm === 'psoriasis' ? 'Calms psoriatic scaling & reduces plaque inflammation' :
    norm === 'eczema' ? 'Soothes itching & restores moisture barrier' :
    norm === 'rosacea' ? 'Prevents facial flushing & calms capillaries' :
    norm === 'fungal' || norm === 'candida' ? 'Inhibits fungal proliferation & supports microbiome' :
    norm === 'vitiligo' ? 'Supports melanocyte nutrition & antioxidant defense' :
    norm === 'autoimmune' ? 'Modulates immune pathways & reduces systemic inflammation' :
    `Promotes ${target} repair and cellular hydration`;

  return {
    monday: [
      {
        id: 'mon-1',
        name: norm === 'rosacea' ? 'Cooling Coconut Chia Bowl' : 'Anti-Inflammatory Smoothie Bowl',
        category: 'breakfast',
        ingredients: ['Blueberries', 'Spinach', 'Almond milk', 'Chia seeds', 'Turmeric'],
        benefits: ['Rich in antioxidants', 'Anti-inflammatory', 'High in omega-3'],
        calories: 320,
        prepTime: 10,
        skinBenefit: benefitBadge
      },
      {
        id: 'mon-2',
        name: 'Wild Salmon & Quinoa Salad',
        category: 'lunch',
        ingredients: ['Wild salmon', 'Quinoa', 'Avocado', 'Cucumber', 'Cold-pressed olive oil'],
        benefits: ['Omega-3 fatty acids', 'Complete plant protein', 'Healthy monounsaturated fats'],
        calories: 485,
        prepTime: 20,
        skinBenefit: `Promotes cellular repair and hydration for ${target}`
      },
      {
        id: 'mon-3',
        name: 'Turmeric Lentil & Vegetable Curry',
        category: 'dinner',
        ingredients: ['Red lentils', 'Turmeric', 'Coconut milk', 'Spinach', 'Ginger'],
        benefits: ['Anti-inflammatory spices', 'Plant protein', 'High prebiotic fiber'],
        calories: 420,
        prepTime: 25,
        skinBenefit: 'Calms irritated skin and supports gut microbiome'
      },
      {
        id: 'mon-4',
        name: 'Green Tea & Raw Walnuts',
        category: 'snack',
        ingredients: ['Organic green tea', 'Almonds', 'Walnuts'],
        benefits: ['Polyphenol antioxidants', 'Healthy fats', 'Vitamin E'],
        calories: 180,
        prepTime: 5,
        skinBenefit: 'Protects skin against cellular oxidative stress'
      }
    ],

    tuesday: [
      {
        id: 'tue-1',
        name: 'Berry Chia Seed Pudding with Ground Flax',
        category: 'breakfast',
        ingredients: ['Chia seeds', 'Almond milk', 'Blueberries', 'Ground flaxseeds'],
        benefits: ['High omega-3 content', 'Prebiotic fiber', 'Rich in anthocyanins'],
        calories: 295,
        prepTime: 10,
        skinBenefit: 'Supports epidermal barrier hydration and cell turnover'
      },
      {
        id: 'tue-2',
        name: 'Mediterranean Rainbow Salad with Chickpeas',
        category: 'lunch',
        ingredients: ['Chickpeas', 'Mixed greens', 'Olive oil', 'Cucumber', 'Pumpkin seeds'],
        benefits: ['Zinc-rich seeds', 'Bioflavonoids', 'Sustained energy'],
        calories: 390,
        prepTime: 15,
        skinBenefit: `Nourishes skin tissue and calms ${target}`
      },
      {
        id: 'tue-3',
        name: 'Herb-Poached Cod with Steamed Greens & Sweet Potato',
        category: 'dinner',
        ingredients: ['Cod fillet', 'Sweet potato', 'Broccoli', 'Olive oil', 'Lemon'],
        benefits: ['Lean bioavailable protein', 'Beta-carotene', 'Vitamin C'],
        calories: 440,
        prepTime: 25,
        skinBenefit: 'Aids collagen synthesis and calm skin regeneration'
      },
      {
        id: 'tue-4',
        name: 'Sliced Pear & Raw Pumpkin Seeds',
        category: 'snack',
        ingredients: ['Fresh pear', 'Raw pumpkin seeds'],
        benefits: ['High in dietary zinc', 'Gentle hydration', 'Digestive enzymes'],
        calories: 160,
        prepTime: 5,
        skinBenefit: 'Delivers bioavailable zinc for tissue healing'
      }
    ],

    wednesday: [
      {
        id: 'wed-1',
        name: 'Steel-Cut Oatmeal with Blueberries & Cinnamon',
        category: 'breakfast',
        ingredients: ['Steel-cut oats', 'Blueberries', 'Walnuts', 'Almond milk'],
        benefits: ['Low-glycemic carbohydrates', 'Beta-glucans', 'Polyphenols'],
        calories: 330,
        prepTime: 15,
        skinBenefit: 'Stabilizes blood sugar and reduces inflammatory triggers'
      },
      {
        id: 'wed-2',
        name: 'Avocado & Herb Roasted Chicken/Tofu Bowl',
        category: 'lunch',
        ingredients: ['Grilled chicken or tofu', 'Avocado', 'Brown rice', 'Spinach', 'Lime'],
        benefits: ['Glutathione precursors', 'Healthy lipid matrix', 'Vitamin E'],
        calories: 460,
        prepTime: 20,
        skinBenefit: 'Reinforces stratum corneum lipid barrier'
      },
      {
        id: 'wed-3',
        name: 'Vegetable Minestrone with Dark Leafy Greens',
        category: 'dinner',
        ingredients: ['Zucchini', 'Carrots', 'Cannellini beans', 'Kale', 'Garlic broth'],
        benefits: ['Rich mineral broth', 'Prebiotic fibers', 'Antioxidants'],
        calories: 390,
        prepTime: 30,
        skinBenefit: `Flushes metabolic waste and soothes ${target}`
      },
      {
        id: 'wed-4',
        name: 'Chamomile Infusion & Soaked Almonds',
        category: 'snack',
        ingredients: ['Chamomile flowers', 'Soaked almonds'],
        benefits: ['Apigenin bioflavonoid', 'Vitamin E', 'Gentle neuro-calming'],
        calories: 150,
        prepTime: 5,
        skinBenefit: 'Reduces cutaneous stress-induced inflammatory spikes'
      }
    ],

    thursday: [
      {
        id: 'thu-1',
        name: 'Papaya & Spinach Green Detox Smoothie',
        category: 'breakfast',
        ingredients: ['Papaya', 'Baby spinach', 'Coconut water', 'Hemp hearts'],
        benefits: ['Papain enzyme', 'Chlorophyll', 'Essential fatty acids'],
        calories: 280,
        prepTime: 8,
        skinBenefit: 'Promotes micro-circulation and dermal clarification'
      },
      {
        id: 'thu-2',
        name: 'Warm Quinoa & Steamed Zucchini Power Bowl',
        category: 'lunch',
        ingredients: ['Quinoa', 'Steamed zucchini', 'Lentils', 'Extra virgin olive oil', 'Turmeric'],
        benefits: ['Curcumin absorption', 'Amino acid spectrum', 'Gentle digestion'],
        calories: 430,
        prepTime: 20,
        skinBenefit: benefitBadge
      },
      {
        id: 'thu-3',
        name: 'Baked Wild Salmon with Asparagus Spears',
        category: 'dinner',
        ingredients: ['Wild salmon', 'Asparagus', 'Herbed baby potatoes', 'Lemon'],
        benefits: ['EPA/DHA fatty acids', 'Glutathione', 'Low inflammatory index'],
        calories: 470,
        prepTime: 25,
        skinBenefit: 'Suppresses inflammatory cytokine production in skin'
      },
      {
        id: 'thu-4',
        name: 'Cucumber Slices with Creamy Tahini Dip',
        category: 'snack',
        ingredients: ['Crisp cucumber', 'Sesame tahini', 'Lemon'],
        benefits: ['Silicon & sulfur minerals', 'Healthy fats', 'Deep hydration'],
        calories: 160,
        prepTime: 5,
        skinBenefit: 'Enhances dermal hydration and elasticity'
      }
    ],

    friday: [
      {
        id: 'fri-1',
        name: 'Anti-Inflammatory Golden Turmeric Porridge',
        category: 'breakfast',
        ingredients: ['Rolled oats', 'Turmeric', 'Ginger', 'Almond milk', 'Chia seeds'],
        benefits: ['Potent curcuminoids', 'Gingerols', 'Fiber'],
        calories: 310,
        prepTime: 12,
        skinBenefit: 'Inhibits inflammatory pathways (NF-kB) to calm flare-ups'
      },
      {
        id: 'fri-2',
        name: 'Grilled Sardine or Mackerel Brown Rice Bowl',
        category: 'lunch',
        ingredients: ['Sardines/mackerel', 'Brown rice', 'Shredded carrots', 'Arugula', 'Olive oil'],
        benefits: ['Highest natural omega-3s', 'Vitamin D', 'Calcium'],
        calories: 480,
        prepTime: 15,
        skinBenefit: `Promotes rapid tissue re-epithelialization for ${target}`
      },
      {
        id: 'fri-3',
        name: 'Spiced Lentil & Sweet Potato Coconut Stew',
        category: 'dinner',
        ingredients: ['Red lentils', 'Sweet potato', 'Coconut milk', 'Coriander', 'Spinach'],
        benefits: ['Vitamin A precursor', 'Gentle nourishment', 'Anti-inflammatory'],
        calories: 410,
        prepTime: 30,
        skinBenefit: 'Boosts cell turnover and reinforces skin resilience'
      },
      {
        id: 'fri-4',
        name: 'Fresh Blueberries with Brazil Nuts',
        category: 'snack',
        ingredients: ['Fresh blueberries', 'Brazil nuts (2 pieces)'],
        benefits: ['Natural selenium', 'Resveratrol', 'Anthocyanins'],
        calories: 170,
        prepTime: 3,
        skinBenefit: 'Provides selenium to activate skin antioxidant enzymes'
      }
    ],

    saturday: [
      {
        id: 'sat-1',
        name: 'Avocado Toast on Sprouted Grain with Microgreens',
        category: 'breakfast',
        ingredients: ['Sprouted whole grain bread', 'Ripe avocado', 'Sunflower microgreens', 'Hemp seeds'],
        benefits: ['Monounsaturated fats', 'Enzyme-rich greens', 'Vitamin E'],
        calories: 340,
        prepTime: 10,
        skinBenefit: 'Nourishes lipid bi-layer and reduces cutaneous irritation'
      },
      {
        id: 'sat-2',
        name: 'Rainbow Veggie & Quinoa Nourish Plate',
        category: 'lunch',
        ingredients: ['Quinoa', 'Roasted beets', 'Steamed green beans', 'Avocado', 'Lemon tahini'],
        benefits: ['Betalains', 'Phytonutrient diversity', 'Plant minerals'],
        calories: 420,
        prepTime: 20,
        skinBenefit: `Provides broad-spectrum antioxidants against ${target}`
      },
      {
        id: 'sat-3',
        name: 'Steamed Halibut or Tofu with Ginger-Bok Choy',
        category: 'dinner',
        ingredients: ['Halibut or firm tofu', 'Baby bok choy', 'Fresh ginger', 'Jasmine rice', 'Sesame oil'],
        benefits: ['Ultra-clean lean protein', 'Gingerol anti-inflammatory', 'Digestive ease'],
        calories: 430,
        prepTime: 20,
        skinBenefit: 'Aids evening cellular detox and restorative healing'
      },
      {
        id: 'sat-4',
        name: 'Iced Hibiscus Tea with Raw Walnuts',
        category: 'snack',
        ingredients: ['Organic hibiscus tea', 'Walnuts'],
        benefits: ['High vitamin C', 'Anthocyanins', 'Omega-3 ALA'],
        calories: 160,
        prepTime: 5,
        skinBenefit: 'Assists capillary tone and collagen integrity'
      }
    ],

    sunday: [
      {
        id: 'sun-1',
        name: 'Antioxidant Berry-Acai Protein Parfait',
        category: 'breakfast',
        ingredients: ['Unsweetened almond/coconut yogurt', 'Acai puree', 'Chia seeds', 'Fresh berries'],
        benefits: ['High ORAC antioxidant score', 'Probiotics', 'Zero refined sugar'],
        calories: 310,
        prepTime: 8,
        skinBenefit: 'Restores healthy epidermal microbiota and barrier defence'
      },
      {
        id: 'sun-2',
        name: 'Mediterranean Poached Salmon & Asparagus Salad',
        category: 'lunch',
        ingredients: ['Cold poached salmon', 'Blanched asparagus', 'Mixed greens', 'Olive oil', 'Lemon'],
        benefits: ['Omega-3 fatty acids', 'Prebiotic inulin', 'Glutathione'],
        calories: 450,
        prepTime: 20,
        skinBenefit: benefitBadge
      },
      {
        id: 'sun-3',
        name: 'Hearty Turmeric Vegetable & Chickpea Bowl',
        category: 'dinner',
        ingredients: ['Chickpeas', 'Turmeric', 'Zucchini', 'Carrots', 'Brown rice', 'Coriander'],
        benefits: ['Zinc & copper balance', 'Clean plant fiber', 'Anti-inflammatory'],
        calories: 400,
        prepTime: 25,
        skinBenefit: `Strengthens tissue repair and calms ${target}`
      },
      {
        id: 'sun-4',
        name: 'Crisp Apple Slices with Natural Almond Butter',
        category: 'snack',
        ingredients: ['Crisp apple', 'Almond butter'],
        benefits: ['Quercetin bioflavonoid', 'Healthy fats', 'Pectin fiber'],
        calories: 190,
        prepTime: 5,
        skinBenefit: 'Quercetin reduces mast-cell histamine and redness'
      }
    ]
  };
}

// 4. Generate Condition-Specific Skin Benefits for Nutrition Tab
export function generateSkinBenefits(conditionName?: string): SkinBenefitsInfo {
  const norm = normalizeCondition(conditionName);
  const target = conditionName || 'Your Skin Health';

  switch (norm) {
    case 'acne':
      return {
        conditionTitle: `For ${target} Management`,
        conditionPoints: [
          'Low-glycemic foods regulate insulin spikes and curb excess sebum secretion',
          'Bioavailable zinc (seeds, lentils) calms follicular inflammation and accelerates healing',
          'Omega-3 fatty acids prevent lipid oxidation and reduce pore-blocking comedones'
        ],
        generalTitle: 'Skin Barrier & Recovery',
        generalPoints: [
          'Antioxidant polyphenols shield skin lipids against environmental oxidation',
          'Adequate hydration flushes metabolic waste and keeps pores unclogged',
          'Probiotic foods support gut-skin axis equilibrium and reduce inflammatory breakouts'
        ]
      };

    case 'psoriasis':
      return {
        conditionTitle: `For ${target} & Plaque Management`,
        conditionPoints: [
          'High omega-3 fatty acids (salmon, flaxseeds) dampen systemic TNF-alpha and reduce plaque scaling',
          'Curcumin and ginger inhibit the NF-kB inflammatory cascade responsible for rapid keratinocyte turnover',
          'Elimination of nightshades and alcohol significantly reduces cutaneous flare-up frequency'
        ],
        generalTitle: 'Systemic Cellular Health',
        generalPoints: [
          'Anti-inflammatory Mediterranean foods help protect cardiovascular and joint wellness',
          'Adequate daily hydration prevents skin dehydration and soothes cracked, dry plaques',
          'Antioxidants from berries protect dermal connective tissue from oxidative stress'
        ]
      };

    case 'eczema':
      return {
        conditionTitle: `For ${target} & Barrier Defense`,
        conditionPoints: [
          'Essential fatty acids (GLA, EPA, DHA) directly replenish depleted stratum corneum ceramides',
          'Quercetin-rich foods (apples, blueberries) stabilize mast cells and soothe persistent pruritus',
          'Avoiding high-histamine and processed foods prevents acute erythema and burning sensations'
        ],
        generalTitle: 'Barrier Repair & Hydration',
        generalPoints: [
          'Prebiotic and probiotic nutrition promotes an immune-protective gut-skin axis',
          'Deep cellular hydration keeps skin tissue supple and resistant to cracking',
          'Vitamin C and zinc accelerate microscopic wound repair from scratching'
        ]
      };

    case 'rosacea':
      return {
        conditionTitle: `For ${target} & Capillary Calming`,
        conditionPoints: [
          'Cooling, non-thermal foods prevent reflex vasodilation and persistent facial flushing',
          'Avoiding chili peppers and alcohol protects delicate facial capillaries from rupture',
          'Bioflavonoids (rutin, anthocyanins) reinforce microvascular wall integrity'
        ],
        generalTitle: 'Vascular & Digestive Calm',
        generalPoints: [
          'Anti-inflammatory fats nourish skin without provoking neurovascular triggers',
          'Hydration with room-temperature clean water prevents dehydration-induced skin sensitivity',
          'Gentle, easy-to-digest whole foods support a calm digestive and metabolic system'
        ]
      };

    case 'fungal':
    case 'candida':
      return {
        conditionTitle: `For ${target} Defense`,
        conditionPoints: [
          'Sugar-free whole food nutrition cuts off the simple glucose supply needed by fungal cells',
          'Raw garlic (allicin) and oregano provide proven internal natural antifungal compounds',
          'Probiotic-rich plain yogurt and kefir reinforce protective cutaneous microbiota'
        ],
        generalTitle: 'Microbiome & Immunity',
        generalPoints: [
          'Adequate clean water supports cellular metabolic waste elimination',
          'Zinc and vitamin C fortify white blood cell phagocytic activity against fungal pathogens',
          'High-fiber vegetables nourish beneficial intestinal flora that outcompete yeasts'
        ]
      };

    case 'vitiligo':
      return {
        conditionTitle: `For ${target} & Melanocyte Support`,
        conditionPoints: [
          'Folic acid and vitamin B12 support cellular methylation and healthy melanocyte function',
          'Copper and zinc-rich foods provide essential cofactors for the tyrosinase enzyme',
          'High antioxidant intake protects melanocyte membranes against free radical auto-toxicity'
        ],
        generalTitle: 'Antioxidant & Immune Balance',
        generalPoints: [
          'Omega-3 fatty acids help modulate autoimmune and inflammatory reactivity',
          'Hydration with clean water supports optimal dermal cellular metabolism',
          'Balanced whole foods ensure steady micronutrient absorption without dietary stress'
        ]
      };

    default:
      return {
        conditionTitle: `For ${target} Optimization`,
        conditionPoints: [
          'Antioxidant-dense berries and greens neutralize free radicals and promote cellular longevity',
          'Omega-3 fatty acids from fish and seeds maintain skin moisture and suppress inflammation',
          'Zinc and vitamins A, C, E support rapid skin tissue repair and balanced collagen synthesis'
        ],
        generalTitle: 'Overall Skin Barrier & Hydration',
        generalPoints: [
          'Drinking 2-3 liters of clean water daily maintains optimal cellular turgor and resilience',
          'Low-glycemic whole foods stabilize blood sugar and prevent collagen glycation (AGEs)',
          'Probiotic foods support gut-skin health for clear, vibrant, and resilient skin'
        ]
      };
  }
}
