import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Wrench, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import equipmentOwnerService, { MaintenanceRecord } from "@/services/equipmentOwnerService";

// Using the MaintenanceRecord interface from the service

interface MaintenanceRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MaintenanceRecordsModal: React.FC<MaintenanceRecordsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await equipmentOwnerService.getMaintenanceRecords();
      setRecords(records);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceRecords();
    }
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Records
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading maintenance records...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMaintenanceRecords}>
              Try Again
            </Button>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No maintenance records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="border-l-4 border-l-blue-500">
                                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <CardTitle className="text-lg">{record.equipment?.name || `Equipment ${record.equipmentId}`}</CardTitle>
                     <div className="flex gap-2">
                       <Badge className={getStatusColor(record.status)}>
                         <div className="flex items-center gap-1">
                           {getStatusIcon(record.status)}
                           {record.status}
                         </div>
                       </Badge>
                       <Badge className={getPriorityColor(record.priority)}>
                         {record.priority} priority
                       </Badge>
                     </div>
                   </div>
                 </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maintenance Type</p>
                      <p className="text-base">{record.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Scheduled Date</p>
                      <p className="text-base flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(record.scheduledDate)}
                      </p>
                    </div>
                    {record.description && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-base">{record.description}</p>
                      </div>
                    )}
                                         {/* Additional fields can be added here when backend supports them */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceRecordsModal; 