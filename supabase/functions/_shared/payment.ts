import { createClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function env(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing configuration: ${name}`);
  }

  return value;
}

export function json(
  data: unknown,
  status = 200,
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function adminClient() {
  return createClient(
    env("SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export async function authenticate(req: Request) {
  const authorization =
    req.headers.get("Authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Login required");
  }

  const token = authorization.slice(7);

  const client = createClient(
    env("SUPABASE_URL"),
    env("SUPABASE_ANON_KEY"),
    {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
      auth: {
        persistSession: false,
      },
    },
  );

  const { data, error } =
    await client.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Invalid session");
  }

  return {
    user: data.user,
    client,
  };
}

export async function razorpay(
  path: string,
  method = "GET",
  body?: unknown,
) {
  const credentials = btoa(
    `${env("RAZORPAY_KEY_ID")}:${env("RAZORPAY_KEY_SECRET")}`,
  );

  const response = await fetch(
    `https://api.razorpay.com/v1/${path}`,
    {
      method,
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: body === undefined
        ? undefined
        : JSON.stringify(body),
    },
  );

  if (!response.ok) {
    console.error("Razorpay HTTP status", response.status);
    throw new Error("Razorpay request failed");
  }

  return await response.json();
}

export async function verifySignature(
  message: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-fA-F0-9]{64}$/.test(signature)) {
    return false;
  }

  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["verify"],
  );

  const signatureBytes = Uint8Array.from(
    signature.match(/.{2}/g) || [],
    (part) => parseInt(part, 16),
  );

  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(message),
  );
}

export async function recordPayment(
  payment: any,
  eventId: string | null = null,
) {
  if (
    payment.status !== "captured" ||
    payment.captured !== true ||
    payment.currency !== "INR" ||
    !Number.isSafeInteger(payment.amount) ||
    payment.amount <= 0
  ) {
    throw new Error("Payment is not captured");
  }

  const admin = adminClient();

  const { data, error } = await admin.rpc(
    "record_verified_payment",
    {
      p_order_id: payment.order_id,
      p_payment_id: payment.id,
      p_amount_paise: payment.amount,
      p_currency: payment.currency,
      p_method: payment.method || null,
      p_event_id: eventId,
    },
  );

  if (error) throw error;

  return data;
}