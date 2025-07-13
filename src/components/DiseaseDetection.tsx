import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as tf from '@tensorflow/tfjs';
import { Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <div className="hidden md:block">
          <Navigation />
        </div>
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg border-green-200 border-2">
              <CardHeader className="bg-green-50 rounded-t-lg">
                <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                  <span>🌱 Crop Disease Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div>
                  <Label htmlFor="crop-select" className="text-green-700 font-semibold">Select Crop</Label>
                  <select
                    id="crop-select"
                    className="w-full p-2 border-2 border-green-200 rounded-md mt-1 focus:ring-2 focus:ring-green-400"
                    value={selectedCrop}
                    onChange={handleCropChange}
                  >
                    <option value="">Choose a crop...</option>
                    {cropOptions.map((crop) => (
                      <option key={crop.value} value={crop.value}>{crop.label}</option>
                    ))}
                  </select>
                </div>
                {selectedCrop && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="crop-image" className="text-green-700 font-semibold">Upload {cropOptions.find(c => c.value === selectedCrop)?.label} Image</Label>
                      <Input
                        id="crop-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-1"
                        disabled={loading}
                      />
                    </div>
                    {image && (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-gray-500">Preview:</span>
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-lg border border-green-200 shadow"
                        />
                      </div>
                    )}
                    <Button
                      onClick={handleDetect}
                      disabled={!image || loading || !model}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-lg py-2"
                    >
                      {loading && <Loader2 className="animate-spin h-5 w-5" />}
                      {loading ? "Detecting..." : "Detect Disease"}
                    </Button>
                    {result && (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-900 text-center text-lg font-semibold shadow">
                          <span>{result}</span>
                        </div>
                        {detectedDisease && detectedDisease !== 'Healthy' && !detectedDisease.includes('Healthy') && (
                          <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                                <h3 className="text-xl font-semibold text-orange-800">Disease Treatment Guide</h3>
                              </div>
                              {(() => {
                                const tips = getDiseaseTips(detectedDisease);
                                return (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold text-orange-700 mb-2">Severity Level</h4>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                          tips.severity === 'Very High' ? 'bg-red-100 text-red-800' :
                                          tips.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                                          tips.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800'
                                        }`}>
                                          {tips.severity}
                                        </span>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-orange-700 mb-2">Recommended Pesticide</h4>
                                        <p className="text-sm text-gray-700">{tips.pesticide}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4" />
                                        Treatment Steps
                                      </h4>
                                      <p className="text-sm text-gray-700 mb-3">{tips.treatment}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-orange-700 mb-2">Prevention Tips</h4>
                                      <p className="text-sm text-gray-700">{tips.prevention}</p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                        )}
                        {detectedDisease && (detectedDisease === 'Healthy' || detectedDisease.includes('Healthy')) && (
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="h-6 w-6 text-green-600" />
                                <h3 className="text-xl font-semibold text-green-800">Plant Health Status</h3>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-green-700 mb-2">Status</h4>
                                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Healthy
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-green-700 mb-2">Recommendations</h4>
                                  <p className="text-sm text-gray-700">Continue your current management practices. Maintain regular monitoring, proper fertilization, and good cultural practices to keep your plants healthy.</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                    {!result && !loading && image && (
                      <div className="text-center text-gray-400 text-sm">Upload an image and press Detect Disease</div>
                    )}
                    {!model && selectedCrop && !loading && (
                      <div className="text-center text-red-500 text-sm">Model not loaded. Please check your connection or model files.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DiseaseDetection; 