// app/join/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { protectedApiGet } from "@/lib/api";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    teamSize: "1-10",
    industry: "",
    requirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    protectedApiGet("/secure/get-workspace-user")
      .then((data) => {
        if(data.workspaceMember.planType === "FREE") {
          return router.push("/dashboard");
        }
      })
      .catch((err) => {
        // console.log("error", err);
        toast.error(`${err?.response.data.error} ! please choose plan first `);
        router.push("/pricing");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to thank you page
    router.push("/join/success");
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
              <Loader />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto py-16 px-4">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between relative">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className="flex flex-col items-center z-10"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center 
                  ${
                    step >= stepNumber
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-400 border-2 border-gray-300"
                  }`}
                  >
                    {stepNumber}
                  </div>
                  <span className="mt-2 text-sm font-medium text-desc">
                    {stepNumber === 1 && "Your Info"}
                    {stepNumber === 2 && "Team Details"}
                    {stepNumber === 3 && "Requirements"}
                  </span>
                </div>
              ))}
              <div className="absolute top-6 left-0 right-0 h-1 bg-(--color-content) -z-1">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step - 1) * 50}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-bg rounded-xl shadow-[#3b3b3b] shadow-lg p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-text mb-2">
              Join Taskaro for Teams
            </h1>
            <p className="text-content mb-8">
              Get your team working smarter with our task management solution
            </p>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-text">
                    Tell us about yourself
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-content mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 border border-(--color-text) outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 border border-(--color-text) outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-text">
                    About Your Team
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-content mb-1">
                      Company/Organization Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full p-3 border border-(--color-text) outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content mb-1">
                      Team Size
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full p-3 border border-(--color-text) outline-none bg-(--color-bg) rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1-10">1-10 members</option>
                      <option value="11-50">11-50 members</option>
                      <option value="51-100">51-100 members</option>
                      <option value="100+">100+ members</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-content mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full p-3 border border-(--color-text) outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-text">
                    Your Requirements
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-content mb-1">
                      What task management challenges are you facing?
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={5}
                      className="w-full p-3 border border-(--color-text) outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="E.g., We need better team collaboration, task tracking for remote teams, etc."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="demo-request"
                      name="demo-request"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-(--color-text) outline-none rounded"
                    />
                    <label
                      htmlFor="demo-request"
                      className="ml-2 block text-sm text-content"
                    >
                      I'd like a free demo of Taskaro before committing
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 text-desc font-medium rounded-lg border border-(--color-text) hover:bg-(--card-bg)"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 ${
                      isSubmitting ? "opacity-70" : ""
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
