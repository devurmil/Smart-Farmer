import api from './api';

export interface SupplierStats {
  totalSupplies: number;
  activeOrders: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageRating: number;
  totalReviews: number;
  pendingOrders: number;
  lowStockAlerts: number;
  orderFulfillmentRate: number;
}

export interface SupplyOrder {
  id: number;
  supply: string;
  buyer: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress?: string;
  contactPhone?: string;
  notes?: string;
}

export interface SupplyItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  status: 'active' | 'inactive' | 'out-of-stock';
  lastUpdated: string;
}

export interface SupplierDashboardData {
  stats: SupplierStats;
  recentOrders: SupplyOrder[];
  pendingOrders: SupplyOrder[];
  supplyInventory: SupplyItem[];
  topSellingSupplies: SupplyItem[];
}

class SupplierService {
  // Fetch dashboard statistics
  async getDashboardStats(): Promise<SupplierStats> {
    try {
      // Get supplies count
      const suppliesResponse = await api.get('/supplies/my-supplies');
      const totalSupplies = suppliesResponse.data.data?.length || 0;

      // Get supplier orders
      const ordersResponse = await api.get('/supplies/orders');
      const orders = ordersResponse.data || [];

      // Calculate active orders (confirmed and shipped)
      const activeOrders = orders.filter((order: any) => 
        ['confirmed', 'shipped'].includes(order.status)
      ).length;

      // Calculate pending orders
      const pendingOrders = orders.filter((order: any) => 
        order.status === 'pending'
      ).length;

      // Calculate monthly revenue (delivered orders this month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.orderDate);
        return order.status === 'delivered' && 
               orderDate.getMonth() === currentMonth &&
               orderDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyOrders.reduce((total: number, order: any) => 
        total + (order.totalPrice || 0), 0
      );

      // Calculate average rating (mock for now)
      const averageRating = 4.2; // This would need to be calculated from reviews
      const totalReviews = 15; // Mock data

      // Mock data for fields not yet available in backend
      const revenueGrowth = 8.5; // This would need to be calculated from historical data
      
      // Calculate low stock alerts
      const supplies = suppliesResponse.data.data || [];
      const lowStockAlerts = supplies.filter((supply: any) => 
        supply.stock < 10
      ).length;
      
      const orderFulfillmentRate = 94; // This would need to be calculated based on delivered vs total orders

      return {
        totalSupplies,
        activeOrders,
        monthlyRevenue,
        revenueGrowth,
        averageRating,
        totalReviews,
        pendingOrders,
        lowStockAlerts,
        orderFulfillmentRate
      };
    } catch (error) {
      console.error('Error fetching supplier dashboard stats:', error);
      // Return default values if API fails
      return {
        totalSupplies: 0,
        activeOrders: 0,
        monthlyRevenue: 0,
        revenueGrowth: 0,
        averageRating: 0,
        totalReviews: 0,
        pendingOrders: 0,
        lowStockAlerts: 0,
        orderFulfillmentRate: 0
      };
    }
  }

  // Fetch recent orders
  async getRecentOrders(): Promise<SupplyOrder[]> {
    try {
      const response = await api.get('/supplies/orders');
      const orders = response.data || [];

      // Filter for recent orders (delivered and shipped)
      const recent = orders
        .filter((order: any) => ['delivered', 'shipped'].includes(order.status))
        .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 5) // Get top 5 recent orders
        .map((order: any) => ({
          id: order.id,
          supply: order.supply?.name || 'Unknown Supply',
          buyer: order.buyer?.name || 'Unknown Buyer',
          quantity: order.quantity || 0,
          totalPrice: order.totalPrice || 0,
          orderDate: new Date(order.orderDate).toLocaleDateString(),
          status: order.status,
          deliveryAddress: order.deliveryAddress,
          contactPhone: order.contactPhone,
          notes: order.notes
        }));

      return recent;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  }

  // Fetch pending orders
  async getPendingOrders(): Promise<SupplyOrder[]> {
    try {
      const response = await api.get('/supplies/orders');
      const orders = response.data || [];

      // Filter for pending orders
      const pending = orders
        .filter((order: any) => order.status === 'pending')
        .sort((a: any, b: any) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
        .slice(0, 5) // Get top 5 pending orders
        .map((order: any) => ({
          id: order.id,
          supply: order.supply?.name || 'Unknown Supply',
          buyer: order.buyer?.name || 'Unknown Buyer',
          quantity: order.quantity || 0,
          totalPrice: order.totalPrice || 0,
          orderDate: new Date(order.orderDate).toLocaleDateString(),
          status: order.status,
          deliveryAddress: order.deliveryAddress,
          contactPhone: order.contactPhone,
          notes: order.notes
        }));

      return pending;
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      return [];
    }
  }

  // Fetch supply inventory
  async getSupplyInventory(): Promise<SupplyItem[]> {
    try {
      const response = await api.get('/supplies/my-supplies');
      const supplies = response.data.data || [];

      // Map supplies to inventory format
      const inventory = supplies.slice(0, 6).map((supply: any) => ({
        id: supply.id,
        name: supply.name || 'Unknown Supply',
        category: supply.category || 'General',
        price: supply.price || 0,
        stock: supply.stock || 0,
        unit: supply.unit || 'unit',
        status: supply.stock > 0 ? 'active' : 'out-of-stock',
        lastUpdated: new Date(supply.updatedAt || supply.createdAt).toLocaleDateString()
      }));

      return inventory;
    } catch (error) {
      console.error('Error fetching supply inventory:', error);
      return [];
    }
  }

  // Fetch top selling supplies
  async getTopSellingSupplies(): Promise<SupplyItem[]> {
    try {
      const response = await api.get('/supplies/my-supplies');
      const supplies = response.data.data || [];

      // Mock top selling logic - in real app this would be based on order history
      const topSelling = supplies
        .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0)) // Mock: sort by stock (higher stock = more popular)
        .slice(0, 4)
        .map((supply: any) => ({
          id: supply.id,
          name: supply.name || 'Unknown Supply',
          category: supply.category || 'General',
          price: supply.price || 0,
          stock: supply.stock || 0,
          unit: supply.unit || 'unit',
          status: supply.stock > 0 ? 'active' : 'out-of-stock',
          lastUpdated: new Date(supply.updatedAt || supply.createdAt).toLocaleDateString()
        }));

      return topSelling;
    } catch (error) {
      console.error('Error fetching top selling supplies:', error);
      return [];
    }
  }

  // Fetch all dashboard data
  async getDashboardData(): Promise<SupplierDashboardData> {
    try {
      const [stats, recentOrders, pendingOrders, supplyInventory, topSellingSupplies] = await Promise.all([
        this.getDashboardStats(),
        this.getRecentOrders(),
        this.getPendingOrders(),
        this.getSupplyInventory(),
        this.getTopSellingSupplies()
      ]);

      return {
        stats,
        recentOrders,
        pendingOrders,
        supplyInventory,
        topSellingSupplies
      };
    } catch (error) {
      console.error('Error fetching supplier dashboard data:', error);
      throw error;
    }
  }
}

export default new SupplierService();
