"use client";

import Loader from "@/components/Loader";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdRestore } from "react-icons/md";

const Trash = () => {
  const [trashTasks, setTrashTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrashTask = async () => {
      setLoading(true);
      try {
        const data = await protectedApiGet("/secure/tasks/trashList");
        console.log("data", data);

        if (data?.trash) {
          setTrashTasks(data?.trash);
        }
      } catch (error) {
        toast.error(
          error?.response.data.error ||
            error?.message ||
            "something went wrong !",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTask();
  }, []);

  const restoreTask = async (id) => {
    try {
      await protectedApiPost("/secure/tasks/restore", { _id: id });
      setTrashTasks(trashTasks.filter((task) => task._id !== id));
      toast.success("Task restored successfully !");
    } catch (error) {
      toast.error(
        error?.response.data.error ||
          error?.message ||
          "something went wrong !",
      );
    }
  };

  return (
    <>
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Trash</h1>
      <div className="bg-(--card-bg) rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Deleted Tasks</h2>
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          trashTasks.length > 0 ? (
            <ul className="space-y-3">
              {trashTasks.map((task) => (
                <li
                  key={task._id}
                  className="border p-3 rounded-lg flex justify-between"
                >
                  <p className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className="text-[10px] font-thin">
                      {task?.description || "---"}
                    </span>
                  </p>
                  <p className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500">
                      Deleted:{" "}
                      {task.trashedAt
                        ? new Date(task.trashedAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "—"}
                    </span>
                    <MdRestore
                      title="Restore file"
                      className="cursor-pointer"
                      onClick={() => restoreTask(task?._id)}
                    />
                  </p>
                </li>
              ))}
            </ul>
          )
          : <div className="flex justify-center items-center">
            No Trash Found !
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4">
          Tasks are permanently deleted after 30 days.
        </p>
      </div>
    </>
  );
};

export default Trash;
