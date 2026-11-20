import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

let checkoutPromise;

export function loadRazorpay() {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!checkoutPromise) {
    checkoutPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          script.remove();
          reject(new Error("Checkout unavailable"));
        }
      };

      script.onerror = () => {
        script.remove();
        reject(new Error("Unable to load Razorpay"));
      };

      document.head.appendChild(script);
    }).catch((error) => {
      checkoutPromise = null;
      throw error;
    });
  }

  return checkoutPromise;
}

export async function getPayableAmount(bookingId) {
  return unwrap(
    await supabase
      .rpc("get_booking_payable_amount", {
        p_booking_id: bookingId,
      })
      .single()
  );
}

export async function createPaymentOrder(bookingId) {
  return unwrap(
    await supabase.functions.invoke(
      "create-payment-order",
      {
        body: { bookingId },
      }
    )
  );
}

export async function verifyPayment(bookingId, response) {
  return unwrap(
    await supabase.functions.invoke("verify-payment", {
      body: {
        bookingId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      },
    })
  );
}

export async function getBookingPayment(bookingId) {
  return unwrap(
    await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .maybeSingle()
  );
}

export async function getCustomerPayments(userId) {
  return unwrap(
    await supabase
      .from("payments")
      .select("*")
      .eq("customer_id", userId)
      .order("paid_at", { ascending: false })
  );
}

export async function getProviderPayments(userId) {
  return unwrap(
    await supabase
      .from("payments")
      .select("*")
      .eq("provider_id", userId)
      .order("paid_at", { ascending: false })
  );
}

export function formatMoney(paise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(paise) / 100);
}