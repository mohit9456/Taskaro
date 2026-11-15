// app/join/success/page.jsx
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="bg-(--color-bg) rounded-xl shadow-lg p-8 max-w-2xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text mb-4">
          Thank You for Your Interest!
        </h1>
        <p className="text-lg text-desc mb-6">
          We've received your request to join Taskaro. Our team will review your
          application and get back to you within 24 hours with next steps.
        </p>
        <div className="space-y-3">
          <p className="text-content">
            <strong>What happens next?</strong>
          </p>
          <ul className="text-desc text-left max-w-md mx-auto space-y-2">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              You'll receive a confirmation email with temporary login details
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Our onboarding specialist will schedule a call to understand your
              needs
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              We'll customize your team dashboard based on your requirements
            </li>
          </ul>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
