import { useEffect, useRef, useCallback } from 'react';
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

export const useSSE = (options: UseSSEOptions = {}) => {
  const { user } = useUser();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    if (!user) return;

    try {
      const backendUrl = await getBackendUrl();
      const url = `${backendUrl}/api/booking/stream`;
      
      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new EventSource with credentials
      const eventSource = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection established');
        options.onConnected?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('SSE event received:', data);

          switch (data.type) {
            case 'connected':
              options.onConnected?.();
              break;
            case 'booking_created':
              options.onBookingCreated?.(data);
              break;
            case 'booking_approved':
              options.onBookingApproved?.(data);
              break;
            case 'booking_rejected':
              options.onBookingRejected?.(data);
              break;
            case 'booking_completed':
              options.onBookingCompleted?.(data);
              break;
            case 'booking_cancelled':
              options.onBookingCancelled?.(data);
              break;
            case 'booking_updated':
              options.onBookingUpdated?.(data);
              break;
            case 'new_booking':
              options.onNewBooking?.(data);
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
        eventSource.close();
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect SSE...');
          connect();
        }, 5000);
      };

    } catch (error) {
      console.error('Error establishing SSE connection:', error);
    }
  }, [user, options]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected: !!eventSourceRef.current
  };
}; 