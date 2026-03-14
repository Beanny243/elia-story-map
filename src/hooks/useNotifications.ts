import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_trip_id: string | null;
  related_memory_id: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data as unknown as Notification[]);
      setUnreadCount((data as unknown as Notification[]).filter((n) => !n.is_read).length);
    }
    setLoading(false);
  }, [user]);

  const generateReminders = useCallback(async () => {
    if (!user) return;

    // Fetch trips and existing notifications to avoid duplicates
    const [tripsRes, existingRes] = await Promise.all([
      supabase.from("trips").select("*").eq("user_id", user.id),
      supabase
        .from("notifications")
        .select("type, related_trip_id, related_memory_id")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const trips = tripsRes.data || [];
    const existing = (existingRes.data || []) as unknown as Array<{
      type: string;
      related_trip_id: string | null;
      related_memory_id: string | null;
    }>;

    const newNotifications: Array<{
      user_id: string;
      type: string;
      title: string;
      message: string;
      related_trip_id?: string;
      related_memory_id?: string;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const trip of trips) {
      if (!trip.start_date) continue;
      const startDate = new Date(trip.start_date);
      startDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const alreadyNotified = existing.some(
        (e) => e.related_trip_id === trip.id && e.type === "trip_countdown"
      );

      if (daysUntil > 0 && daysUntil <= 7 && !alreadyNotified) {
        newNotifications.push({
          user_id: user.id,
          type: "trip_countdown",
          title: `${trip.title} is coming up!`,
          message: `Your trip to ${trip.destination} starts in ${daysUntil} day${daysUntil === 1 ? "" : "s"}. Get ready! ✈️`,
          related_trip_id: trip.id,
        });
      }

      if (daysUntil === 0 && !alreadyNotified) {
        newNotifications.push({
          user_id: user.id,
          type: "trip_reminder",
          title: `${trip.title} starts today!`,
          message: `Your adventure to ${trip.destination} begins now. Have an amazing trip! 🎉`,
          related_trip_id: trip.id,
        });
      }
    }

    // Memory anniversaries
    const memoriesRes = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id);

    const memories = memoriesRes.data || [];
    for (const memory of memories) {
      if (!memory.memory_date) continue;
      const memDate = new Date(memory.memory_date);
      const isAnniversary =
        memDate.getMonth() === today.getMonth() &&
        memDate.getDate() === today.getDate() &&
        memDate.getFullYear() !== today.getFullYear();

      const alreadyNotified = existing.some(
        (e) => e.related_memory_id === memory.id && e.type === "memory_anniversary"
      );

      if (isAnniversary && !alreadyNotified) {
        const years = today.getFullYear() - memDate.getFullYear();
        newNotifications.push({
          user_id: user.id,
          type: "memory_anniversary",
          title: `Memory from ${years} year${years === 1 ? "" : "s"} ago`,
          message: `Remember "${memory.caption || "your memory"}" in ${memory.location || "your trip"}? 📸`,
          related_memory_id: memory.id,
        });
      }
    }

    if (newNotifications.length > 0) {
      await supabase.from("notifications").insert(newNotifications as any);
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      await supabase.from("notifications").update({ is_read: true } as any).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true } as any)
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [user]);

  const deleteNotification = useCallback(async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => {
      const n = prev.find((x) => x.id === id);
      if (n && !n.is_read) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  useEffect(() => {
    fetchNotifications();
    generateReminders();
  }, [fetchNotifications, generateReminders]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, refetch: fetchNotifications };
}
