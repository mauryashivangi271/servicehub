import {
  corsHeaders,
  json,
  env,
  authenticate,
  adminClient,
  razorpay,
  verifySignature,
  recordPayment,
} from "../_shared/payment.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const { user } = await authenticate(req);

    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      typeof bookingId !== "string" ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id)
    ) {
      return json({
        error: "Invalid payment details",
      }, 400);
    }

    const admin = adminClient();

    const { data: order, error: orderError } =
      await admin
        .from("payment_orders")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("customer_id", user.id)
        .single();

    if (
      orderError ||
      !order ||
      order.razorpay_order_id !== razorpay_order_id
    ) {
      return json({
        error: "Payment order not found",
      }, 404);
    }

    // Verify checkout signature using stored order ID.

    const signatureValid = await verifySignature(
      `${order.razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      env("RAZORPAY_KEY_SECRET"),
    );

    if (!signatureValid) {
      return json({
        error: "Invalid payment signature",
      }, 400);
    }

    // Retrieve actual payment from Razorpay.

    const payment = await razorpay(
      `payments/${razorpay_payment_id}`,
    );

    if (
      payment.id !== razorpay_payment_id ||
      payment.order_id !== order.razorpay_order_id ||
      payment.amount !== Number(order.amount_paise) ||
      payment.currency !== order.currency
    ) {
      return json({
        error: "Payment details mismatch",
      }, 400);
    }

    if (
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return json({
        success: false,
        pending: true,
        message: "Payment capture is pending",
      }, 202);
    }

    const paymentId = await recordPayment(payment);

    return json({
      success: true,
      paymentId,
      amount: payment.amount,
      currency: payment.currency,
      message: "Payment verified successfully",
    });

  } catch (error) {
    console.error("Payment verification failed", error);

    return json({
      error: "Unable to verify payment",
    }, 400);
  }
});