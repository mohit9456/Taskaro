export function getRazorpayAuthHeader() {
  return `Basic ${Buffer.from(
    `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString("base64")}`;
}
