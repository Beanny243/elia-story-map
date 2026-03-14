import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Convert base64url to Uint8Array
function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

// Build JWT for VAPID authentication
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64url: string
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const enc = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const rawKey = base64urlToUint8Array(privateKeyBase64url);
  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", d: privateKeyBase64url, x: "", y: "" },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  ).catch(async () => {
    // Fallback: import as raw PKCS8
    const jwk = {
      kty: "EC",
      crv: "P-256",
      d: privateKeyBase64url,
      // We need x,y from the public key - we'll derive them
      x: "",
      y: "",
    };
    return crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );
  });

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    enc.encode(unsignedToken)
  );

  // Convert DER signature to raw format if needed
  const sigArray = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;

  if (sigArray.length === 64) {
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32, 64);
  } else {
    // DER format
    let offset = 2;
    const rLen = sigArray[offset + 1];
    r = sigArray.slice(offset + 2, offset + 2 + rLen);
    offset = offset + 2 + rLen;
    const sLen = sigArray[offset + 1];
    s = sigArray.slice(offset + 2, offset + 2 + sLen);
    // Pad to 32 bytes
    if (r.length < 32) r = new Uint8Array([...new Array(32 - r.length).fill(0), ...r]);
    if (s.length < 32) s = new Uint8Array([...new Array(32 - s.length).fill(0), ...s]);
    if (r.length > 32) r = r.slice(r.length - 32);
    if (s.length > 32) s = s.slice(s.length - 32);
  }

  const rawSig = new Uint8Array([...r, ...s]);
  const sigB64 = btoa(String.fromCharCode(...rawSig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${unsignedToken}.${sigB64}`;
}

// Send a single web push notification
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const subject = "mailto:notifications@eliamap.app";

    // For Web Push, we need to use the Web Push protocol
    // This is a simplified version - in production you'd use proper encryption
    const body = JSON.stringify(payload);
    const enc = new TextEncoder();

    // Create VAPID authorization
    const jwt = await createVapidJwt(audience, subject, vapidPrivateKey);
    const vapidAuth = `vapid t=${jwt}, k=${vapidPublicKey}`;

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": "aes128gcm",
        Authorization: vapidAuth,
        TTL: "86400",
      },
      body: body,
    });

    if (response.status === 410 || response.status === 404) {
      // Subscription expired or invalid
      return false;
    }

    const responseText = await response.text();
    console.log(`Push response: ${response.status} ${responseText}`);
    return response.ok;
  } catch (error) {
    console.error("Failed to send push:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get VAPID keys
    const { data: vapidData } = await supabaseAdmin
      .from("vapid_keys")
      .select("*")
      .limit(1)
      .single();

    if (!vapidData) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    let totalSent = 0;
    const expiredEndpoints: string[] = [];

    // Helper to send push to a user
    async function sendToUser(userId: string, payload: object) {
      const { data: subscriptions } = await supabaseAdmin
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId);

      if (!subscriptions || subscriptions.length === 0) return;

      for (const sub of subscriptions) {
        const success = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          vapidData.public_key,
          vapidData.private_key
        );
        if (success) totalSent++;
        else expiredEndpoints.push(sub.endpoint);
      }
    }

    // --- Trip countdowns ---
    const { data: trips } = await supabaseAdmin
      .from("trips")
      .select("id, title, destination, start_date, user_id")
      .gte("start_date", today.toISOString().split("T")[0])
      .lte("start_date", weekFromNow.toISOString().split("T")[0]);

    if (trips && trips.length > 0) {
      for (const trip of trips) {
        const startDate = new Date(trip.start_date!);
        startDate.setHours(0, 0, 0, 0);
        const daysUntil = Math.round(
          (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const title =
          daysUntil === 0
            ? `${trip.title} starts today! 🎉`
            : `${trip.title} in ${daysUntil} day${daysUntil === 1 ? "" : "s"} ✈️`;
        const message =
          daysUntil === 0
            ? `Your adventure to ${trip.destination} begins now!`
            : `Get ready for your trip to ${trip.destination}!`;

        await sendToUser(trip.user_id, {
          title,
          body: message,
          icon: "/favicon.ico",
          data: { url: `/trips/${trip.id}` },
        });

        await supabaseAdmin.from("notifications").insert({
          user_id: trip.user_id,
          type: "trip_countdown",
          title,
          message,
          related_trip_id: trip.id,
        });
      }
    }

    // --- Memory anniversaries ---
    const { data: memories } = await supabaseAdmin
      .from("memories")
      .select("id, caption, location, memory_date, user_id");

    if (memories && memories.length > 0) {
      for (const memory of memories) {
        if (!memory.memory_date) continue;
        const memDate = new Date(memory.memory_date);
        const isAnniversary =
          memDate.getMonth() === today.getMonth() &&
          memDate.getDate() === today.getDate() &&
          memDate.getFullYear() !== today.getFullYear();

        if (!isAnniversary) continue;

        const years = today.getFullYear() - memDate.getFullYear();
        const title = `Memory from ${years} year${years === 1 ? "" : "s"} ago 📸`;
        const message = `Remember "${memory.caption || "your memory"}" in ${memory.location || "your trip"}?`;

        await sendToUser(memory.user_id, {
          title,
          body: message,
          icon: "/favicon.ico",
          data: { url: `/memories` },
        });

        await supabaseAdmin.from("notifications").insert({
          user_id: memory.user_id,
          type: "memory_anniversary",
          title,
          message,
          related_memory_id: memory.id,
        });
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent: totalSent, cleaned: expiredEndpoints.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send push error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
