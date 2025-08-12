import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';
import api from '@/services/api';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Search, Filter, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Wrench } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
  type: string;
  available: boolean;
}

interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  equipment?: Equipment;
  type: 'routine' | 'repair' | 'inspection' | 'upgrade' | 'emergency';
  scheduledDate: string;
  description?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  completedDate?: string;
  notes?: string;
  cost?: number;
  technician?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

const MaintenancePage: React.FC = () => {
  const { user } = useUser();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [maintenanceType, setMaintenanceType] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [technician, setTechnician] = useState('');
  const [cost, setCost] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  // UI states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenanceResponse, equipmentResponse] = await Promise.all([
        api.get('/maintenance/records'),
        api.get('/equipment/owner')
      ]);
      
      console.log('Maintenance response:', maintenanceResponse.data);
      console.log('Equipment response:', equipmentResponse.data);
      
      // Handle maintenance records response structure
      const maintenanceData = maintenanceResponse.data.success 
        ? maintenanceResponse.data.data 
        : maintenanceResponse.data;
      
      console.log('Processed maintenance data:', maintenanceData);
      
      // Ensure it's an array
      const finalMaintenanceData = Array.isArray(maintenanceData) ? maintenanceData : [];
      setMaintenanceRecords(finalMaintenanceData);
      
      // Handle equipment response structure
      const equipmentData = equipmentResponse.data.data || equipmentResponse.data;
      const finalEquipmentData = Array.isArray(equipmentData) ? equipmentData : [];
      setEquipmentList(finalEquipmentData);
      
      console.log('Final maintenance records:', finalMaintenanceData);
      console.log('Final equipment list:', finalEquipmentData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load maintenance data');
      // Set empty arrays to prevent filter errors
      setMaintenanceRecords([]);
      setEquipmentList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = async () => {
    if (!selectedEquipment || !maintenanceType || !scheduledDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const maintenanceData = {
        equipmentId: parseInt(selectedEquipment),
        type: maintenanceType,
        scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
        description,
        priority,
        technician: technician || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        notes: notes || undefined
      };

      await api.post('/maintenance/schedule', maintenanceData);
      setIsScheduleModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Error scheduling maintenance:', err);
      alert(err.response?.data?.error || 'Failed to schedule maintenance');
    }
  };

  const handleUpdateStatus = async (recordId: number, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completedDate = new Date().toISOString();
      }
      
      await api.put(`/maintenance/${recordId}/status`, updateData);
      fetchData();
    } catch (err: any) {
      console.error('Error updating maintenance status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleEditRecord = async () => {
    if (!editingRecord) return;

    try {
      const updateData = {
        type: editingRecord.type,
        scheduledDate: editingRecord.scheduledDate,
        description: editingRecord.description,
        priority: editingRecord.priority,
        technician: editingRecord.technician,
        cost: editingRecord.cost,
        notes: editingRecord.notes
      };

      await api.put(`/maintenance/${editingRecord.id}`, updateData);
      setIsEditModalOpen(false);
      setEditingRecord(null);
      fetchData();
    } catch (err: any) {
      console.error('Error updating maintenance record:', err);
      alert(err.response?.data?.error || 'Failed to update record');
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
      await api.delete(`/maintenance/${recordId}`);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting maintenance record:', err);
      alert(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const resetForm = () => {
    setSelectedEquipment('');
    setMaintenanceType('');
    setScheduledDate(undefined);
    setDescription('');
    setPriority('medium');
    setTechnician('');
    setCost('');
    setNotes('');
  };

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
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'routine': return <Wrench className="h-4 w-4" />;
      case 'repair': return <AlertTriangle className="h-4 w-4" />;
      case 'inspection': return <Search className="h-4 w-4" />;
      case 'upgrade': return <CheckCircle className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  // Filter records
  const filteredRecords = (maintenanceRecords || []).filter(record => {
    const matchesSearch = record.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.technician?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: maintenanceRecords?.length || 0,
    scheduled: (maintenanceRecords || []).filter(r => r.status === 'scheduled').length,
    inProgress: (maintenanceRecords || []).filter(r => r.status === 'in-progress').length,
    completed: (maintenanceRecords || []).filter(r => r.status === 'completed').length,
    cancelled: (maintenanceRecords || []).filter(r => r.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading maintenance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Management</h1>
          <p className="text-muted-foreground">Manage all equipment maintenance operations</p>
        </div>
        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Maintenance</DialogTitle>
              <DialogDescription>
                Schedule maintenance for your equipment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Equipment *</Label>
                <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map((equipment) => (
                      <SelectItem key={equipment.id} value={equipment.id.toString()}>
                        {equipment.name} ({equipment.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Maintenance Type *</Label>
                <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Scheduled Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the maintenance work needed"
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="technician">Technician</Label>
                <Input
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  placeholder="Technician name"
                />
              </div>
              
              <div>
                <Label htmlFor="cost">Estimated Cost</Label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleScheduleMaintenance} className="flex-1">
                  Schedule
                </Button>
                <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by equipment, description, or technician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
                         <div className="text-center py-8">
               <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground">No maintenance records found</p>
             </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <Card key={record.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(record.type)}
                        <h3 className="font-semibold">
                          {record.equipment?.name || `Equipment ${record.equipmentId}`}
                        </h3>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(record.priority)}>
                          {record.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Type:</span> {record.type}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {format(new Date(record.scheduledDate), 'MMM dd, yyyy')}
                        </div>
                        <div>
                          <span className="font-medium">Technician:</span> {record.technician || 'Not assigned'}
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> {record.cost ? `$${record.cost}` : 'Not specified'}
                        </div>
                      </div>
                      
                      {record.description && (
                        <p className="text-sm mt-2">{record.description}</p>
                      )}
                      
                      {record.completedDate && (
                        <p className="text-sm text-green-600 mt-1">
                          Completed: {format(new Date(record.completedDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {record.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(record.id, 'in-progress')}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(record.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {record.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(record.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      
                      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Maintenance Record</DialogTitle>
                            <DialogDescription>
                              Update maintenance details
                            </DialogDescription>
                          </DialogHeader>
                          {editingRecord && (
                            <div className="space-y-4">
                              <div>
                                <Label>Equipment</Label>
                                <p className="text-sm text-muted-foreground">
                                  {editingRecord.equipment?.name || `Equipment ${editingRecord.equipmentId}`}
                                </p>
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-type">Type</Label>
                                <Select 
                                  value={editingRecord.type} 
                                  onValueChange={(value) => setEditingRecord({...editingRecord, type: value as any})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="repair">Repair</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="upgrade">Upgrade</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-date">Scheduled Date</Label>
                                <Input
                                  type="date"
                                  value={editingRecord.scheduledDate}
                                  onChange={(e) => setEditingRecord({...editingRecord, scheduledDate: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  value={editingRecord.description || ''}
                                  onChange={(e) => setEditingRecord({...editingRecord, description: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select 
                                  value={editingRecord.priority} 
                                  onValueChange={(value) => setEditingRecord({...editingRecord, priority: value as any})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-technician">Technician</Label>
                                <Input
                                  value={editingRecord.technician || ''}
                                  onChange={(e) => setEditingRecord({...editingRecord, technician: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-cost">Cost</Label>
                                <Input
                                  type="number"
                                  value={editingRecord.cost || ''}
                                  onChange={(e) => setEditingRecord({...editingRecord, cost: parseFloat(e.target.value) || undefined})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea
                                  value={editingRecord.notes || ''}
                                  onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button onClick={handleEditRecord} className="flex-1">
                                  Update
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingRecord(null);
                                  }} 
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenancePage;
