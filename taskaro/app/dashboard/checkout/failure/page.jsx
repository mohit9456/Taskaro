// app/checkout/failure/page.jsx
const FailurePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-(--color-bg) to-(--card-bg) flex items-center justify-center p-4">
      <div className="bg-(--card-bg) rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Failed!</h1>
        <p className="text-lg mb-6">
          We're sorry, but your payment could not be processed.
        </p>
        <p className="text-(--color-desc) mb-4">
          Please check your payment details and try again.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/pricing"
            className="px-6 py-2 bg-(--color-primary) text-white font-semibold rounded-lg hover:bg-(--color-secondary) transition"
          >
            Go to Pricing
          </Link>
          <Link
            href="/dashboard/checkout"
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
          >
            Retry Payment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FailurePage;
