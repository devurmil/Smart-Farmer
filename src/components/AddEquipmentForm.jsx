import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react';

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
      
      const response = await fetch('http://localhost:5000/api/equipment', {
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
    <Card>
      <CardHeader>
        <CardTitle>Add Equipment</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="flex items-center p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Equipment Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., John Deere Tractor"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Equipment Type</Label>
            <Input
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="e.g., Tractor, Harvester, Planter"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price per Day (₹)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g., 2500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your equipment's features, condition, and availability..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Equipment Image</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" className="relative">
                <Upload className="w-4 h-4 mr-2" />
                {image ? image.name : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Equipment...
              </>
            ) : (
              'Add Equipment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEquipmentForm;