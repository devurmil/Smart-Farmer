import api from './api';

export interface EquipmentOwnerStats {
  totalEquipment: number;
  activeBookings: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageRating: number;
  totalReviews: number;
  pendingRequests: number;
  maintenanceAlerts: number;
  equipmentUtilization: number;
}

export interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  type: string;
  scheduledDate: string;
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  equipment?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface Booking {
  id: number;
  equipment: string;
  customer: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  amount?: number;
  rating?: number;
}

export interface EquipmentStatus {
  id: number;
  name: string;
  status: 'available' | 'booked' | 'maintenance';
  location: string;
  lastMaintenance: string;
}

export interface EquipmentOwnerDashboardData {
  stats: EquipmentOwnerStats;
  upcomingBookings: Booking[];
  recentBookings: Booking[];
  equipmentStatus: EquipmentStatus[];
  maintenanceRecords: MaintenanceRecord[];
}

class EquipmentOwnerService {
  // Fetch dashboard statistics
  async getDashboardStats(): Promise<EquipmentOwnerStats> {
    try {
      // Get equipment count
      const equipmentResponse = await api.get('/equipment');
      const totalEquipment = equipmentResponse.data.total || 0;

      // Get owner bookings
      const bookingsResponse = await api.get('/booking/owner');
      const bookings = bookingsResponse.data.data || [];

      // Calculate active bookings (confirmed and pending)
      const activeBookings = bookings.filter((booking: any) => 
        ['confirmed', 'pending'].includes(booking.status)
      ).length;

      // Calculate pending requests
      const pendingRequests = bookings.filter((booking: any) => 
        booking.status === 'pending'
      ).length;

      // Calculate monthly revenue (completed bookings this month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.startDate);
        return booking.status === 'completed' && 
               bookingDate.getMonth() === currentMonth &&
               bookingDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyBookings.reduce((total: number, booking: any) => 
        total + (booking.totalAmount || 0), 0
      );

      // Calculate average rating
      const completedBookings = bookings.filter((booking: any) => 
        booking.status === 'completed' && booking.rating
      );
      const averageRating = completedBookings.length > 0 
        ? completedBookings.reduce((sum: number, booking: any) => sum + booking.rating, 0) / completedBookings.length
        : 0;

      // Mock data for fields not yet available in backend
      const revenueGrowth = 12.5; // This would need to be calculated from historical data
      const totalReviews = completedBookings.length;
      
      // Get maintenance records to calculate real maintenance alerts
      const maintenanceResponse = await api.get('/maintenance/records');
      const maintenanceRecords = maintenanceResponse.data.data || [];
      const maintenanceAlerts = maintenanceRecords.filter((record: any) => 
        record.status === 'scheduled' && new Date(record.scheduledDate) >= new Date()
      ).length;
      
      const equipmentUtilization = 78; // This would need to be calculated based on booking hours vs available hours

      return {
        totalEquipment,
        activeBookings,
        monthlyRevenue,
        revenueGrowth,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        pendingRequests,
        maintenanceAlerts,
        equipmentUtilization
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values if API fails
      return {
        totalEquipment: 0,
        activeBookings: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        averageRating: 0,
        totalReviews: 0,
        pendingRequests: 0,
        maintenanceAlerts: 0,
        equipmentUtilization: 0
      };
    }
  }

  // Fetch upcoming bookings
  async getUpcomingBookings(): Promise<Booking[]> {
    try {
      const response = await api.get('/booking/owner');
      const bookings = response.data.data || [];

      // Filter for upcoming bookings (confirmed and pending)
      const upcoming = bookings
        .filter((booking: any) => ['confirmed', 'pending'].includes(booking.status))
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5) // Get top 5 upcoming bookings
        .map((booking: any) => ({
          id: booking.id,
          equipment: booking.equipment?.name || 'Unknown Equipment',
          customer: booking.user?.name || 'Unknown Customer',
          date: new Date(booking.startDate).toLocaleDateString(),
          time: new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: booking.status
        }));

      return upcoming;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      return [];
    }
  }

  // Fetch recent bookings
  async getRecentBookings(): Promise<Booking[]> {
    try {
      const response = await api.get('/booking/owner');
      const bookings = response.data.data || [];

      // Filter for completed bookings
      const recent = bookings
        .filter((booking: any) => booking.status === 'completed')
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5) // Get top 5 recent bookings
        .map((booking: any) => ({
          id: booking.id,
          equipment: booking.equipment?.name || 'Unknown Equipment',
          customer: booking.user?.name || 'Unknown Customer',
          date: new Date(booking.startDate).toLocaleDateString(),
          time: new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: booking.status,
          amount: booking.totalAmount || 0,
          rating: booking.rating || 0
        }));

      return recent;
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  }

  // Fetch equipment status
  async getEquipmentStatus(): Promise<EquipmentStatus[]> {
    try {
      const response = await api.get('/equipment');
      const equipment = response.data.data || [];

      // Map equipment to status format
      const status = equipment.slice(0, 4).map((item: any) => ({
        id: item.id,
        name: item.name || 'Unknown Equipment',
        status: item.isAvailable ? 'available' : 'booked', // This is simplified - would need more complex logic
        location: item.location || 'Unknown Location',
        lastMaintenance: item.lastMaintenance || new Date().toLocaleDateString()
      }));

      return status;
    } catch (error) {
      console.error('Error fetching equipment status:', error);
      return [];
    }
  }

  // Fetch maintenance records
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    try {
      const response = await api.get('/maintenance/records');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      return [];
    }
  }

  // Fetch all dashboard data
  async getDashboardData(): Promise<EquipmentOwnerDashboardData> {
    try {
      const [stats, upcomingBookings, recentBookings, equipmentStatus, maintenanceRecords] = await Promise.all([
        this.getDashboardStats(),
        this.getUpcomingBookings(),
        this.getRecentBookings(),
        this.getEquipmentStatus(),
        this.getMaintenanceRecords()
      ]);

      return {
        stats,
        upcomingBookings,
        recentBookings,
        equipmentStatus,
        maintenanceRecords
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export default new EquipmentOwnerService(); 