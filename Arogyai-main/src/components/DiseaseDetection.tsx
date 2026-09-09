import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { HealthProfile, DetectedCondition } from './EnhancedSkinHealthApp';
import { 
  Camera, Upload, ArrowLeft, AlertTriangle, CheckCircle, 
  Info, Zap, FileImage, X, Eye, Download, RefreshCw, AlertCircle
} from 'lucide-react';
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const PREDICT_API_URL = `${BACKEND_BASE.replace(/\/$/, '')}/predict`;

interface DiseaseDetectionProps {
  onConditionDetected: (condition: DetectedCondition) => void;
  onBack: () => void;
  healthProfile?: HealthProfile | null;
  skincareType?: import('./EnhancedSkinHealthApp').SkincareType;
}

interface LowConfidenceResult {
  confidence: number | null;
  message: string;
  medicalNotice?: string;
}

// Disease knowledge database for the 22 trained classes
interface ConditionInfo {
  formattedName: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  treatments: string[];
  dietRecommendations: string[];
}

const CONDITION_KNOWLEDGE: Record<string, ConditionInfo> = {
  Acne: {
    formattedName: 'Acne Vulgaris',
    severity: 'moderate',
    description: 'Inflammatory or comedonal skin condition resulting from clogged hair follicles and excess sebum production.',
    treatments: ['Topical salicylic acid or benzoyl peroxide', 'Gentle non-comedogenic cleanser twice daily', 'Neem or tea tree natural topical application', 'Avoid picking or squeezing lesions'],
    dietRecommendations: ['Reduce dairy and high-glycemic carbohydrates', 'Increase zinc-rich foods (seeds, lentils)', 'Stay hydrated with 2-3 liters of water daily', 'Incorporate anti-inflammatory green vegetables']
  },
  Actinic_Keratosis: {
    formattedName: 'Actinic Keratosis',
    severity: 'severe',
    description: 'Rough, scaly precancerous patch caused by cumulative UV damage. Dermatological examination is strongly advised.',
    treatments: ['Consult a dermatologist for clinical evaluation or cryotherapy', 'Apply broad-spectrum SPF 50+ sunscreen daily', 'Wear sun-protective clothing and wide-brim hats', 'Use gentle barrier-repair moisturizers'],
    dietRecommendations: ['Antioxidant-rich berries and dark leafy greens', 'Green tea catechins (polyphenols)', 'Omega-3 fatty acids (flaxseeds, walnuts)', 'Avoid pro-inflammatory processed foods']
  },
  Benign_tumors: {
    formattedName: 'Benign Skin Tumors / Growths',
    severity: 'mild',
    description: 'Non-cancerous, localized skin growth (such as seborrheic keratosis, dermatofibroma, or lipoma).',
    treatments: ['Clinical evaluation to confirm benign nature', 'Monitor for any sudden change in size or color', 'Do not attempt home or chemical removal', 'Gentle skin hygiene and moisturizing'],
    dietRecommendations: ['Balanced whole-food nutrition', 'Nutrient-dense fruits and vegetables', 'Adequate daily water hydration', 'Foods rich in vitamins A, C, and E']
  },
  Bullous: {
    formattedName: 'Bullous Disease (Blistering Disorder)',
    severity: 'severe',
    description: 'Skin disorder characterized by large, fluid-filled blisters (bullae). Requires prompt medical assessment.',
    treatments: ['Immediate consultation with a dermatologist', 'Keep affected skin clean and protected', 'Do not puncture or drain blisters', 'Cool sterile saline compresses for comfort'],
    dietRecommendations: ['High-protein diet to support tissue repair', 'Electrolyte-balanced fluids and hydration', 'Soft, non-irritating, easy-to-digest meals', 'Avoid very spicy or abrasive foods']
  },
  Candidiasis: {
    formattedName: 'Cutaneous Candidiasis (Fungal Infection)',
    severity: 'moderate',
    description: 'Superficial fungal infection caused by Candida yeast, typically occurring in warm, moist skin folds.',
    treatments: ['Topical antifungal cream (clotrimazole, miconazole)', 'Keep affected areas completely clean and dry', 'Wear loose-fitting, breathable cotton fabrics', 'Ayurvedic antifungal wash (Triphala / Neem infusion)'],
    dietRecommendations: ['Limit high-sugar and fermented yeast foods', 'Include probiotic-rich plain yogurt or kefir', 'Garlic and turmeric in daily cooking', 'Plenty of warm water and herbal teas']
  },
  DrugEruption: {
    formattedName: 'Drug Eruption',
    severity: 'severe',
    description: 'Adverse cutaneous drug reaction. Prompt medical evaluation of current medications is essential.',
    treatments: ['Immediate evaluation by a prescribing doctor or dermatologist', 'Review all prescription and OTC medications with physician', 'Cool compresses and gentle bland emollients', 'Oral antihistamines under medical direction if itchy'],
    dietRecommendations: ['Bland, hypoallergenic whole-food diet', 'High fluid intake to support systemic elimination', 'Avoid known food allergens and alcohol', 'Mild, soothing herbal teas like chamomile']
  },
  Eczema: {
    formattedName: 'Eczema (Atopic Dermatitis)',
    severity: 'moderate',
    description: 'Chronic inflammatory skin condition causing dry, pruritic, and sensitive skin patches.',
    treatments: ['Ceramide-based barrier moisturizers applied immediately after bathing', 'Topical hydrocortisone as directed by doctor', 'Fragrance-free, hypoallergenic skin products', 'Cool compresses and oatmeal soaks'],
    dietRecommendations: ['Anti-inflammatory diet rich in omega-3 fatty acids', 'Quercetin-rich foods (apples, blueberries, onions)', 'Avoid personal food allergens (dairy, gluten if sensitive)', 'Probiotic-rich fermented foods']
  },
  Infestations_Bites: {
    formattedName: 'Skin Infestations & Insect Bites',
    severity: 'moderate',
    description: 'Localized inflammatory reaction to insect bites, stings, or parasitic skin infestations.',
    treatments: ['Topical calamine lotion or mild hydrocortisone', 'Cool compresses to alleviate swelling and itching', 'Gentle antiseptic cleansing of bite sites', 'Medical evaluation if scabies, ticks, or infection is suspected'],
    dietRecommendations: ['Immune-supportive vitamin C and zinc rich foods', 'Turmeric golden milk for internal anti-inflammatory support', 'Adequate fluid intake', 'Avoid excess sugar to discourage secondary inflammation']
  },
  Lichen: {
    formattedName: 'Lichen Planus / Lichenoid Dermatosis',
    severity: 'moderate',
    description: 'Inflammatory autoimmune condition presenting with violaceous, polygonal, pruritic papules or plaques.',
    treatments: ['Dermatologist evaluation for topical corticosteroid management', 'Avoid scratching to prevent Koebner response', 'Pure aloe vera gel for soothing irritation', 'Gentle soap-free cleansing'],
    dietRecommendations: ['Anti-inflammatory Mediterranean diet', 'Avoid spicy, acidic, or extremely hot foods', 'Leafy greens and antioxidant-rich vegetables', 'Adequate hydration with clean water']
  },
  Lupus: {
    formattedName: 'Cutaneous Lupus Erythematosus',
    severity: 'severe',
    description: 'Autoimmune skin manifestation often characterized by photosensitive rashes and erythematous plaques.',
    treatments: ['Clinical management with a rheumatologist or dermatologist', 'Strict broad-spectrum high-SPF sunscreen daily', 'Sun-protective clothing, hats, and UV avoidance', 'Gentle, non-irritating skin barrier creams'],
    dietRecommendations: ['Anti-inflammatory foods (fatty fish, chia seeds)', 'Colorful vegetables rich in antioxidants', 'Limit alfalfa sprouts and excessive sodium', 'Vitamin D3 supplementation under medical supervision']
  },
  Moles: {
    formattedName: 'Melanocytic Nevus (Mole)',
    severity: 'mild',
    description: 'Common benign pigmented skin lesion composed of melanocytes. Periodic monitoring using ABCDE criteria is advised.',
    treatments: ['Annual professional skin examination by a dermatologist', 'Monitor monthly for ABCDE changes (Asymmetry, Border, Color, Diameter, Evolution)', 'Daily broad-spectrum sunscreen protection', 'Avoid scratching or picking at the mole'],
    dietRecommendations: ['Nutrient-dense whole-food diet', 'Carotenoid-rich vegetables (carrots, sweet potatoes)', 'Adequate daily hydration', 'Antioxidant-packed fruits']
  },
  Psoriasis: {
    formattedName: 'Psoriasis',
    severity: 'moderate',
    description: 'Autoimmune disorder causing accelerated epidermal turnover, resulting in well-demarcated silvery-scaled plaques.',
    treatments: ['Topical vitamin D analogues or prescribed corticosteroids', 'Thick emollient moisturizers (ceramides, petrolatum)', 'Ayurvedic Bakuchi or Neem topical preparations', 'Warm baths with Epsom salt or colloidal oatmeal'],
    dietRecommendations: ['Anti-inflammatory foods (olive oil, leafy greens, berries)', 'Limit red meat, ultra-processed foods, and alcohol', 'Turmeric and ginger incorporated into meals', 'Maintain healthy body weight and gut health']
  },
  Rosacea: {
    formattedName: 'Rosacea',
    severity: 'moderate',
    description: 'Chronic facial dermatosis characterized by persistent flushing, erythema, telangiectasias, or papulopustules.',
    treatments: ['Gentle, non-abrasive skin cleansing routine', 'Topical azelaic acid or metronidazole as prescribed', 'Daily mineral (zinc oxide/titanium dioxide) sunscreen', 'Avoid known personal triggers (heat, spicy food, wind)'],
    dietRecommendations: ['Avoid spicy dishes, hot beverages, and alcohol', 'Cooling foods (cucumber, mint, watermelon, coconut water)', 'Anti-inflammatory omega-3 healthy fats', 'Room-temperature water hydration']
  },
  Seborrh_Keratoses: {
    formattedName: 'Seborrheic Keratosis',
    severity: 'mild',
    description: 'Common benign waxy, verrucous skin growth appearing "stuck on" the skin. Harmless non-cancerous lesion.',
    treatments: ['Benign condition — treatment is purely elective or cosmetic', 'Dermatological removal via cryotherapy if irritated by clothing', 'Avoid picking, scratching, or rubbing the growth', 'Regular gentle moisturization'],
    dietRecommendations: ['Balanced whole-food nutrition', 'Foods rich in vitamins C, E, and polyphenols', 'Ample clean water intake', 'Fresh fruits and green vegetables']
  },
  SkinCancer: {
    formattedName: 'Suspected Skin Lesion / Skin Cancer',
    severity: 'severe',
    description: 'Atypical or potentially malignant skin lesion. Urgent professional biopsy and clinical staging are required.',
    treatments: ['URGENT: Consult a board-certified dermatologist immediately', 'Do not delay in-person clinical examination and dermoscopy', 'Strict sun avoidance and UV-protective clothing', 'Do not attempt self-treatment, home remedies, or cutting'],
    dietRecommendations: ['Nutrient-dense immune-supporting whole foods', 'High-antioxidant berries and leafy vegetables', 'Adequate hydration', 'Follow physician oncology and nutrition guidelines']
  },
  Sun_Sunlight_Damage: {
    formattedName: 'Photo-Damage / Solar Lentigines',
    severity: 'moderate',
    description: 'Cutaneous changes resulting from chronic ultraviolet exposure, including uneven pigmentation and solar elastosis.',
    treatments: ['Daily broad-spectrum SPF 50+ UVA/UVB sunscreen', 'Topical vitamin C serum in morning routine', 'Gentle nightly retinoid or niacinamide as tolerated', 'Soothing aloe vera and licorice extract topical care'],
    dietRecommendations: ['Lycopene-rich foods (cooked tomatoes, watermelon)', 'Citrus fruits, kiwi, and bell peppers for vitamin C', 'Green tea antioxidants', 'Plenty of water to maintain skin hydration']
  },
  Tinea: {
    formattedName: 'Tinea (Dermatophytosis / Fungal Infection)',
    severity: 'moderate',
    description: 'Superficial dermatophyte fungal infection (such as ringworm, tinea corporis, or tinea pedis) with annular scaly borders.',
    treatments: ['Topical antifungal cream (terbinafine, clotrimazole) applied 2 cm beyond border', 'Keep infected skin clean, dry, and exposed to air', 'Do not share towels, clothing, or footwear', 'Wash clothing and bedding in hot water'],
    dietRecommendations: ['Reduce refined sugars and simple carbohydrates', 'Incorporate raw garlic and oregano (natural antifungals)', 'Probiotic foods to strengthen microbiome', 'Zinc and vitamin C for immune defense']
  },
  Unknown_Normal: {
    formattedName: 'Normal / Healthy Skin Baseline',
    severity: 'mild',
    description: 'Skin displays features consistent with healthy baseline skin without obvious acute pathological markers.',
    treatments: ['Maintain daily basic skin hygiene and gentle cleansing', 'Apply daily broad-spectrum SPF 30+ sunscreen', 'Hydrate skin with a lightweight ceramide moisturizer', 'Regularly examine skin for any new or evolving lesions'],
    dietRecommendations: ['Balanced diet with a rainbow of fresh fruits and vegetables', 'Drink 2-3 liters of water daily for skin cellular hydration', 'Healthy fats from avocado, nuts, and seeds', 'Adequate protein for skin collagen synthesis']
  },
  Vascular_Tumors: {
    formattedName: 'Vascular Lesion / Hemangioma',
    severity: 'moderate',
    description: 'Vascular skin proliferation involving endothelial blood vessels (such as cherry angioma or pyogenic granuloma).',
    treatments: ['Dermatological assessment to confirm accurate vascular classification', 'Handle gently to prevent bleeding or ulceration', 'Do not scratch or irritate the lesion', 'Pulsed-dye laser or electrocautery if removal is desired'],
    dietRecommendations: ['Bioflavonoid-rich berries, citrus, and cherries', 'Anti-inflammatory whole-food diet', 'Adequate hydration', 'Foods rich in vitamin K and vitamin C']
  },
  Vasculitis: {
    formattedName: 'Cutaneous Vasculitis',
    severity: 'severe',
    description: 'Inflammation of dermal blood vessels presenting with palpable purpura, petechiae, or tender erythematous lesions.',
    treatments: ['Prompt clinical evaluation by a medical physician or rheumatologist', 'Elevation of lower limbs if legs are affected', 'Avoid strenuous standing or prolonged dependent positioning', 'Prescription medical therapy directed by healthcare provider'],
    dietRecommendations: ['Anti-inflammatory diet rich in antioxidants', 'Reduce sodium intake if dependent edema is present', 'Leafy greens and clean protein sources', 'Adequate water hydration']
  },
  Vitiligo: {
    formattedName: 'Vitiligo',
    severity: 'moderate',
    description: 'Autoimmune depigmentation disorder caused by melanocyte destruction, leading to distinct amelanotic patches.',
    treatments: ['Consult a dermatologist for topical calcineurin inhibitors or phototherapy', 'Strict high-SPF sunscreen application on depigmented skin to prevent burns', 'Ayurvedic Bakuchi (Psoralea corylifolia) under professional practitioner guidance', 'Mild, non-irritating skincare products'],
    dietRecommendations: ['Foods rich in vitamin B12, folate, copper, and zinc', 'Antioxidant-dense vegetables (spinach, carrots, beets)', 'Ayurvedic guidance advises limiting excess sour or fermented foods', 'Walnuts, almonds, and soaked figs']
  },
  Warts: {
    formattedName: 'Verruca / Warts (HPV Infection)',
    severity: 'mild',
    description: 'Benign hyperkeratotic epithelial lesions caused by human papillomavirus (HPV) infection.',
    treatments: ['Over-the-counter topical salicylic acid wart treatment', 'Clinical cryotherapy (liquid nitrogen) by a healthcare provider', 'Do not pick, scratch, or shave over warts to prevent spread', 'Ayurvedic tea tree oil or Thuja topical application'],
    dietRecommendations: ['Immune-boosting foods rich in zinc and vitamin C', 'Fresh garlic, onions, and mushrooms', 'Probiotic foods for immune equilibrium', 'Adequate hydration and restorative sleep']
  }
};

