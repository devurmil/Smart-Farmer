
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import FarmCalculator from "@/components/FarmCalculator";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="flex">
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Farm Area Calculator 📐
              </h1>
              <p className="text-gray-600">
                Calculate your farm area accurately using our interactive mapping tools. 
                Perfect for land measurement, planning, and documentation.
              </p>
            </div>

            <FarmCalculator />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calculator;
