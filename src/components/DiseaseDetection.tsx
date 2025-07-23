import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as tf from '@tensorflow/tfjs';
import {
  Loader2,
  Lightbulb,
  AlertTriangle,
  Upload,
  Camera,
  Zap,
  CheckCircle2,
  XCircle,
  Info,
  Leaf,
  Shield,
  Beaker,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const cropOptions = [
  { label: "Apple", value: "apple" },
  { label: "Cherry", value: "cherry" },
  { label: "Corn", value: "corn" },
  { label: "Cotton", value: "cotton" },
  { label: "Grape", value: "grape" },
  { label: "Groundnut", value: "groundnut" },
  { label: "Orange", value: "orange" },
  { label: "Peach", value: "peach" },
  { label: "Pepper", value: "pepper" },
  { label: "Potato", value: "potato" },
  { label: "Rose", value: "rose" },
  { label: "Soybean", value: "soybean" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Sugarcane", value: "sugarcane" },
  { label: "Tomato", value: "tomato" },
  { label: "Wheat", value: "wheat" },
];

// Disease tips and treatment recommendations
const DISEASE_TIPS = {
  // Apple diseases
  'Scab-Apple': {
    severity: 'Moderate',
    treatment: 'Apply fungicides like Captan or Mancozeb. Remove fallen leaves and prune infected branches.',
    prevention: 'Plant resistant varieties, maintain good air circulation, and avoid overhead irrigation.',
    pesticide: 'Captan 50WP (2-3 applications at 10-14 day intervals)'
  },
  'Blackrot-Apple': {
    severity: 'High',
    treatment: 'Remove and destroy infected fruit and branches. Apply copper-based fungicides.',
    prevention: 'Prune regularly, remove mummified fruit, and maintain tree health.',
    pesticide: 'Copper hydroxide (Kocide 3000) or Captan 50WP'
  },
  'Cedar_Rust-Apple': {
    severity: 'Moderate',
    treatment: 'Remove nearby cedar trees if possible. Apply fungicides during bloom period.',
    prevention: 'Plant resistant varieties and maintain distance from cedar trees.',
    pesticide: 'Myclobutanil (Rally 40WSP) or Propiconazole (Banner Maxx)'
  },
  'Healthy-Apple': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  },

  // Cherry diseases
  'Healthy': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  },
  'Diseased': {
    severity: 'Variable',
    treatment: 'Identify specific disease and treat accordingly. Remove infected parts.',
    prevention: 'Regular monitoring, proper spacing, and good cultural practices.',
    pesticide: 'Disease-specific treatment required'
  },

  // Corn diseases
  'Cercospora_leaf_spot-Corn': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms first appear. Remove crop debris.',
    prevention: 'Plant resistant hybrids, rotate crops, and avoid overhead irrigation.',
    pesticide: 'Azoxystrobin (Quadris) or Pyraclostrobin (Headline)'
  },
  'Common_rust-Corn': {
    severity: 'Moderate',
    treatment: 'Apply fungicides early in the season. Remove volunteer corn plants.',
    prevention: 'Plant resistant hybrids and avoid late planting.',
    pesticide: 'Azoxystrobin (Quadris) or Trifloxystrobin (Flint)'
  },
  'Healthy-Corn': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Northern_leaf_blight-Corn': {
    severity: 'High',
    treatment: 'Apply fungicides at first sign of disease. Remove infected debris.',
    prevention: 'Plant resistant hybrids, rotate crops, and till soil.',
    pesticide: 'Pyraclostrobin (Headline) or Azoxystrobin (Quadris)'
  },

  // Cotton diseases
  'Diseased-Cotton': {
    severity: 'Variable',
    treatment: 'Identify specific disease and treat accordingly. Remove infected plants.',
    prevention: 'Use disease-free seed, rotate crops, and maintain field hygiene.',
    pesticide: 'Disease-specific treatment required'
  },
  'Healthy-Cotton': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },

  // Grape diseases
  'Black_rot-Grape': {
    severity: 'High',
    treatment: 'Remove infected clusters and apply fungicides during bloom.',
    prevention: 'Prune properly, remove mummified fruit, and maintain good air circulation.',
    pesticide: 'Captan 50WP or Mancozeb (Dithane M-45)'
  },
  'Esca_(Black_Measles)-Grape': {
    severity: 'High',
    treatment: 'Remove infected vines. Apply fungicides to pruning wounds.',
    prevention: 'Use clean pruning tools, avoid mechanical damage, and plant resistant varieties.',
    pesticide: 'Thiophanate-methyl (Topsin M) or Benomyl'
  },
  'Healthy-Grape': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  },
  'Leaf_blight_(Isariopsis_Leaf_Spot)-Grape': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms appear. Remove infected leaves.',
    prevention: 'Maintain good air circulation and avoid overhead irrigation.',
    pesticide: 'Captan 50WP or Mancozeb (Dithane M-45)'
  },

  // Groundnut diseases
  'Early_leaf_spot-Groundnut': {
    severity: 'Moderate',
    treatment: 'Apply fungicides at first sign of disease. Remove crop debris.',
    prevention: 'Rotate crops, use resistant varieties, and maintain field hygiene.',
    pesticide: 'Chlorothalonil (Bravo) or Mancozeb (Dithane M-45)'
  },
  'Healthy-Groundnut': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Late_leaf_spot-Groundnut': {
    severity: 'High',
    treatment: 'Apply fungicides early in the season. Remove infected debris.',
    prevention: 'Use resistant varieties, rotate crops, and maintain field hygiene.',
    pesticide: 'Chlorothalonil (Bravo) or Azoxystrobin (Abound)'
  },

  // Orange diseases
  'Haunglongbing_(Citrus_greening)-Orange': {
    severity: 'Very High',
    treatment: 'Remove infected trees immediately. Control Asian citrus psyllid vector.',
    prevention: 'Use disease-free nursery stock, monitor for psyllids, and remove infected trees.',
    pesticide: 'Imidacloprid (Admire Pro) for psyllid control'
  },
  'Healthy-Orange': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },

  // Peach diseases
  'Bacterial_spot-Peach': {
    severity: 'High',
    treatment: 'Apply copper-based bactericides. Remove infected fruit and leaves.',
    prevention: 'Plant resistant varieties, avoid overhead irrigation, and maintain tree health.',
    pesticide: 'Copper hydroxide (Kocide 3000) or Streptomycin'
  },
  'Healthy-Peach': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  },

  // Pepper diseases
  'Bacterial_spot-Pepper': {
    severity: 'High',
    treatment: 'Remove infected plants. Apply copper-based bactericides.',
    prevention: 'Use disease-free seed, avoid overhead irrigation, and maintain field hygiene.',
    pesticide: 'Copper hydroxide (Kocide 3000) or Streptomycin'
  },
  'Healthy-Pepper': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },

  // Potato diseases
  'Early_blight-Potato': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms appear. Remove infected foliage.',
    prevention: 'Rotate crops, use resistant varieties, and maintain plant health.',
    pesticide: 'Chlorothalonil (Bravo) or Mancozeb (Dithane M-45)'
  },
  'Healthy-Potato': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Late_blight-Potato': {
    severity: 'Very High',
    treatment: 'Apply fungicides immediately. Remove infected plants and tubers.',
    prevention: 'Use resistant varieties, avoid overhead irrigation, and monitor weather conditions.',
    pesticide: 'Chlorothalonil (Bravo) or Metalaxyl (Ridomil)'
  },

  // Rose diseases
  'Healthy-Rose': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular pruning, fertilization, and pest monitoring.',
    pesticide: 'No treatment needed'
  },
  'Powdery_mildew-Rose': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms appear. Remove infected leaves.',
    prevention: 'Maintain good air circulation, avoid overhead irrigation, and plant resistant varieties.',
    pesticide: 'Sulfur-based fungicides or Myclobutanil (Rally 40WSP)'
  },

  // Soybean diseases
  'Healthy-Soybean': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Mosaic_virus-Soybean': {
    severity: 'High',
    treatment: 'Remove infected plants. Control aphid vectors.',
    prevention: 'Use virus-free seed, control aphids, and remove volunteer plants.',
    pesticide: 'Imidacloprid (Admire Pro) for aphid control'
  },

  // Strawberry diseases
  'Healthy-Strawberry': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Leaf_scorch-Strawberry': {
    severity: 'Moderate',
    treatment: 'Remove infected leaves. Apply fungicides if necessary.',
    prevention: 'Maintain good air circulation, avoid overhead irrigation, and use resistant varieties.',
    pesticide: 'Captan 50WP or Myclobutanil (Rally 40WSP)'
  },

  // Sugarcane diseases
  'Healthy-Sugarcane': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Red_rot-Sugarcane': {
    severity: 'High',
    treatment: 'Remove infected stalks. Apply fungicides to seed pieces.',
    prevention: 'Use disease-free seed pieces, rotate crops, and maintain field hygiene.',
    pesticide: 'Carbendazim or Thiophanate-methyl (Topsin M)'
  },

  // Tomato diseases
  'Bacterial_spot-Tomato': {
    severity: 'High',
    treatment: 'Remove infected plants. Apply copper-based bactericides.',
    prevention: 'Use disease-free seed, avoid overhead irrigation, and maintain field hygiene.',
    pesticide: 'Copper hydroxide (Kocide 3000) or Streptomycin'
  },
  'Healthy-Tomato': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Leaf_Mold-Tomato': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms appear. Remove infected leaves.',
    prevention: 'Maintain good air circulation, avoid overhead irrigation, and use resistant varieties.',
    pesticide: 'Chlorothalonil (Bravo) or Mancozeb (Dithane M-45)'
  },
  'Septoria_leaf_spot-Tomato': {
    severity: 'Moderate',
    treatment: 'Apply fungicides early. Remove infected leaves and debris.',
    prevention: 'Rotate crops, use resistant varieties, and maintain field hygiene.',
    pesticide: 'Chlorothalonil (Bravo) or Mancozeb (Dithane M-45)'
  },
  'Spider_mites Two-spotted_spider_mite-Tomato': {
    severity: 'Moderate',
    treatment: 'Apply miticides when populations are high. Remove heavily infested leaves.',
    prevention: 'Monitor regularly, maintain plant health, and avoid drought stress.',
    pesticide: 'Abamectin (Agri-Mek) or Bifenthrin (Brigade)'
  },
  'Target_Spot-Tomato': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms appear. Remove infected leaves.',
    prevention: 'Maintain good air circulation, avoid overhead irrigation, and use resistant varieties.',
    pesticide: 'Chlorothalonil (Bravo) or Azoxystrobin (Quadris)'
  },
  'Tomato_mosaic_virus-Tomato': {
    severity: 'High',
    treatment: 'Remove infected plants immediately. Control aphid vectors.',
    prevention: 'Use virus-free seed, control aphids, and sanitize tools.',
    pesticide: 'Imidacloprid (Admire Pro) for aphid control'
  },
  'Tomato_Yellow_Leaf_Curl_Virus-Tomato': {
    severity: 'Very High',
    treatment: 'Remove infected plants. Control whitefly vectors.',
    prevention: 'Use resistant varieties, control whiteflies, and use reflective mulches.',
    pesticide: 'Imidacloprid (Admire Pro) or Thiamethoxam (Actara) for whitefly control'
  },

  // Wheat diseases
  'Healthy-Wheat': {
    severity: 'None',
    treatment: 'Continue current management practices.',
    prevention: 'Maintain regular monitoring and good cultural practices.',
    pesticide: 'No treatment needed'
  },
  'Powdery_mildew-Wheat': {
    severity: 'Moderate',
    treatment: 'Apply fungicides when symptoms appear. Remove infected debris.',
    prevention: 'Plant resistant varieties, avoid dense planting, and maintain good air circulation.',
    pesticide: 'Triadimefon (Bayleton) or Propiconazole (Tilt)'
  },
  'Septoria_leaf_blotch-Wheat': {
    severity: 'High',
    treatment: 'Apply fungicides early in the season. Remove crop debris.',
    prevention: 'Rotate crops, use resistant varieties, and maintain field hygiene.',
    pesticide: 'Propiconazole (Tilt) or Azoxystrobin (Quadris)'
  },
  'Stripe_rust-Wheat': {
    severity: 'High',
    treatment: 'Apply fungicides when symptoms appear. Remove volunteer wheat.',
    prevention: 'Plant resistant varieties, avoid late planting, and remove volunteer plants.',
    pesticide: 'Triadimefon (Bayleton) or Propiconazole (Tilt)'
  }
};

