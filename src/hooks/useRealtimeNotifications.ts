import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { usePushNotifications } from './usePushNotifications';
import { useNotifications } from '@/contexts/NotificationContext';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface ProductPayload {
  id: string;
  name: string;
  quantity: number;
  min_stock: number;
  expiry_date: string | null;
  user_id: string;
}

type ChangePayload = RealtimePostgresChangesPayload<ProductPayload>;

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { sendPushNotification, requestPermission, permission } = usePushNotifications();
  const { addNotification } = useNotifications();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastNotificationRef = useRef<Record<string, number>>({});
  const hasRequestedPermission = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    if (user?.id && !hasRequestedPermission.current && permission === 'default') {
      hasRequestedPermission.current = true;
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user?.id, requestPermission, permission]);

  // Debounce notifications to prevent spam (5 second cooldown per product)
  const shouldNotify = useCallback((productId: string): boolean => {
    const now = Date.now();
    const lastTime = lastNotificationRef.current[productId] || 0;
    
    if (now - lastTime < 5000) {
      return false;
    }
    
    lastNotificationRef.current[productId] = now;
    return true;
  }, []);

  const notify = useCallback((title: string, message: string, type: 'warning' | 'error' | 'info') => {
    // Store in notification center
    addNotification({ title, message, type });

    // In-app toast notification
    if (type === 'error') {
      toast.error(title, { description: message, duration: 6000 });
    } else if (type === 'warning') {
      toast.warning(title, { description: message, duration: 5000 });
    } else {
      toast.info(title, { description: message, duration: 5000 });
    }

    // Push notification for mobile/desktop
    sendPushNotification(title, {
      body: message,
      tag: `inventory-${Date.now()}`,
      silent: false,
    });
  }, [sendPushNotification, addNotification]);

  const checkAndNotify = useCallback((payload: ChangePayload) => {
    const newData = payload.new as ProductPayload | null;
    const oldData = payload.old as ProductPayload | null;

    console.log('Realtime payload received:', { eventType: payload.eventType, newData, oldData });

    if (!newData || newData.user_id !== user?.id) return;
    if (!shouldNotify(newData.id)) return;

    // Low stock alert - triggers when quantity drops to or below min_stock
    if (newData.quantity <= newData.min_stock && newData.quantity > 0) {
      const wasAboveMinStock = !oldData || oldData.quantity > oldData.min_stock;
      if (wasAboveMinStock) {
        notify(
          'Low Stock Alert',
          `${newData.name} is running low (${newData.quantity} remaining, minimum: ${newData.min_stock})`,
          'warning'
        );
      }
    }

    // Out of stock alert
    if (newData.quantity === 0) {
      const wasInStock = !oldData || oldData.quantity > 0;
      if (wasInStock) {
        notify(
          'Out of Stock',
          `${newData.name} is now out of stock!`,
          'error'
        );
      }
    }

    // Expiry alert (within 7 days) - for new products
    if (newData.expiry_date && payload.eventType === 'INSERT') {
      const expiryDate = new Date(newData.expiry_date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0) {
        notify(
          'Product Expired',
          `${newData.name} has already expired`,
          'error'
        );
      } else if (daysUntilExpiry <= 7) {
        notify(
          'Expiring Soon',
          `${newData.name} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
          'warning'
        );
      }
    }
  }, [user?.id, shouldNotify, notify]);

  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID, skipping realtime subscription');
      return;
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    console.log('Setting up realtime subscription for user:', user.id);

    const channel = supabase
      .channel(`products-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload.eventType);
          checkAndNotify(payload as ChangePayload);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime notifications active for products table');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error:', err);
        } else {
          console.log('Realtime subscription status:', status);
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, checkAndNotify]);
};
