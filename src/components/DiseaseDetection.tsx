import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as tf from '@tensorflow/tfjs';
import { Loader2 } from 'lucide-react';
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

const cropOptions = [
  { label: "Cherry", value: "cherry" },
  // Add more crops here later
];

const CHERRY_MODEL_URL = '/models/cherry/model.json';
const CHERRY_LABELS = ['Healthy', 'Diseased']; // Update if you have more classes

const DiseaseDetection = () => {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  // Load model when cherry is selected
  useEffect(() => {
    if (selectedCrop === 'cherry' && !model) {
      tf.loadLayersModel(CHERRY_MODEL_URL)
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
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResult(null);
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
    try {
      const input = await preprocessImage(image);
      const prediction = model.predict(input) as tf.Tensor;
      const data = await prediction.data();
      const maxIdx = data.indexOf(Math.max(...data));
      setResult(CHERRY_LABELS[maxIdx] + ` (Confidence: ${(data[maxIdx] * 100).toFixed(1)}%)`);
      tf.dispose([input, prediction]);
    } catch (err) {
      setResult('Prediction failed');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <div className="hidden md:block">
          <Navigation />
        </div>
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
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
                {selectedCrop === "cherry" && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="cherry-image" className="text-green-700 font-semibold">Upload Cherry Image</Label>
                      <Input
                        id="cherry-image"
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
                      <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-900 text-center text-lg font-semibold shadow">
                        <span>{result}</span>
                      </div>
                    )}
                    {!result && !loading && image && (
                      <div className="text-center text-gray-400 text-sm">Upload an image and press Detect Disease</div>
                    )}
                    {!model && selectedCrop === 'cherry' && !loading && (
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