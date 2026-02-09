"use client";

import { useEffect, useState } from "react";
import {
  HiCheckBadge,
  HiExclamationTriangle,
  HiPencilSquare,
} from "react-icons/hi2";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  LuDownload,
  LuFilter,
  LuGripVertical,
  LuPlus,
  LuSearch,
  LuSquare,
  LuTrash2,
} from "react-icons/lu";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import Loader from "@/components/Loader";

export default function MyTasksContent() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(null);

  const [editingTask, setEditingTask] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const data = await protectedApiGet("/secure/tasks/list");
        // 🗑️ trash waale hata do
        const activeTasks = data?.task;

        setTasks(activeTasks);
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

    fetchTask();
  }, []);

  const updateTask = async (id, updatedTask) => {
    try {
      setLoadingBtn(true);
      await protectedApiPost("/secure/tasks/update", {
        ...updatedTask,
        taskId: id,
      });
      toast.success("Your task updated successfully! Put reminder");
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
      setEditingTask(null);
    } catch (err) {
      toast.error(
        err?.response?.data.error ||
          err?.message ||
          "Task not added ! try again later",
      );
    } finally {
      setLoadingBtn(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await protectedApiPost("/secure/tasks/delete", { _id: id });
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success("Task deleted successfully !");
    } catch (error) {
      toast.error(
        error?.response.data.error ||
          error?.message ||
          "something went wrong !",
      );
    }
  };

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end
  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    setTasks((prevTasks) => {
      const oldIndex = prevTasks.findIndex((task) => task._id === active.id);
      const newIndex = prevTasks.findIndex((task) => task._id === over.id);

      // safety check
      if (oldIndex === -1 || newIndex === -1) {
        return prevTasks;
      }

      return arrayMove(prevTasks, oldIndex, newIndex);
    });
  }

  // Filtered tasks
  const filteredTasks = tasks.filter((task) => {
    const search = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const priorityMatch =
      filterPriority === "all" || task.priority === filterPriority;
    return search && statusMatch && priorityMatch;
  });

  // Bulk actions
  const handleBulkDelete = async () => {
    try {
      await protectedApiPost("/secure/tasks/delete", { _id: selectedTasks });
      setTasks(tasks.filter((task) => !selectedTasks.includes(task._id)));
      setSelectedTasks([]);
      setShowBulkActions(false);
      toast.success("Tasks deleted successfully !");
    } catch (error) {
      toast.error(
        error?.response.data.error ||
          error?.message ||
          "something went wrong !",
      );
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      if (!selectedTasks.length) return;
      setLoadingBtn(true);

      await protectedApiPost("/secure/tasks/update", {
        taskId: selectedTasks,
        status,
      });

      toast.success("Tasks updated successfully!");

      // 🔄 Update UI state
      setTasks((prev) =>
        prev.map((task) =>
          selectedTasks.includes(task._id) ? { ...task, status } : task,
        ),
      );
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.error || err?.message || "Bulk update failed",
      );
    } finally {
      setLoadingBtn(false);
    }
  };

  const toggleTaskSelection = (id) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const exportToCSV = () => {
    const csv = [
      ["Title", "Description", "Status", "Priority", "Due Date"],
      ...filteredTasks.map((task) => [
        task.title,
        task?.description || "----",
        task.status,
        task.priority,
        task.dueDate,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.csv";
    a.click();
  };

  const overdueTasks = tasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "DONE",
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">My Tasks</h1>

      {overdueTasks.length > 0 && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <HiExclamationTriangle size={20} />
          <span>
            You have {overdueTasks.length} overdue task(s). Check them out!
          </span>
        </div>
      )}

      <div className="bg-(--card-bg) rounded-xl shadow p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-semibold">Manage Your Tasks</h2>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={exportToCSV}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition"
            >
              <LuDownload size={16} /> Export CSV
            </button>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <LuSearch size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded-lg"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative inline-block">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-1 px-4 pr-12 border rounded-lg bg-(--card-bg) shadow appearance-none w-full"
              >
                <option value="all">All Status</option>
                <option value="todo">TODO</option>
                <option value="inprogress">IN PROGRESS</option>
                <option value="done">DONE</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
                ▼
              </span>
            </div>
            <div className="relative inline-block">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="py-1 px-4 pr-12 border rounded-lg bg-(--card-bg) shadow appearance-none w-full"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
                ▼
              </span>
            </div>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="bg-purple-500 text-white px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition"
              disabled={selectedTasks.length === 0}
            >
              <LuFilter size={16} /> Bulk Actions ({selectedTasks.length})
            </button>
          </div>
        </div>

        {showBulkActions && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("done")}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Mark Done
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("inprogress")}
              className="bg-yellow-500 text-white px-3 py-1 rounded"
            >
              In Progress
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map(t => t._id)} 
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3">
              {loading ? (
                <div className="flex justify-center items-center">
                  <Loader />
                </div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <SortableItem
                    key={index}
                    task={task}
                    loadingBtn={loadingBtn}
                    editingTask={editingTask}
                    setEditingTask={setEditingTask}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                    selectedTasks={selectedTasks}
                    toggleTaskSelection={toggleTaskSelection}
                    setShowTaskDetails={setShowTaskDetails}
                  />
                ))
              ) : (
                <div className="flex justify-center items-center">
                  No Tasks Found !
                </div>
              )}
            </ul>
          </SortableContext>
        </DndContext>

        {showTaskDetails && (
          <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-(--card-bg) p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Task Details</h3>
              {(() => {
                const task = tasks.find((t) => t._id === showTaskDetails);
                return task ? (
                  <div>
                    <p>
                      <strong>Title:</strong> {task.title}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {task?.description ?? "----"}
                    </p>
                    <p>
                      <strong>Status:</strong> {task.status}
                    </p>
                    <p>
                      <strong>Priority:</strong> {task.priority}
                    </p>
                    {task.dueDate && (
                      <p>
                        <strong>Due Date:</strong>{" "}
                        {new Date(task.dueDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
              <button
                onClick={() => setShowTaskDetails(null)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SortableItem component for each task
function SortableItem({
  task,
  loadingBtn,
  editingTask,
  setEditingTask,
  updateTask,
  deleteTask,
  selectedTasks,
  toggleTaskSelection,
  setShowTaskDetails,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between border p-3 rounded-lg bg-gray-50 dark:bg-gray-950 transition"
    >
      {/* Drag Handle and Selection */}
      <div className="flex items-center w-full sm:w-[75%] gap-2 mb-2 sm:mb-0">
        <div {...attributes} {...listeners} className="cursor-grab">
          <LuGripVertical size={16} className="text-gray-500" />
        </div>
        <button onClick={() => toggleTaskSelection(task._id)}>
          {selectedTasks.includes(task._id) ? (
            <HiCheckBadge size={16} className="text-blue-500" />
          ) : (
            <LuSquare size={16} />
          )}
        </button>
        <div className=" w-full">
          {editingTask?._id === task._id ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editingTask?.title}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, title: e.target.value })
                }
                className="p-1 border rounded text-sm"
              />
              <select
                value={editingTask?.priority}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, priority: e.target.value })
                }
                className="p-1 border rounded text-sm bg-gray-50 dark:bg-gray-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <textarea
                type="text"
                placeholder="Breif description..."
                value={editingTask?.description}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value,
                  })
                }
                className="p-1 border rounded text-sm"
              />
              <input
                type="datetime-local"
                value={editingTask?.dueDate}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value })
                }
                className="p-1 border rounded text-sm"
              />
              <button
                disabled={loadingBtn}
                className="bg-blue-500 w-fit text-white px-4 py-1 rounded-lg cursor-pointer text-xs hover:bg-blue-600 transition disabled:opacity-50"
                onClick={() => {
                  if (editingTask) {
                    updateTask(editingTask._id, editingTask);
                  }
                }}
              >
                {loadingBtn ? "Updating..." : "Update"}
              </button>
            </div>
          ) : (
            <>
              <span
                className={
                  task.status === "DONE" ? "line-through text-gray-500" : ""
                }
              >
                {task.title}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Priority: {task.priority} | Due:{" "}
                {task.dueDate && new Date(task.dueDate).toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <select
          value={task.status}
          onChange={(e) => {
            const taskData = { ...task, status: e.target.value };
            updateTask(task?._id, taskData);
          }}
          className="text-xs p-1 border rounded bg-(--card-bg)"
        >
          <option value="todo">TODO</option>
          <option value="inprogress">IN PROGRESS</option>
          <option value="done">DONE</option>
        </select>
        <button
          onClick={() => setShowTaskDetails(task._id)}
          className="text-blue-500"
        >
          Details
        </button>
        <button
          onClick={() =>
            setEditingTask(editingTask?._id === task._id ? null : task)
          }
          className="text-blue-500"
        >
          <HiPencilSquare size={16} />
        </button>
        <button onClick={() => deleteTask(task._id)} className="text-red-500">
          <LuTrash2 size={16} />
        </button>
      </div>
    </li>
  );
}
