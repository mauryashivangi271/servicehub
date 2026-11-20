import {
  corsHeaders,
  json,
  env,
  authenticate,
  adminClient,
  razorpay,
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
    const { user, client } = await authenticate(req);

    const { bookingId } = await req.json();

    if (
      typeof bookingId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(bookingId)
    ) {
      return json({ error: "Invalid booking ID" }, 400);
    }

    const admin = adminClient();

    // Calculate amount from the database.

    const { data: payable, error: payableError } =
      await client
        .rpc("get_booking_payable_amount", {
          p_booking_id: bookingId,
        })
        .single();

    if (payableError || !payable) {
      return json({
        error: "Booking is not eligible for payment",
      }, 400);
    }

    const amount = Number(payable.amount_paise);

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      payable.customer_id !== user.id
    ) {
      return json({ error: "Invalid payable amount" }, 400);
    }

    // Create one local payment order per booking.

    const { error: insertError } = await admin
      .from("payment_orders")
      .upsert(
        {
          booking_id: bookingId,
          customer_id: user.id,
          provider_id: payable.provider_id,
          quotation_id: payable.quotation_id,
          amount_paise: amount,
          currency: "INR",
        },
        {
          onConflict: "booking_id",
          ignoreDuplicates: true,
        },
      );

    if (insertError) throw insertError;

    const { data: order, error: orderError } =
      await admin
        .from("payment_orders")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("customer_id", user.id)
        .single();

    if (orderError || !order) {
      throw new Error("Payment order not found");
    }

    if (
      Number(order.amount_paise) !== amount ||
      order.status === "paid"
    ) {
      return json({
        error: "Payment order is no longer eligible",
      }, 409);
    }

    // Reuse previously created Razorpay order.

    if (order.razorpay_order_id) {
      const existing = await razorpay(
        `orders/${order.razorpay_order_id}`,
      );

      if (existing.status === "paid") {
        return json({
          error: "Payment received. Verification pending.",
        }, 409);
      }

      return json({
        orderId: order.razorpay_order_id,
        amount,
        currency: "INR",
        keyId: env("RAZORPAY_KEY_ID"),
      });
    }

    // Atomically claim order creation.
    // Prevent simultaneous duplicate order requests.

    const { data: claimed, error: claimError } =
      await admin
        .from("payment_orders")
        .update({
          creation_state: "creating",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("creation_state", "pending")
        .is("razorpay_order_id", null)
        .select("id")
        .maybeSingle();

    if (claimError) throw claimError;

    if (!claimed) {
      return json({
        error:
          "Order creation is pending. Refresh or contact support.",
      }, 409);
    }

    // Create actual Razorpay order.

    const gatewayOrder = await razorpay(
      "orders",
      "POST",
      {
        amount,
        currency: "INR",
        receipt: order.id,
        notes: {
          booking_id: bookingId,
          payment_order_id: order.id,
        },
      },
    );

    if (
      !gatewayOrder.id ||
      gatewayOrder.amount !== amount ||
      gatewayOrder.currency !== "INR"
    ) {
      throw new Error("Invalid gateway order");
    }

    const { error: updateError } = await admin
      .from("payment_orders")
      .update({
        razorpay_order_id: gatewayOrder.id,
        creation_state: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("creation_state", "creating");

    if (updateError) throw updateError;

    return json({
      orderId: gatewayOrder.id,
      amount,
      currency: "INR",
      keyId: env("RAZORPAY_KEY_ID"),
    });

  } catch (error) {
    console.error("Create payment order failed", error);

    return json({
      error: "Unable to create payment order",
    }, 400);
  }
});