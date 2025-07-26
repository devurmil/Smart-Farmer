import { useEffect, useRef, useCallback, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';

interface SSEEvent {
  type: string;
  message: string;
  booking?: any;
  equipment?: any;
}

interface UseSSEOptions {
  onBookingCreated?: (data: any) => void;
  onBookingApproved?: (data: any) => void;
  onBookingRejected?: (data: any) => void;
  onBookingCompleted?: (data: any) => void;
  onBookingCancelled?: (data: any) => void;
  onBookingUpdated?: (data: any) => void;
  onNewBooking?: (data: any) => void;
  onConnected?: () => void;
}

// Global SSE connection manager
const globalSSEManager = {
  eventSource: null as EventSource | null,
  isConnected: false,
  listeners: new Set<(connected: boolean) => void>(),
  options: {} as UseSSEOptions,
  
  addListener(listener: (connected: boolean) => void) {
    this.listeners.add(listener);
    // Immediately notify of current status
    listener(this.isConnected);
  },
  
  removeListener(listener: (connected: boolean) => void) {
    this.listeners.delete(listener);
  },
  
  notifyListeners(connected: boolean) {
    this.isConnected = connected;
    this.listeners.forEach(listener => listener(connected));
  },
  
  setOptions(options: UseSSEOptions) {
    this.options = options;
  }
};

export const useSSE = (options: UseSSEOptions = {}) => {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const connectingRef = useRef(false);

  // Update global options
  useEffect(() => {
    globalSSEManager.setOptions(options);
  }, [options]);

  const connect = useCallback(async () => {
    if (!user || connectingRef.current || globalSSEManager.isConnected) return;

    connectingRef.current = true;

    try {
      const backendUrl = await getBackendUrl();
      const url = `${backendUrl}/api/booking/stream`;
      
      // Close existing connection if any
      if (globalSSEManager.eventSource) {
        globalSSEManager.eventSource.close();
        globalSSEManager.eventSource = null;
      }

      // Create new EventSource with credentials
      const eventSource = new EventSource(url, { withCredentials: true });
      globalSSEManager.eventSource = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection established');
        globalSSEManager.notifyListeners(true);
        connectingRef.current = false;
        globalSSEManager.options.onConnected?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('SSE event received:', data);

          switch (data.type) {
            case 'connected':
              // Don't call onConnected here since it's already called in onopen
              break;
            case 'booking_created':
              globalSSEManager.options.onBookingCreated?.(data);
              break;
            case 'booking_approved':
              globalSSEManager.options.onBookingApproved?.(data);
              break;
            case 'booking_rejected':
              globalSSEManager.options.onBookingRejected?.(data);
              break;
            case 'booking_completed':
              globalSSEManager.options.onBookingCompleted?.(data);
              break;
            case 'booking_cancelled':
              globalSSEManager.options.onBookingCancelled?.(data);
              break;
            case 'booking_updated':
              globalSSEManager.options.onBookingUpdated?.(data);
              break;
            case 'new_booking':
              globalSSEManager.options.onNewBooking?.(data);
              break;
            default:
              console.log('Unknown SSE event type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        globalSSEManager.notifyListeners(false);
        connectingRef.current = false;
        eventSource.close();
        globalSSEManager.eventSource = null;
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect SSE...');
          connect();
        }, 5000);
      };

    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      connectingRef.current = false;
    }
  }, [user]);

  const disconnect = useCallback(() => {
    if (globalSSEManager.eventSource) {
      globalSSEManager.eventSource.close();
      globalSSEManager.eventSource = null;
    }
    globalSSEManager.notifyListeners(false);
    connectingRef.current = false;
  }, []);

  // Listen to global SSE status changes
  useEffect(() => {
    const listener = (connected: boolean) => {
      setIsConnected(connected);
    };
    
    globalSSEManager.addListener(listener);
    
    return () => {
      globalSSEManager.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    if (user && !connectingRef.current && !globalSSEManager.isConnected) {
      connect();
    } else if (!user) {
      disconnect();
    }

    return () => {
      // Don't disconnect on unmount, let the global manager handle it
    };
  }, [user, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected
  };
}; 