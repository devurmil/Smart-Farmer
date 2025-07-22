import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const AddEquipmentForm = ({ onEquipmentAdded }) => {
  const { user, token } = useUser();
  const [form, setForm] = useState({ name: '', type: '', price: '', description: '' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (image) formData.append('image', image);
      
      const response = await fetch(`${getBackendUrl()}/api/equipment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to add equipment');
      
      setSuccess('Equipment added successfully!');
      setForm({ name: '', type: '', price: '', description: '' });
      setImage(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Notify parent component to refresh the equipment list
      if (onEquipmentAdded) {
        onEquipmentAdded();
      }
      
    } catch (err) {
      setError(err.message || 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="p-1 bg-green-100 rounded-full mr-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-green-800 font-semibold">Equipment Added Successfully!</h4>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="p-1 bg-red-100 rounded-full mr-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="text-red-800 font-semibold">Error Adding Equipment</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-lg font-semibold text-gray-800">Equipment Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., John Deere 5050D Tractor"
              required
              className="h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-lg"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="type" className="text-lg font-semibold text-gray-800">Equipment Type</Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="h-12 w-full px-4 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-lg bg-white"
            >
              <option value="">Select Equipment Type</option>
              <option value="Tractor">Tractor</option>
              <option value="Harvester">Harvester</option>
              <option value="Planter">Planter</option>
              <option value="Cultivator">Cultivator</option>
              <option value="Thresher">Thresher</option>
              <option value="Irrigation">Irrigation System</option>
              <option value="Sprayer">Sprayer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="price" className="text-lg font-semibold text-gray-800">Price per Day (₹)</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xl text-gray-500">₹</span>
            </div>
            <Input
              id="price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="2500"
              required
              className="h-12 pl-10 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-lg"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="description" className="text-lg font-semibold text-gray-800">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your equipment's features, condition, year, and availability details..."
            rows={4}
            className="text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-lg resize-none"
          />
        </div>
        
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-gray-800">Equipment Image</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg text-gray-600 font-medium">
                    {image ? (
                      <span className="text-emerald-600">✓ {image.name}</span>
                    ) : (
                      'Click to upload or drag and drop'
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              Adding Equipment...
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 mr-3" />
              Add Equipment to Marketplace
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddEquipmentForm;