import {
  json,
  env,
  verifySignature,
  recordPayment,
  adminClient,
  razorpay,
} from "../_shared/payment.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({
      error: "Method not allowed",
    }, 405);
  }

  try {
    const signature =
      req.headers.get("x-razorpay-signature") || "";

    const eventId =
      req.headers.get("x-razorpay-event-id");

    // Preserve original request body for verification.

    const rawBody = await req.text();

    const valid = await verifySignature(
      rawBody,
      signature,
      env("RAZORPAY_WEBHOOK_SECRET"),
    );

    if (!valid) {
      return json({
        error: "Invalid webhook signature",
      }, 401);
    }

    const event = JSON.parse(rawBody);

    if (event.event !== "payment.captured") {
      return json({
        received: true,
        ignored: true,
      });
    }

    const incoming = event.payload?.payment?.entity;

    if (
      !incoming?.id ||
      !/^pay_[a-zA-Z0-9]+$/.test(incoming.id) ||
      !incoming?.order_id
    ) {
      return json({
        error: "Invalid payment payload",
      }, 400);
    }

    // Verify current payment directly with Razorpay.

    const payment = await razorpay(
      `payments/${incoming.id}`,
    );

    if (
      payment.id !== incoming.id ||
      payment.order_id !== incoming.order_id
    ) {
      return json({
        error: "Payment mismatch",
      }, 400);
    }

    const admin = adminClient();

    const { data: order, error } = await admin
      .from("payment_orders")
      .select("id")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (error) throw error;

    if (!order) {
      console.error(
        "Unmatched Razorpay order",
        payment.order_id,
      );

      return json({
        error: "Local order not found",
      }, 503);
    }

    await recordPayment(payment, eventId);

    return json({
      received: true,
      verified: true,
    });

  } catch (error) {
    console.error("Webhook processing failed", error);

    return json({
      error: "Webhook processing failed",
    }, 500);
  }
});