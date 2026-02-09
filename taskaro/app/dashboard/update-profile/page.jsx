"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MdEdit } from "react-icons/md";
import toast from "react-hot-toast";
import { Api, protectedApiGet, protectedApiPost } from "@/lib/api";
import { useSession } from "next-auth/react";
import { formatDate } from "@/utils/formatDate";
import { CgProfile } from "react-icons/cg";
import { FaBackwardFast } from "react-icons/fa6";

const ProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [passwordLoaderBtn, setPasswordLoaderBtn] = useState(false);
  const [changeScreen, setChangeScreen] = useState(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordErrMsg, setPasswordErrMsg] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    profileImage: null, // 👈 नया field
  });

  const { data: session, update } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const user = session.user;

    setUserData({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.about || "",
      avatar: user.profileImage || "",
      joinedAt: user.createdAt ? new Date(user.createdAt) : "",
    });

    setEditForm({
      name: user.name || "",
      bio: user.about || "",
    });
  }, [session]);

  useEffect(() => {
    // Fetch user tasks
    const fetchUserTasks = async () => {
      // Simulate API call with dummy data
      setTimeout(() => {
        setTasks([
          {
            id: "task1",
            title: "Complete project proposal",
            status: "completed",
            dueDate: "2023-11-20",
          },
          {
            id: "task2",
            title: "Review team progress",
            status: "pending",
            dueDate: "2023-12-01",
          },
          {
            id: "task3",
            title: "Update documentation",
            status: "overdue",
            dueDate: "2023-11-15",
          },
          {
            id: "task4",
            title: "Schedule team meeting",
            status: "completed",
            dueDate: "2023-11-18",
          },
        ]);
      }, 700);
    };

    fetchUserTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const completed = tasks.filter((t) => t.status === "completed").length;
      const pending = tasks.filter((t) => t.status === "pending").length;
      const overdue = tasks.filter((t) => t.status === "overdue").length;
      setStats({ completed, pending, overdue });
    }
  }, [tasks]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handlePassword = () => {
    setIsChangePassword(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("about", editForm.bio); // bio → about
      if (editForm.profileImage instanceof File) {
        formData.append("profileImage", editForm.profileImage);
      }

      // Axios POST
      const data = await Api.post("/secure/edit-profile", formData, {
        withCredentials: true,
      });
      await update();
      toast.success(
        data?.message || "Congratulations !! Your profile has been updated"
      );
      // सफल होने पर local state update करो
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ! try again later");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: userData.name,
      email: userData.email,
      bio: userData.bio,
    });
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleValidateEmail = async () => {
    if (!userData?.email) return;
    setPasswordLoaderBtn(true);

    protectedApiPost("/secure/validate-email")
      .then((data) => {
        toast.success(data?.message);
        setChangeScreen(1);
      })
      .catch((error) => {
        setPasswordErrMsg(
          error?.response.data.error ||
            "An unexpected error occurred. Please try again."
        );
        // console.error("Error:", error);
      })
      .finally(() => {
        setPasswordLoaderBtn(false);
      });
  };

  const handleVerifyOtp = async () => {
    if (!userData?.email) return;
    setPasswordLoaderBtn(true);

    protectedApiPost("/secure/verify-otp", {
      otp: otp,
    })
      .then((data) => {
        toast.success(data?.message);
        setChangeScreen(2);
      })
      .catch((error) => {
        setPasswordErrMsg(
          error?.response.data.error ||
            "An unexpected error occurred. Please try again."
        );
        // console.error("Error:", error);
      })
      .finally(() => {
        setPasswordLoaderBtn(false);
      });
  };

  const isPasswordValid = () => {
    if (!newPassword || !confirmPassword) {
      setPasswordErrMsg("Password fields cannot be empty");
      return false;
    }

    if (newPassword.length < 8) {
      setPasswordErrMsg("Password must be at least 8 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrMsg("Passwords do not match");
      return false;
    }

    setPasswordErrMsg("");
    return true;
  };

  const handleResetpassword = async () => {
    if (!userData?.email) return;

    if (!isPasswordValid()) return;

    setPasswordLoaderBtn(true);

    protectedApiPost("/secure/update-password", {
      otp,
      password: newPassword,
      cPassword: confirmPassword,
    })
      .then((data) => {
        toast.success(data?.message);
        setChangeScreen(null);
        setIsChangePassword(false);

        // cleanup
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        setPasswordErrMsg(
          error?.response?.data?.error ||
            "An unexpected error occurred. Please try again."
        );
      })
      .finally(() => {
        setPasswordLoaderBtn(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </button>

        {userData ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Profile header */}
            <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative">
                  {editForm?.profileImage ? (
                    <img
                      src={URL.createObjectURL(editForm.profileImage)}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />
                  ) : userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt={`${userData.name}'s profile`}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />
                  ) : (
                    <CgProfile className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                  )}

                  {/* Hidden input */}
                  {isEditing && (
                    <>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            profileImage: e.target.files[0],
                          })
                        }
                      />
                      <label htmlFor="avatar-upload">
                        <MdEdit
                          className="absolute bottom-0 left-2 cursor-pointer bg-blue-500 p-1 rounded-full"
                          size={30}
                          color="#fff"
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white bg-opacity-80 rounded text-xl font-bold text-gray-800"
                      />
                      <p className="text-blue-100">{userData.email}</p>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {userData.name}
                      </h1>
                      <p className="text-blue-100">{userData.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "overview"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "tasks"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Tasks
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "settings"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            {/* Profile content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.completed}
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.pending}
                      </div>
                      <div className="text-sm text-gray-500">Pending</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {stats.overdue}
                      </div>
                      <div className="text-sm text-gray-500">Overdue</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      About
                    </h3>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={editForm.bio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 bg-gray-50 rounded border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-600">
                        {userData.bio || "No bio provided."}
                      </p>
                    )}
                  </div>

                  {/* Member since */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Member Since
                    </h3>
                    <p className="text-gray-600">
                      {formatDate(userData.joinedAt)}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Due: {formatDate(task.dueDate)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No tasks found.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "settings" &&
                (isChangePassword ? (
                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <FaBackwardFast
                        onClick={() => setIsChangePassword(false)}
                        className="cursor-pointer"
                        size={"25"}
                      />
                      <h3 className="text-xl font-semibold text-gray-900 pt-2">
                        Secure Your Account
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        To reset your password, we’ll first verify that this
                        account belongs to you. An OTP will be sent to your
                        registered email address.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {changeScreen === null ? (
                        // STEP 1: OTP Sent
                        <>
                          <button
                            onClick={handleValidateEmail}
                            type="button"
                            disabled={passwordLoaderBtn}
                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Send Code
                          </button>
                          {passwordErrMsg && (
                            <p
                              className="text-sm text-red-600 font-bold uppercase"
                              style={{ wordSpacing: "0.15em" }}
                            >
                              * {passwordErrMsg}
                            </p>
                          )}
                        </>
                      ) : changeScreen === 1 ? (
                        // STEP 2: OTP Verification
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Verification Code
                          </label>
                          <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => {
                              setPasswordErrMsg("");
                              const value = e.target.value.replace(/\D/g, ""); // remove non-numbers
                              if (value.length <= 6) {
                                setOtp(value);
                              }
                            }}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            We’ve sent a one-time verification code to your
                            email.
                          </p>
                          {passwordErrMsg && (
                            <p className="text-sm text-red-600 font-semibold mt-2">
                              * {passwordErrMsg}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otp.length !== 6 || passwordLoaderBtn}
                            className={`mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white
                            ${
                              otp.length === 6
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {passwordLoaderBtn ? "Verifying..." : "Verify Code"}
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* STEP 3: set new Password */}
                          {/* New Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => {
                                setPasswordErrMsg("");
                                setNewPassword(e.target.value);
                              }}
                              placeholder="Enter new password"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Must be at least 8 characters long.
                            </p>
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => {
                                setPasswordErrMsg("");
                                setConfirmPassword(e.target.value);
                              }}
                              placeholder="Re-enter new password"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          {passwordErrMsg && (
                            <p className="text-sm text-red-600 font-semibold mt-2">
                              * {passwordErrMsg}
                            </p>
                          )}

                          {/* Action */}
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleResetpassword}
                              disabled={
                                passwordLoaderBtn ||
                                newPassword.length < 8 ||
                                confirmPassword !== newPassword
                              }
                              className={`inline-flex items-center px-6 py-2 text-sm font-medium rounded-md text-white
                                ${
                                  newPassword.length >= 8 &&
                                  confirmPassword === newPassword
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                              {passwordLoaderBtn
                                ? "Updating..."
                                : "Update Password"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Account Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                          Password
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <button
                            type="button"
                            onClick={handlePassword}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Change Password
                          </button>
                        </div>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                          Notifications
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="flex items-center">
                            <input
                              id="task-notifications"
                              name="task-notifications"
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor="task-notifications"
                              className="ml-2 block text-sm text-gray-700"
                            >
                              Task reminders
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                        <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                          Theme
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <select
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            defaultValue="light"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Edit/Save buttons */}
            {activeTab !== "settings" && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
