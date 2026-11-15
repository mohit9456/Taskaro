"use client";

import { protectedApiGet, protectedApiPatch } from "@/lib/api";
import { timeAgo } from "@/utils/timeAgo";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await protectedApiGet("/secure/notifications");
        setNotifications(data?.notification || []);
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            "Something went wrong!",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 2️⃣ Mark all as read AFTER render
  useEffect(() => {
    if (notifications.length === 0) return;

    const unreadExists = notifications.some((n) => !n.isRead);
    if (!unreadExists) return;

    protectedApiPatch("/secure/notifications/read-all")
      .then((data) => {
        // console.log(data);
      })
      .catch((error) => {
        // console.error("Failed to mark notifications as read", error);
      });
  }, [notifications]);

  return (
    <>
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Notifications</h1>

      <div className="bg-(--card-bg) rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No new notifications.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notif) => (
              <li
                key={notif._id}
                className={`border p-3 rounded-lg cursor-pointer transition ${
                  notif.isRead ? "opacity-70" : "bg-blue-50 dark:bg-blue-950"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {notif.message}
                    </p>
                  </div>
                  <div className="flex gap-4 items-end flex-col">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {timeAgo(notif.createdAt)}
                    </span>
                    {!notif.isRead && (
                      <p className="rounded-[50%] w-2 h-2 bg-[#00fb36]" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Notification;