function getConditionDetails(conditionKey: string): ConditionInfo {
  if (CONDITION_KNOWLEDGE[conditionKey]) {
    return CONDITION_KNOWLEDGE[conditionKey];
  }

  // Fallback for any other condition or unmapped class
  const formattedName = conditionKey.replace(/_/g, ' ');
  return {
    formattedName,
    severity: 'moderate',
    description: `Skin evaluation identified patterns consistent with ${formattedName}. Professional dermatological evaluation is recommended.`,
    treatments: [
      'Consult a board-certified dermatologist for in-person clinical diagnosis',
      'Gentle skin cleansing with mild, fragrance-free products',
      'Daily broad-spectrum SPF 30+ sun protection',
      'Keep the affected area clean, dry, and monitored'
    ],
    dietRecommendations: [
      'Follow an anti-inflammatory diet rich in whole foods',
      'Drink 2-3 liters of clean water daily for skin hydration',
      'Include fresh fruits, vegetables, and healthy fats',
      'Limit ultra-processed foods, refined sugar, and alcohol'
    ]
  };
}

// Convert base64 data URL to File object
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function DiseaseDetection({ onConditionDetected, onBack, skincareType }: DiseaseDetectionProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DetectedCondition | null>(null);
  const [lowConfidence, setLowConfidence] = useState<LowConfidenceResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setApiError('Invalid image format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }

    if (file.size === 0) {
      setApiError('The selected image file is empty. Please select a valid photo.');
      return;
    }

    setSelectedFile(file);
    setApiError(null);
    setLowConfidence(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input so user can re-select same file if desired
    event.target.value = '';
  };

  const handleCameraCapture = () => {
    setApiError(null);
    startCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setApiError('Unable to access camera. Please check permissions or upload an image file.');
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraOpen, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Video stream not fully loaded yet.');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        if (imageUrl === 'data:,') {
           setApiError('Failed to capture image from camera.');
           return;
        }

        setUploadedImage(imageUrl);
        stopCamera();

        // Convert captured canvas frame to a File object and immediately run prediction
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(capturedFile);
            runAnalysis(capturedFile, imageUrl);
          } else {
            const fallbackFile = dataURLtoFile(imageUrl, 'camera_capture.jpg');
            setSelectedFile(fallbackFile);
            runAnalysis(fallbackFile, imageUrl);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const analyzeImage = () => {
    if (selectedFile && uploadedImage) {
      runAnalysis(selectedFile, uploadedImage);
    } else if (uploadedImage) {
      try {
        const file = dataURLtoFile(uploadedImage, 'skin_photo.jpg');
        setSelectedFile(file);
        runAnalysis(file, uploadedImage);
      } catch (err) {
        setApiError('Failed to prepare image for analysis.');
      }
    } else {
      setApiError('Please select or capture a skin image first.');
    }
  };

  const runAnalysis = async (fileToAnalyze: File, previewUrl: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setApiError(null);
    setLowConfidence(null);
    setAnalysisResult(null);

    // Dynamic progress bar while API call executes
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          return 90;
        }
        return prev + Math.random() * 12;
      });
    }, 180);

    try {
      const formData = new FormData();
      formData.append('image', fileToAnalyze, fileToAnalyze.name || 'image.jpg');

      const response = await fetch(PREDICT_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let serverError = `Server returned status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error) serverError = errData.error;
          else if (errData.message) serverError = errData.message;
        } catch {
          // ignore parsing error
        }
        throw new Error(serverError);
      }

      const data = await response.json();

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!data.success) {
        setApiError(data.error || data.message || 'Unable to process the uploaded image.');
        setIsAnalyzing(false);
        return;
      }

      // Handle low confidence prediction
      if (data.status === 'low_confidence' || !data.condition) {
        setLowConfidence({
          confidence: typeof data.confidence === 'number' ? data.confidence : null,
          message: data.message || 'The AI could not confidently classify this image. Please upload a clearer skin image.',
          medicalNotice: data.medical_notice || 'This AI result is for informational and educational purposes only and is not a medical diagnosis.',
        });
        setIsAnalyzing(false);
        return;
      }

      // Handle successful prediction from EfficientNetB0
      const conditionKey = data.condition;
      const details = getConditionDetails(conditionKey);
      
      const selectedMode = skincareType === 'ayurvedic' ? 'Ayurveda' : 'Dermatology';
      const now = new Date();
      const detectedCondition: DetectedCondition = {
        id: Date.now().toString(),
        name: conditionKey,
        condition: conditionKey,
        formattedName: details.formattedName,
        severity: details.severity,
        confidence: typeof data.confidence === 'number' ? data.confidence : 0,
        description: details.description,
        treatments: details.treatments,
        dietRecommendations: details.dietRecommendations,
        imageUrl: previewUrl,
        detectedAt: now,
        dateTime: now.toISOString(),
        mode: selectedMode,
        skincareType: skincareType || 'generic',
        medicalNotice: data.medical_notice,
      };

      setAnalysisResult(detectedCondition);
      setIsAnalyzing(false);

    } catch (err: any) {
      clearInterval(progressInterval);
      setAnalysisProgress(0);
      setIsAnalyzing(false);
      console.error('Prediction API error:', err);

      let msg = err?.message || 'Failed to connect to AI prediction server.';
      if (err?.name === 'TypeError' && err?.message?.includes('fetch')) {
        msg = `Could not connect to FastAPI server at ${BACKEND_BASE}. Please ensure the backend is running.`;
      }
      setApiError(msg);
    }
  };

  const saveDetection = () => {
    // Guard: Do not save low-confidence results where condition is null
    if (!analysisResult || !analysisResult.condition || analysisResult.condition === 'null') {
      return;
    }
    onConditionDetected(analysisResult);
    // Reset for next analysis
    setUploadedImage(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setLowConfidence(null);
    setApiError(null);
    setAnalysisProgress(0);
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setLowConfidence(null);
    setApiError(null);
    setAnalysisProgress(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'severe': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="mb-1 text-2xl font-bold">AI Skin Disease Detection</h1>
          <p className="text-muted-foreground">Upload or capture a photo for instant analysis</p>
        </div>
      </div>

      {/* Upload Section */}
      {!uploadedImage && !isCameraOpen && (
        <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="mb-4 text-blue-800 text-xl font-semibold">Upload Skin Photo</h2>
          <p className="text-blue-700 mb-8 max-w-md mx-auto">
            Take a clear, well-lit photo of the affected area. Our AI will analyze the image and provide instant results.
          </p>

          {apiError && (
            <div className="mb-6 p-4 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleCameraCapture}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="mt-8 p-4 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Photo Guidelines</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1 text-left max-w-md mx-auto">
              <li>• Ensure good lighting and clear focus</li>
              <li>• Fill the frame with the affected area</li>
              <li>• Avoid shadows and reflections</li>
              <li>• Take multiple angles if needed</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Live Camera View */}
      {isCameraOpen && (
        <Card className="p-6 bg-black text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 z-10 relative">
            <h3 className="flex items-center gap-2 text-white font-medium">
              <Camera className="w-5 h-5" />
              Capture Photo
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={stopCamera}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative w-full rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center min-h-[300px]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full max-h-[60vh] object-cover"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 border-2 border-white/20 m-8 rounded-xl border-dashed pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
               <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">Align affected area within frame</span>
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-6 flex justify-center">
            <Button 
              onClick={capturePhoto}
              size="lg"
              className="rounded-full w-16 h-16 p-0 bg-white hover:bg-gray-200 border-4 border-gray-300 text-black flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border border-gray-400 bg-white"></div>
            </Button>
          </div>
        </Card>
      )}

      {/* Image Preview & Analysis */}
      {uploadedImage && (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Image Preview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-medium">
                <FileImage className="w-5 h-5 text-blue-600" />
                Uploaded Image
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetAnalysis}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative mb-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded skin photo" 
                className="w-full h-64 object-cover rounded-lg border"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="bg-white p-4 rounded-lg text-center shadow-lg">
                    <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-medium">Analyzing with AI...</p>
                    <Progress value={analysisProgress} className="w-32 mt-2" />
                  </div>
                </div>
              )}
            </div>

            {!analysisResult && !isAnalyzing && (
              <Button 
                onClick={analyzeImage}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Analyze with AI
              </Button>
            )}
          </Card>

          {/* Analysis Results */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-medium">
              <Eye className="w-5 h-5 text-green-600" />
              Analysis Results
            </h3>

            {!analysisResult && !isAnalyzing && !apiError && !lowConfidence && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Click "Analyze with AI" to get instant results</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm font-medium">Processing image with AI model...</p>
                <Progress value={analysisProgress} className="w-full mt-4" />
                <p className="text-xs text-muted-foreground mt-2">{Math.round(analysisProgress)}% complete</p>
              </div>
            )}

            {apiError && !isAnalyzing && (
              <div className="space-y-6">
                <div className="p-5 border-2 border-red-200 rounded-lg bg-red-50 text-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <h4 className="font-semibold text-red-900">Analysis Error</h4>
                  </div>
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={analyzeImage}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    onClick={resetAnalysis}
                    variant="outline"
                  >
                    Choose Different Photo
                  </Button>
                </div>
              </div>
            )}

            {lowConfidence && !isAnalyzing && (
              <div className="space-y-6">
                <div className="p-5 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <h4 className="text-amber-900 font-semibold">Low Confidence Classification</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {lowConfidence.confidence !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <Progress value={lowConfidence.confidence} className="flex-1" />
                        <span className="text-sm font-medium text-amber-800">{lowConfidence.confidence}%</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-amber-900">
                      {lowConfidence.message}
                    </p>

                    {lowConfidence.medicalNotice && (
                      <div className="mt-3 p-3 bg-white/90 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{lowConfidence.medicalNotice}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 space-y-2">
                  <span className="font-semibold block text-gray-800">Tips for better accuracy:</span>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure the affected area is in sharp focus with good natural lighting</li>
                    <li>Avoid reflections, glares, or deep shadows on the skin</li>
                    <li>Center and frame the affected skin lesion closely</li>
                    <li>Clean any cosmetics or ointments from the area before photographing</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      resetAnalysis();
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Clearer Image
                  </Button>
                  <Button 
                    onClick={() => {
                      resetAnalysis();
                      startCamera();
                    }}
                    variant="outline"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Retake Photo
                  </Button>
                </div>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-6">
                
                {/* Condition Detected */}
                <div className="p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="text-green-800 font-medium">Condition Detected</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg text-gray-900">{analysisResult.name}</span>
                      <Badge className={`${getSeverityColor(analysisResult.severity)} border`}>
                        {analysisResult.severity}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Progress value={analysisResult.confidence} className="flex-1" />
                      <span className="text-sm font-medium">{analysisResult.confidence}%</span>
                    </div>
                    
                    <p className="text-sm text-gray-700">{analysisResult.description}</p>

                    {/* Backend Medical Notice */}
                    {analysisResult.medicalNotice && (
                      <div className="mt-2 p-2.5 bg-white/90 border border-green-200 rounded text-xs text-green-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{analysisResult.medicalNotice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Treatments */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Recommended Treatments
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.treatments.map((treatment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{treatment}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diet Recommendations */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4 text-blue-600" />
                    Diet Recommendations
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.dietRecommendations.map((diet, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{diet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={saveDetection}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save to Profile
                  </Button>
                  <Button 
                    onClick={resetAnalysis}
                    variant="outline"
                  >
                    New Analysis
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <Card className="mt-8 p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="mb-2 text-yellow-800 font-medium">Medical Disclaimer</h4>
            <p className="text-sm text-yellow-700">
              This AI analysis is for informational purposes only and should not replace professional medical diagnosis. 
              Please consult a dermatologist or healthcare provider for serious skin conditions, persistent symptoms, 
              or before starting any treatment regimen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}