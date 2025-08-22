import api from './api';

export interface SupplierStats {
  totalSupplies: number;
  activeOrders: number;
  monthlyRevenue: number;
  averageRating: number;
  lowStockSupplies: number;
  outOfStockSupplies: number;
  totalInventoryValue: number;
}

export interface SupplyOrder {
  id: number;
  supplyId: number;
  buyerId: string;
  supplierId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryAddress?: string;
  contactPhone?: string;
  notes?: string;
  supply: {
    id: number;
    name: string;
    category: string;
    price: number;
    unit: string;
    availableQuantity: number;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface SupplyItem {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  availableQuantity: number;
  available: boolean;
  description?: string;
  brand?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface InventorySummary {
  totalSupplies: number;
  lowStockSupplies: number;
  outOfStockSupplies: number;
  totalValue: number;
  supplies: SupplyItem[];
}

export interface SupplierDashboardData {
  stats: SupplierStats;
  recentOrders: SupplyOrder[];
  pendingOrders: SupplyOrder[];
  inventory: SupplyItem[];
  topSellingSupplies: SupplyItem[];
}

export const supplierService = {
  // Get supplier dashboard data
  async getDashboardData(): Promise<SupplierDashboardData> {
    try {
      const [stats, recentOrders, pendingOrders, inventory, topSellingSupplies] = await Promise.all([
        this.getStats(),
        this.getRecentOrders(),
        this.getPendingOrders(),
        this.getInventory(),
        this.getTopSellingSupplies()
      ]);

      return {
        stats,
        recentOrders,
        pendingOrders,
        inventory,
        topSellingSupplies
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Get supplier statistics
  async getStats(): Promise<SupplierStats> {
    try {
      const inventorySummary = await this.getInventorySummary();
      
      // Calculate stats from inventory and orders
      const totalSupplies = inventorySummary.totalSupplies;
      const lowStockSupplies = inventorySummary.lowStockSupplies;
      const outOfStockSupplies = inventorySummary.outOfStockSupplies;
      const totalInventoryValue = inventorySummary.totalValue;

      // Get orders for additional stats
      const orders = await this.getOrders();
      const activeOrders = orders.filter(order => 
        ['pending', 'confirmed', 'shipped'].includes(order.status)
      ).length;

      // Calculate monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRevenue = orders
        .filter(order => 
          order.status === 'delivered' && 
          new Date(order.orderDate) >= thirtyDaysAgo
        )
        .reduce((sum, order) => sum + order.totalPrice, 0);

      // Mock average rating (you can implement real rating system later)
      const averageRating = 4.2;

      return {
        totalSupplies,
        activeOrders,
        monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
        averageRating,
        lowStockSupplies,
        outOfStockSupplies,
        totalInventoryValue
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get inventory summary
  async getInventorySummary(): Promise<InventorySummary> {
    try {
      const response = await api.get('/supplies/inventory-summary');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      throw error;
    }
  },

  // Get recent orders
  async getRecentOrders(): Promise<SupplyOrder[]> {
    try {
      const response = await api.get('/supplies/orders');
      const orders = response.data;
      return orders
        .filter(order => order.status === 'delivered')
        .slice(0, 5); // Get last 5 delivered orders
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  // Get pending orders
  async getPendingOrders(): Promise<SupplyOrder[]> {
    try {
      const response = await api.get('/supplies/orders');
      const orders = response.data;
      return orders.filter(order => 
        ['pending', 'confirmed'].includes(order.status)
      );
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      throw error;
    }
  },

  // Get all orders
  async getOrders(): Promise<SupplyOrder[]> {
    try {
      const response = await api.get('/supplies/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get inventory
  async getInventory(): Promise<SupplyItem[]> {
    try {
      const response = await api.get('/supplies/my-supplies');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Get top selling supplies
  async getTopSellingSupplies(): Promise<SupplyItem[]> {
    try {
      const orders = await this.getOrders();
      const supplySales = new Map<number, { supply: SupplyItem; totalSold: number }>();

      // Calculate total sold for each supply
      orders.forEach(order => {
        if (order.status === 'delivered') {
          const existing = supplySales.get(order.supplyId);
          if (existing) {
            existing.totalSold += order.quantity;
          } else {
            supplySales.set(order.supplyId, {
              supply: order.supply as SupplyItem,
              totalSold: order.quantity
            });
          }
        }
      });

      // Sort by total sold and return top 5
      return Array.from(supplySales.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)
        .map(item => item.supply);
    } catch (error) {
      console.error('Error fetching top selling supplies:', error);
      throw error;
    }
  },

  // Update supply quantity (restocking)
  async updateSupplyQuantity(supplyId: number, newQuantity: number): Promise<any> {
    try {
      const response = await api.put(`/supplies/${supplyId}/quantity`, { quantity: newQuantity });
      return response.data;
    } catch (error) {
      console.error('Error updating supply quantity:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, status: string): Promise<any> {
    try {
      const response = await api.put(`/supplies/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};
