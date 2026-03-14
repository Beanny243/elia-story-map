import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkExistingSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
    setLoading(false);
  }, []);

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      setLoading(true);

      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setLoading(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw-push.js");
      await navigator.serviceWorker.ready;

      // Get VAPID public key from edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const vapidRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/push-setup?action=get-vapid-key`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const { publicKey } = await vapidRes.json();

      if (!publicKey) {
        throw new Error("Failed to get VAPID key");
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });

      // Send subscription to backend
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      await fetch(
        `https://${projectId}.supabase.co/functions/v1/push-setup?action=subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        }
      );

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Push subscription error:", error);
      setLoading(false);
      return false;
    }
  }, [user, isSupported]);

  const unsubscribe = useCallback(async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          await sub.unsubscribe();

          // Remove from backend
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

          await fetch(
            `https://${projectId}.supabase.co/functions/v1/push-setup?action=unsubscribe`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ endpoint }),
            }
          );
        }
      }
      setIsSubscribed(false);
    } catch (error) {
      console.error("Push unsubscribe error:", error);
    }
    setLoading(false);
  }, []);

  return { isSupported, isSubscribed, loading, permission, subscribe, unsubscribe };
}
