import Link from "next/link";

// app/checkout/success/page.jsx
const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-(--color-bg) to-(--card-bg) flex items-center justify-center p-4">
      <div className="bg-(--card-bg) rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-lg mb-6">
          Thank you for your purchase! Your subscription is now active.
        </p>
        <p className="text-(--color-desc) mb-4">
          You will receive a confirmation email shortly.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-(--color-primary) text-white font-semibold rounded-lg hover:bg-(--color-secondary) transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
