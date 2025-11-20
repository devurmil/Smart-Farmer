import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

const AddSupplyForm = ({ onSupplyAdded, isAdmin = false, suppliers = [], onClose }) => {
  const { user, token } = useUser();
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'piece',
    quantity: '1',
    description: '',
    brand: '',
    expiryDate: '',
    supplierId: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    console.log('AddSupplyForm - User:', user);
    console.log('AddSupplyForm - Token:', token ? 'Present' : 'Not Present');
    
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'supplierId' && !isAdmin) return; // Only send supplierId if admin
        if (value) formData.append(key, value);
      });
      if (image) formData.append('image', image);
      
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {};
      
      const response = await fetch(`${getBackendUrl()}/api/supplies`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add supply');
      }
      
      setSuccess('Supply added successfully!');
      setForm({ 
        name: '', 
        category: '', 
        price: '', 
        unit: 'piece',
        quantity: '1',
        description: '',
        brand: '',
        expiryDate: '',
        supplierId: ''
      });
      setImage(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Notify parent component to refresh the supply list
      if (onSupplyAdded) {
        onSupplyAdded();
      }
      if (onClose) onClose();
      
    } catch (err) {
      setError(err.message || 'Failed to add supply');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'seeds', label: 'Seeds' },
    { value: 'fertilizers', label: 'Fertilizers' },
    { value: 'pesticides', label: 'Pesticides' },
    { value: 'tools', label: 'Tools' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'packet', label: 'Packet' },
    { value: 'bag', label: 'Bag' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'box', label: 'Box' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Supply</CardTitle>
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
          {isAdmin && suppliers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="supplierId">Select Supplier</Label>
              <select
                id="supplierId"
                name="supplierId"
                value={form.supplierId}
                onChange={handleChange}
                required
                className="h-12 w-full px-4 text-lg border-2 border-border focus:border-primary rounded-lg bg-background text-foreground"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name} ({supplier.email})</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supply Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Wheat Seeds, NPK Fertilizer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g., 500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={form.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Available Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g., 100"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand (Optional)</Label>
              <Input
                id="brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g., Bayer, Syngenta"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your supply, its features, quality, and any important details..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Supply Image</Label>
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
                Adding Supply...
              </>
            ) : (
              'Add Supply'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddSupplyForm; 