// Model URLs and labels for each crop
const MODEL_CONFIG = {
  apple: {
    url: '/models/apple-model/model.json',
    labels: ['Scab-Apple', 'Blackrot-Apple', 'Cedar_Rust-Apple', 'Healthy-Apple']
  },
  cherry: {
    url: '/models/cherry/model.json',
    labels: ['Healthy', 'Diseased']
  },
  corn: {
    url: '/models/corn-model/model.json',
    labels: ['Cercospora_leaf_spot-Corn', 'Common_rust-Corn', 'Healthy-Corn', 'Northern_leaf_blight-Corn']
  },
  cotton: {
    url: '/models/cotton-model/model.json',
    labels: ['Diseased-Cotton', 'Healthy-Cotton']
  },
  grape: {
    url: '/models/grape-model/model.json',
    labels: ['Black_rot-Grape', 'Esca_(Black_Measles)-Grape', 'Healthy-Grape', 'Leaf_blight_(Isariopsis_Leaf_Spot)-Grape']
  },
  groundnut: {
    url: '/models/groundnut-model/model.json',
    labels: ['Early_leaf_spot-Groundnut', 'Healthy-Groundnut', 'Late_leaf_spot-Groundnut']
  },
  orange: {
    url: '/models/orange-model/model.json',
    labels: ['Haunglongbing_(Citrus_greening)-Orange', 'Healthy-Orange']
  },
  peach: {
    url: '/models/peach-model/model.json',
    labels: ['Bacterial_spot-Peach', 'Healthy-Peach']
  },
  pepper: {
    url: '/models/pepper-model/model.json',
    labels: ['Bacterial_spot-Pepper', 'Healthy-Pepper']
  },
  potato: {
    url: '/models/potato-model/model.json',
    labels: ['Early_blight-Potato', 'Healthy-Potato', 'Late_blight-Potato']
  },
  rose: {
    url: '/models/rose-model/model.json',
    labels: ['Healthy-Rose', 'Powdery_mildew-Rose']
  },
  soybean: {
    url: '/models/soybean-model/model.json',
    labels: ['Healthy-Soybean', 'Mosaic_virus-Soybean']
  },
  strawberry: {
    url: '/models/strawberry-model/model.json',
    labels: ['Healthy-Strawberry', 'Leaf_scorch-Strawberry']
  },
  sugarcane: {
    url: '/models/sugarcane-model/model.json',
    labels: ['Healthy-Sugarcane', 'Red_rot-Sugarcane']
  },
  tomato: {
    url: '/models/tomato-model/model.json',
    labels: ['Bacterial_spot-Tomato', 'Healthy-Tomato', 'Leaf_Mold-Tomato', 'Septoria_leaf_spot-Tomato', 'Spider_mites Two-spotted_spider_mite-Tomato', 'Target_Spot-Tomato', 'Tomato_mosaic_virus-Tomato', 'Tomato_Yellow_Leaf_Curl_Virus-Tomato']
  },
  wheat: {
    url: '/models/wheat-model/model.json',
    labels: ['Healthy-Wheat', 'Powdery_mildew-Wheat', 'Septoria_leaf_blotch-Wheat', 'Stripe_rust-Wheat']
  }
};

