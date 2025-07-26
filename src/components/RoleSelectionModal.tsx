import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Store, Truck } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useUser();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer',
      description: 'I grow crops and manage farms',
      icon: User,
      color: 'bg-green-500',
      features: [
        'Access to farming tools and equipment',
        'Crop management and planning',
        'Weather monitoring',
        'Market intelligence'
      ]
    },
    {
      id: 'owner',
      title: 'Equipment Owner',
      description: 'I own and rent out farming equipment',
      icon: Store,
      color: 'bg-blue-500',
      features: [
        'List and manage your equipment',
        'Track bookings and earnings',
        'Manage rental schedules',
        'Connect with farmers'
      ]
    },
    {
      id: 'supplier',
      title: 'Supplier',
      description: 'I supply farming materials and products',
      icon: Truck,
      color: 'bg-purple-500',
      features: [
        'List your products and supplies',
        'Manage inventory and orders',
        'Connect with farmers',
        'Track sales and deliveries'
      ]
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/select-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user context with new role
        updateUser(data.data.user);
        onClose();
      } else {
        alert(data.message || 'Failed to select role');
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      alert('Failed to select role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Smart Farm India! 🚜
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Please select your role to get started with the platform
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{role.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            className="px-8 py-3 text-lg"
            size="lg"
          >
            {isSubmitting ? 'Setting up your account...' : 'Continue with Selected Role'}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          You can change your role later in your profile settings
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal; 