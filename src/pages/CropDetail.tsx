import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import cropData from '../lib/cropData.json';
import { Calendar, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const featureImages = [
  { key: 'calendar', label: 'Planting/Harvesting Calendar' },
  { key: 'fertilizer', label: 'Fertilizer' },
  { key: 'soil', label: 'Soil Preparation' },
  { key: 'harvest', label: 'Harvesting Time' },
];

const bajraImages = {
  main: '/crops/bajra/bajra.jpeg',
  bg: '/crops/bajra/bg.jpg',
  water: '/crops/bajra/water.jpeg',
  fertilizer: '/crops/bajra/fertilizer.png',
  soil: '/crops/bajra/soil.jpg',
};

// Add a helper to get the correct image extension for icon and water images for each crop
const cropImageExtensions = {
  bajra: { icon: 'jpeg', water: 'jpeg', fertilizer: 'png', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  castor: { icon: 'avif', water: 'jpeg', fertilizer: 'webp', soil: 'jpeg', bg: 'webp', stage: 'jpg' },
  cotton: { icon: 'jpg', water: 'webp', fertilizer: 'jpg', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  cumin: { icon: 'webp', water: 'jpg', fertilizer: 'jpg', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  groundnut: { icon: 'jpg', water: 'jpg', fertilizer: 'jpg', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  maize: { icon: 'jpg', water: 'jpg', fertilizer: 'jpg', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  onion: { icon: 'jpg', water: 'jpg', fertilizer: 'jpg', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  potato: { icon: 'jpg', water: 'jpg', fertilizer: 'jpg', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  rice: { icon: 'jpg', water: 'jpg', fertilizer: 'jpg', soil: 'webp', bg: 'jpg', stage: 'jpg' },
  sugarcane: { icon: 'jpg', water: 'jpg', fertilizer: 'jpg', soil: 'webp', bg: 'jpg', stage: 'jpg' },
  tomato: { icon: 'jpg', water: 'jpg', fertilizer: 'webp', soil: 'jpg', bg: 'jpg', stage: 'jpg' },
  wheat: { icon: 'webp', water: 'jpg', fertilizer: 'webp', soil: 'webp', bg: 'jpg', stage: 'jpg' }
};

function getCropImages(cropName: string) {
  const slug = getCropSlug(cropName);
  
  // List of crops that have image folders
  const availableCrops = ['bajra', 'castor', 'cotton', 'cumin', 'groundnut', 'maize', 'onion', 'potato', 'rice', 'sugarcane', 'tomato', 'wheat'];
  
  // If crop doesn't have a dedicated folder, return null to use fallback
  if (!availableCrops.includes(slug)) {
    return null;
  }
  
  const extensions = cropImageExtensions[slug];
  
  return {
    icon: `/crops/${slug}/icon.${extensions.icon}`,
    background: `/crops/${slug}/bg.${extensions.bg}`,
    fertilizer: `/crops/${slug}/fertilizer.${extensions.fertilizer}`,
    water: `/crops/${slug}/water.${extensions.water}`,
    soil: `/crops/${slug}/soil.${extensions.soil}`,
    stage: `/crops/${slug}/stage.${extensions.stage}`
  };
}

function getCropSlug(name) {
  return name.toLowerCase().replace(/\s*\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '');
}

// Add a mapping for detailed crop practices
const cropPractices = {
  "Wheat": {
    irrigation: "Irrigate every 10-12 days, especially at critical stages (crown root initiation, tillering, jointing, booting, heading, and grain filling). Use furrow or sprinkler irrigation. Avoid waterlogging.",
    fertilizer: "Apply NPK 120:60:40 kg/ha. Use 1/2 nitrogen and all phosphorus and potassium as basal at sowing, and the rest nitrogen at first irrigation. Place fertilizer 5-7 cm deep and 5-7 cm away from seed.",
    soil: "Plough 2-3 times to a depth of 15-20 cm. Level the field and remove weeds. Use a rotavator or harrow for fine tilth. Apply well-decomposed manure before last ploughing."
  },
  "Cotton": {
    irrigation: "Irrigate every 7-10 days. Critical stages: flowering and boll formation. Use furrow irrigation. Avoid waterlogging and excessive irrigation.",
    fertilizer: "Apply NPK 150:75:75 kg/ha. Basal dose at sowing, top-dress nitrogen in 2-3 splits. Place fertilizer in bands 5 cm away from seed. Foliar spray micronutrients if deficiency appears.",
    soil: "Deep plough to 25-30 cm. Use a disc harrow for fine tilth. Remove previous crop residues. Raised beds or ridges help drainage."
  },
  "Groundnut": {
    irrigation: "Irrigate every 8-10 days. Critical at flowering and pod formation. Use furrow or sprinkler irrigation. Avoid waterlogging.",
    fertilizer: "Apply NPK 20:40:0 kg/ha. Apply all at sowing. Gypsum (250 kg/ha) at flowering for better pod filling. Place fertilizer in furrows or bands.",
    soil: "Plough to 20 cm. Use sandy loam, well-drained soil. Add organic manure. Avoid compacted soils."
  },
  "Rice": {
    irrigation: "Maintain continuous flooding (2-5 cm) during vegetative and reproductive stages. Drain water 1-2 weeks before harvest. Use alternate wetting and drying for water saving.",
    fertilizer: "Apply NPK 100:50:50 kg/ha. Basal dose at transplanting, top-dress nitrogen in 2-3 splits. Use urea deep placement if possible.",
    soil: "Puddle and level the field. Use a rotavator or puddler. Remove weeds and stubble. Apply organic manure before puddling."
  },
  "Sugarcane": {
    irrigation: "Irrigate every 7-12 days. Critical at tillering, grand growth, and maturity. Use furrow or drip irrigation. Avoid water stagnation.",
    fertilizer: "Apply NPK 250:115:115 kg/ha. Split nitrogen and potassium into 3-4 doses. Apply basal at planting, then at 45, 90, and 120 days. Place fertilizer in furrows beside the setts.",
    soil: "Deep plough to 30 cm. Make ridges and furrows. Add organic manure. Use well-drained, loamy soil."
  },
  "Maize": {
    irrigation: "Irrigate every 7-10 days. Critical at 8-10 leaf stage, flowering, and grain filling. Use furrow or drip irrigation. Water 20-30 mm per event on light soils, 40 mm on clay soils.",
    fertilizer: "Apply NPK 120:60:40 kg/ha. Basal dose at sowing, top-dress nitrogen in 2-3 splits (at 30 and 60 days). Place fertilizer 5 cm beside and below seed. Foliar spray if deficiency appears.",
    soil: "Plough to 20 cm. Use a harrow or rotavator for fine tilth. Remove weeds. Add organic manure before last ploughing."
  },
  "Bajra (Pearl Millet)": {
    irrigation: "Irrigate every 10-15 days. Critical at booting and grain filling. Use furrow irrigation. Avoid waterlogging.",
    fertilizer: "Apply NPK 60:40:20 kg/ha. All as basal at sowing. Place fertilizer in bands 5 cm away from seed. Add organic manure for better yield.",
    soil: "Light, sandy loam. Plough to 15-20 cm. Use a harrow for fine tilth. Add compost or FYM."
  },
  "Castor": {
    irrigation: "Irrigate every 12-15 days. Critical at flowering and capsule formation. Use furrow irrigation. Avoid water stagnation.",
    fertilizer: "Apply NPK 80:40:40 kg/ha. Basal dose at sowing, top-dress nitrogen at 30 and 60 days. Place fertilizer in bands beside seed.",
    soil: "Well-drained, sandy loam. Plough to 20 cm. Add organic manure. Avoid saline soils."
  },
  "Potato": {
    irrigation: "Irrigate every 7-10 days. Critical at tuber initiation and bulking. Use furrow or sprinkler irrigation. Avoid waterlogging.",
    fertilizer: "Apply NPK 150:100:100 kg/ha. Basal dose at planting, top-dress nitrogen at 30 and 60 days. Place fertilizer in furrows. Add potash for better tuber quality.",
    soil: "Loose, friable, well-drained. Plough to 20-25 cm. Use a harrow for fine tilth. Add compost or FYM."
  },
  "Tomato": {
    irrigation: "Irrigate every 5-7 days. Critical at flowering and fruit set. Use drip or furrow irrigation. Avoid wetting foliage to prevent disease.",
    fertilizer: "Apply NPK 100:50:50 kg/ha. Basal dose at transplanting, top-dress nitrogen at 30 and 60 days. Foliar spray micronutrients if needed.",
    soil: "Well-tilled, rich in organic matter. Plough to 20 cm. Add compost or FYM. Use raised beds for drainage."
  },
  "Onion": {
    irrigation: "Irrigate every 7-10 days. Critical at bulb formation. Use furrow or drip irrigation. Avoid waterlogging.",
    fertilizer: "Apply NPK 100:50:50 kg/ha. Basal dose at transplanting, top-dress nitrogen at 30 and 60 days. Place fertilizer in bands beside rows.",
    soil: "Loose, well-drained. Plough to 15-20 cm. Add compost or FYM. Level the field for uniform irrigation."
  },
  "Cumin": {
    irrigation: "Irrigate every 10-15 days. Critical at flowering and seed setting. Use furrow irrigation. Avoid excess moisture.",
    fertilizer: "Apply NPK 60:30:20 kg/ha. All as basal at sowing. Place fertilizer in bands. Add organic manure for better yield.",
    soil: "Sandy loam, well-drained. Plough to 15-20 cm. Add compost or FYM."
  }
};

const unitLabels = {
  acre: 'Acre',
  hectare: 'Hectare',
  sq_meter: 'Sq Meter',
  bigha: 'Bigha',
};

const CropDetail = () => {
  const { cropName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Get unit from query string
  const params = new URLSearchParams(location.search);
  const selectedUnit = params.get('unit') || 'acre';
  const crop = cropData.find(c => getCropSlug(c.name) === cropName);
  const slug = crop ? getCropSlug(crop.name) : cropName;

  // Get crop images using the same method as CostPlanning
  const cropImages = getCropImages(crop?.name || '');
  
  // Use cropImages or fallback to crop.image, with better fallbacks for missing sections
  const iconSrc = cropImages ? cropImages.icon : (crop?.image || '/placeholder.svg');
  const waterSrc = cropImages ? cropImages.water : (crop?.image || '/placeholder.svg');
  const fertilizerSrc = cropImages ? cropImages.fertilizer : (crop?.image || '/placeholder.svg');
  const soilSrc = cropImages ? cropImages.soil : (crop?.image || '/placeholder.svg');
  const stageSrc = cropImages ? cropImages.stage : (crop?.image || '/placeholder.svg');
  const bgSrc = cropImages ? cropImages.background : (crop?.image || '/placeholder.svg');

  if (!crop) {
    return <div className="p-8 text-center">Crop not found. <Link to="/cost-planning" className="text-blue-600 underline">Back to Cost Planning</Link></div>;
  }

  // Add a main card above the detail cards
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-6xl flex justify-center items-center" style={{ backgroundImage: `url(${bgSrc})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '2rem', width: '80vw', minHeight: '80vh', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div className="max-w-3xl w-full p-8 relative z-10">
          <button
            onClick={() => navigate('/cost-planning')}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-green-100 border border-green-200 rounded-lg shadow transition-colors mb-4"
            aria-label="Back to Cost Planning"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-full max-w-2xl mx-auto mb-10">
            <div className="border rounded-2xl bg-white shadow-lg flex flex-row items-center gap-6 p-8">
              <img src={iconSrc} alt={crop.name} className="w-24 h-24 object-cover rounded-xl border-2 border-green-100 shadow-sm" />
              <div className="flex-1">
                <div className="text-3xl font-bold text-gray-900 mb-2">{crop.name}</div>
                <div className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-lg font-semibold inline-block">
                  ₹{crop.cost?.[selectedUnit]?.toLocaleString('en-IN') || '-'} / {unitLabels[selectedUnit] || selectedUnit}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-8 w-full">
            {/* Planting & Harvesting Card */}
            <div className="border rounded-lg p-4 bg-white flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold">Planting & Harvesting</h2>
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-medium">Planting Months:</span> {crop.planting_months}
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-medium">Harvesting Time:</span> {crop.harvesting_time}
              </div>
            </div>
            {/* Irrigation/Water */}
            <div className="border rounded-lg p-6 bg-white flex flex-row items-center gap-6 w-full max-w-2xl mx-auto">
              <img src={waterSrc} alt="Water Example" className="w-40 h-28 object-cover rounded border border-gray-200" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <img src={waterSrc} alt="Water" className="h-6 w-6 rounded" />
                  <h2 className="text-lg font-semibold">Water Timing</h2>
                </div>
                <div className="mb-2 text-gray-800 text-base font-medium">{crop.water_timing}</div>
                <div className="text-sm text-gray-700 mt-2 font-normal">{cropPractices[crop.name]?.irrigation}</div>
              </div>
            </div>
            {/* Fertilizer */}
            <div className="border rounded-lg p-6 bg-white flex flex-row items-center gap-6 w-full max-w-2xl mx-auto">
              <img src={fertilizerSrc} alt="Fertilizer Example" className="w-40 h-28 object-cover rounded border border-gray-200" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <img src={fertilizerSrc} alt="Fertilizer" className="h-6 w-6 rounded" />
                  <h2 className="text-lg font-semibold">Fertilizers</h2>
                </div>
                <div className="mb-2 text-gray-800 text-base font-medium">{crop.fertilizers}</div>
                <div className="text-sm text-gray-700 mt-2 font-normal">{cropPractices[crop.name]?.fertilizer}</div>
              </div>
            </div>
            {/* Soil Preparation */}
            <div className="border rounded-lg p-6 bg-white flex flex-row items-center gap-6 w-full max-w-2xl mx-auto">
              <img src={soilSrc} alt="Soil Example" className="w-40 h-28 object-cover rounded border border-gray-200" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <img src={soilSrc} alt="Soil" className="h-6 w-6 rounded" />
                  <h2 className="text-lg font-semibold">Soil Preparation</h2>
                </div>
                <div className="mb-2 text-gray-800 text-base font-medium">{crop.soil_preparation}</div>
                <div className="text-sm text-gray-700 mt-2 font-normal">{cropPractices[crop.name]?.soil}</div>
              </div>
            </div>
            {/* Growth Stage */}
            {stageSrc && (
              <div className="w-full flex flex-col items-center mt-12">
                <div className="bg-white/80 rounded-xl p-6 w-full max-w-2xl flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">Growth Stage of {crop.name}</h2>
                  <img src={stageSrc} alt={`Growth Stage of ${crop.name}`} className="w-full max-w-2xl max-h-[350px] object-contain rounded-xl border border-gray-200 shadow mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetail;