const DiseaseDetection = () => {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [detectedDisease, setDetectedDisease] = useState<string | null>(null);

  // Load model when crop is selected
  useEffect(() => {
    if (selectedCrop && MODEL_CONFIG[selectedCrop as keyof typeof MODEL_CONFIG] && !model) {
      const modelUrl = MODEL_CONFIG[selectedCrop as keyof typeof MODEL_CONFIG].url;
      tf.loadLayersModel(modelUrl)
        .then(setModel)
        .catch((err) => {
          setResult('Failed to load model');
          console.error(err);
        });
    }
  }, [selectedCrop, model]);

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCrop(e.target.value);
    setImage(null);
    setResult(null);
    setModel(null);
    setDetectedDisease(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResult(null);
      setDetectedDisease(null);
    }
  };

  // Preprocess image to 224x224 and normalize
  const preprocessImage = async (file: File) => {
    return new Promise<tf.Tensor4D>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 224;
          canvas.height = 224;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No canvas context');
          ctx.drawImage(img, 0, 0, 224, 224);
          const imageData = ctx.getImageData(0, 0, 224, 224);
          let imgTensor = tf.browser.fromPixels(imageData).toFloat();
          // Normalize to [0,1]
          imgTensor = imgTensor.div(255.0);
          // Add batch dimension
          const input = imgTensor.expandDims(0) as tf.Tensor4D;
          resolve(input);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDetect = async () => {
    if (!image || !selectedCrop || !model) return;
    setLoading(true);
    setResult(null);
    setDetectedDisease(null);
    try {
      const input = await preprocessImage(image);
      const prediction = model.predict(input) as tf.Tensor;
      const data = await prediction.data();
      const maxIdx = data.indexOf(Math.max(...data));
      const labels = MODEL_CONFIG[selectedCrop as keyof typeof MODEL_CONFIG].labels;
      const diseaseName = labels[maxIdx];
      setDetectedDisease(diseaseName);
      setResult(diseaseName + ` (Confidence: ${(data[maxIdx] * 100).toFixed(1)}%)`);
      tf.dispose([input, prediction]);
    } catch (err) {
      setResult('Prediction failed');
      console.error(err);
    }
    setLoading(false);
  };

  const getDiseaseTips = (diseaseName: string) => {
    return DISEASE_TIPS[diseaseName as keyof typeof DISEASE_TIPS] || {
      severity: 'Unknown',
      treatment: 'Please consult with a local agricultural expert.',
      prevention: 'Maintain good cultural practices and regular monitoring.',
      pesticide: 'Consult with local agricultural extension for recommendations.'
    };
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-700">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Leaf className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              AI-Powered Crop Disease Detection
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Upload an image of your crop and get instant, accurate disease diagnosis with treatment recommendations
            </p>
            <div className="flex justify-center gap-8 text-green-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>95%+ Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>16 Crop Types</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(16 185 129 / 0.1)"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Detection Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-2xl border-border bg-card backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8">
                <div className="flex items-center gap-3">
                  <Camera className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-3xl font-bold">Disease Detection</CardTitle>
                    <CardDescription className="text-emerald-100 text-lg">
                      Select your crop and upload an image for analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                {/* Step 1: Crop Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">1</div>
                    <Label className="text-lg font-semibold text-foreground">Select Your Crop Type</Label>
                  </div>
                  <select
                    className="w-full p-4 text-lg border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-input text-foreground"
                    value={selectedCrop}
                    onChange={handleCropChange}
                  >
                    <option value="">🌱 Choose a crop type...</option>
                    {cropOptions.map((crop) => (
                      <option key={crop.value} value={crop.value}>
                        {crop.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCrop && (
                  <>
                    {/* Step 2: Image Upload */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">2</div>
                        <Label className="text-lg font-semibold text-foreground">
                          Upload {cropOptions.find(c => c.value === selectedCrop)?.label} Image
                        </Label>
                      </div>
                      
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                          image ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={loading}
                        />
                        
                        {!image ? (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-lg text-gray-600 font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                PNG, JPG, JPEG up to 10MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative inline-block">
                              <img
                                src={URL.createObjectURL(image)}
                                alt="Uploaded crop"
                                className="w-48 h-48 object-cover rounded-lg shadow-lg mx-auto"
                              />
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            </div>
                            <p className="text-emerald-600 font-medium">
                              ✓ Image uploaded successfully
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImage(null);
                                setResult(null);
                                setDetectedDisease(null);
                              }}
                              className="text-gray-600 hover:text-red-600"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Remove Image
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Analysis */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">3</div>
                        <Label className="text-lg font-semibold text-foreground">AI Analysis</Label>
                      </div>
                      
                      <Button
                        onClick={handleDetect}
                        disabled={!image || loading || !model}
                        size="lg"
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin h-6 w-6 mr-3" />
                            Analyzing Image...
                          </>
                        ) : (
                          <>
                            <Eye className="h-6 w-6 mr-3" />
                            Analyze for Diseases
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </Button>

                      {!model && selectedCrop && !loading && (
                        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          <p className="text-amber-800 text-sm">
                            Loading AI model for {cropOptions.find(c => c.value === selectedCrop)?.label}...
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card className="shadow-lg border-border bg-card backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Info className="w-6 h-6 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Select Crop</h4>
                    <p className="text-sm text-muted-foreground">Choose from 16 supported crop types</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Upload Image</h4>
                    <p className="text-sm text-muted-foreground">Take or upload a clear photo of the affected plant</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Get Results</h4>
                    <p className="text-sm text-muted-foreground">AI analyzes and provides instant diagnosis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supported Crops */}
            <Card className="shadow-lg border-border bg-card backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                  Supported Crops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {cropOptions.slice(0, 8).map((crop) => (
                    <div key={crop.value} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-700">{crop.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  +{cropOptions.length - 8} more crops supported
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis Complete</h2>
              <p className="text-gray-600">Here are your results and recommendations</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Detection Result */}
              <Card className="shadow-xl border-border bg-card overflow-hidden">
                <CardHeader className={`${
                  detectedDisease && (detectedDisease === 'Healthy' || detectedDisease.includes('Healthy'))
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600'
                } text-white p-6`}>
                  <div className="flex items-center gap-3">
                    {detectedDisease && (detectedDisease === 'Healthy' || detectedDisease.includes('Healthy')) ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <AlertTriangle className="w-8 h-8" />
                    )}
                    <div>
                      <CardTitle className="text-2xl">Detection Result</CardTitle>
                      <CardDescription className="text-white/90">
                        AI analysis completed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center p-6 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200">
                      <p className="text-2xl font-bold text-gray-800 mb-2">{result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Guide */}
              {detectedDisease && (
                <Card className="shadow-xl border-border bg-card overflow-hidden">
                  <CardHeader className={`${
                    detectedDisease === 'Healthy' || detectedDisease.includes('Healthy')
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                      : 'bg-gradient-to-r from-red-500 to-pink-600'
                  } text-white p-6`}>
                    <div className="flex items-center gap-3">
                      {detectedDisease === 'Healthy' || detectedDisease.includes('Healthy') ? (
                        <Shield className="w-8 h-8" />
                      ) : (
                        <Beaker className="w-8 h-8" />
                      )}
                      <div>
                        <CardTitle className="text-2xl">
                          {detectedDisease === 'Healthy' || detectedDisease.includes('Healthy')
                            ? 'Health Status'
                            : 'Treatment Guide'
                          }
                        </CardTitle>
                        <CardDescription className="text-white/90">
                          {detectedDisease === 'Healthy' || detectedDisease.includes('Healthy')
                            ? 'Maintenance recommendations'
                            : 'Immediate action required'
                          }
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => {
                      const tips = getDiseaseTips(detectedDisease);
                      const isHealthy = detectedDisease === 'Healthy' || detectedDisease.includes('Healthy');
                      
                      return (
                        <div className="space-y-6">
                          {!isHealthy && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                  Severity Level
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  tips.severity === 'Very High' ? 'bg-red-100 text-red-800' :
                                  tips.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                  tips.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {tips.severity}
                                </span>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                  <Beaker className="w-4 h-4 text-blue-600" />
                                  Pesticide
                                </h4>
                                <p className="text-sm text-gray-700">{tips.pesticide}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                {isHealthy ? 'Maintenance Recommendations' : 'Treatment Steps'}
                              </h4>
                              <p className="text-blue-700 leading-relaxed">{tips.treatment}</p>
                            </div>
                            
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Prevention Tips
                              </h4>
                              <p className="text-green-700 leading-relaxed">{tips.prevention}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection; 