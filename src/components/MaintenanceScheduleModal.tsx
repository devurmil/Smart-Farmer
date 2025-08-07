import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Wrench, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/services/api";

interface MaintenanceScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentList: Array<{ id: string; name: string; status: string }>;
  onMaintenanceScheduled?: () => void;
}

const MaintenanceScheduleModal: React.FC<MaintenanceScheduleModalProps> = ({
  isOpen,
  onClose,
  equipmentList,
  onMaintenanceScheduled
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const maintenanceTypes = [
    { value: "routine", label: "Routine Maintenance" },
    { value: "repair", label: "Repair Work" },
    { value: "inspection", label: "Safety Inspection" },
    { value: "upgrade", label: "Equipment Upgrade" },
    { value: "emergency", label: "Emergency Repair" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form values:", {
      selectedEquipment,
      maintenanceType,
      scheduledDate,
      description
    });
    
    if (!selectedEquipment || !maintenanceType || !scheduledDate || !description) {
      alert("Please fill in all fields");
      console.log("Validation failed:", {
        selectedEquipment: !!selectedEquipment,
        maintenanceType: !!maintenanceType,
        scheduledDate: !!scheduledDate,
        description: !!description
      });
      return;
    }

    setLoading(true);
    
    try {
      const maintenanceData = {
        equipmentId: parseInt(selectedEquipment),
        type: maintenanceType,
        scheduledDate: scheduledDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        description
      };

      console.log("Scheduling maintenance:", maintenanceData);
      
      // Make actual API call
      const response = await api.post('/maintenance/schedule', maintenanceData);
      
      if (response.data.success) {
        alert("Maintenance scheduled successfully!");
        onClose();
        
        // Call callback to refresh dashboard data
        if (onMaintenanceScheduled) {
          onMaintenanceScheduled();
        }
        
        // Reset form
        setSelectedEquipment("");
        setMaintenanceType("");
        setScheduledDate(undefined);
        setDescription("");
      } else {
        throw new Error(response.data.error || 'Failed to schedule maintenance');
      }
      
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      console.error("Error details:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to schedule maintenance. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Schedule Equipment Maintenance
          </DialogTitle>
          <DialogDescription>
            Schedule maintenance for your equipment. This will make the equipment unavailable for booking on the scheduled date.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Equipment Selection */}
          <div className="space-y-2">
            <Label htmlFor="equipment">Select Equipment</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Choose equipment for maintenance" />
              </SelectTrigger>
              <SelectContent>
                {equipmentList.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.name} - {equipment.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance Type */}
          <div className="space-y-2">
            <Label htmlFor="maintenanceType">Maintenance Type</Label>
            <Select value={maintenanceType} onValueChange={setMaintenanceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select maintenance type" />
              </SelectTrigger>
              <SelectContent>
                {maintenanceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Date */}
          <div className="space-y-2">
            <Label>Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the maintenance work needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority Warning */}
          {maintenanceType === "emergency" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                Emergency maintenance will be prioritized and may affect equipment availability.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Maintenance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceScheduleModal; 