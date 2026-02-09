import Notification from "../models/Notification";
import Task from "../models/Task";
import User from "../models/User";

/**
 * CREATE TASK SERVICE
 */
export const createTaskService = async ({
  email,
  title,
  description,
  dueDate,
  priority,
  assignTo,
}) => {
  // 🔴 Required checks
  if (!email) {
    throw { message: "User email is required", status: 401 };
  }

  if (!title || title.trim() === "") {
    throw { message: "Task title is required", status: 400 };
  }

  // 🔍 Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  if (assignTo !== "self") {
    throw { message: "You can assign only yourself", status: 400 };
  }

  // 🧠 Validate enums manually (extra safety)
  const validPriority = ["low", "medium", "high"];

  if (!priority || !validPriority.includes(priority)) {
    throw { message: "Invalid task priority", status: 400 };
  }

  // 📅 Due date validation
  let parsedDueDate = null;

  if (dueDate) {
    parsedDueDate = new Date(dueDate);
    const now = new Date();

    // invalid date OR past date-time
    if (isNaN(parsedDueDate.getTime())) {
      throw { message: "Invalid due date format", status: 400 };
    }

    if (parsedDueDate <= now) {
      throw {
        message: "Due date must be in the future",
        status: 400,
      };
    }
  }

  // 💾 Create task
  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || "",
    priority: priority || "medium",
    dueDate: parsedDueDate,
    assignedTo: user._id, // 👈 self assign
    createdBy: user._id,
  });

  // 🔔 Notification
  await Notification.create({
    userId: task.assignedTo,
    title: "New Task Created",
    message: `Task "${task.title}" has been created`,
    type: "TASK_CREATED",
  });

  // ✅ SUCCESS RESPONSE
  return task;
};

/**
 * Get all tasks
 */
export const getAllTasksService = async (email) => {
  if (!email) {
    throw { message: "Email is required", status: 400 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const tasks = await Task.find({ createdBy: user._id, isTrashed: false }).sort(
    {
      createdAt: -1,
    },
  );

  return tasks;
};

/**
 * Get all trash tasks
 */
export const getAllTrashService = async (email) => {
  if (!email) {
    throw { error: "Email is required", status: 400 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { error: "User not found", status: 404 };
  }

  // 📅 30 days ago date
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 🗑️ Delete tasks trashed before 30 days
  await Task.deleteMany({
    createdBy: user._id,
    isTrashed: true,
    trashedAt: { $lt: thirtyDaysAgo },
  });

  // 📦 Return remaining trash tasks
  const tasks = await Task.find({
    createdBy: user._id,
    isTrashed: true,
  }).sort({ trashedAt: -1 });

  return tasks;
};

/**
 * Task stats for graph
 * filter: week | month | year
 */
export const getTaskStatsService = async (filter = "week") => {
  let startDate = new Date();

  if (filter === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (filter === "month") {
    startDate.setDate(startDate.getDate() - 30);
  } else if (filter === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const tasks = await Task.find({
    createdAt: { $gte: startDate },
  });

  // 🔹 Bar chart aggregation
  const barMap = {};

  tasks.forEach((task) => {
    const key = task.createdAt.toISOString().split("T")[0];

    if (!barMap[key]) {
      barMap[key] = {
        date: key,
        completed: 0,
        pending: 0,
      };
    }

    if (task.status === "done") {
      barMap[key].completed++;
    } else {
      barMap[key].pending++;
    }
  });

  // 🔹 Pie chart
  const pieChart = {
    completed: await Task.countDocuments({ status: "done" }),
    pending: await Task.countDocuments({
      status: { $ne: "done" },
    }),
  };

  return {
    barChart: Object.values(barMap),
    pieChart,
  };
};

export const deleteTaskService = async ({ email, _id }) => {
  if (!email) {
    throw { message: "Email is required", status: 401 };
  }

  if (!_id) {
    throw { message: "Task ID required", status: 400 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  // 🔥 BULK DELETE (soft delete)
  if (Array.isArray(_id)) {
    const result = await Task.updateMany(
      {
        _id: { $in: _id },
        createdBy: user._id,
        isTrashed: false,
      },
      {
        $set: {
          isTrashed: true,
          trashedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw { message: "No tasks found to delete", status: 404 };
    }

    return {
      success: true,
      deletedCount: result.modifiedCount,
    };
  }

  // 🔹 SINGLE DELETE (existing logic)
  const task = await Task.findOne({
    _id,
    createdBy: user._id,
  });

  if (!task) {
    throw { message: "Task not found or unauthorized", status: 404 };
  }

  if (task.isTrashed) {
    throw { message: "Task already in trash", status: 400 };
  }

  task.isTrashed = true;
  task.trashedAt = new Date();

  await task.save();

  return task;
};

export const restoreTaskService = async ({ email, _id }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const task = await Task.findOne({ _id, createdBy: user?._id });

  if (!task) {
    throw { message: "Task not found or unauthorized", status: 404 };
  }

  if (!task.isTrashed) {
    throw { message: "Task is not in trash", status: 400 };
  }

  task.isTrashed = false;
  task.trashedAt = null;

  await task.save();

  return task;
};

export const updateTaskService = async ({
  taskId,
  email,
  title,
  description,
  status,
  priority,
  dueDate,
}) => {
  // 🔴 Required checks
  if (!taskId) {
    throw { message: "Task ID is required", status: 400 };
  }

  if (!email) {
    throw { message: "User email is required", status: 401 };
  }

  // 🔍 Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const validStatus = ["todo", "inprogress", "done"];

  // 🔥 BULK UPDATE CASE
  if (Array.isArray(taskId)) {
    if (!status || !validStatus.includes(status)) {
      throw {
        message: "Only valid status can be updated in bulk",
        status: 400,
      };
    }

    const task = await Task.updateMany(
      {
        _id: { $in: taskId },
        createdBy: user._id,
      },
      {
        $set: {
          status,
          completedAt: status === "done" ? new Date() : null,
        },
      },
    );

    return task;
  }

  // 🔍 Find task
  const task = await Task.findOne({
    _id: taskId,
    createdBy: user._id,
    isTrashed: false,
  });

  if (!task) {
    throw { message: "Task not found", status: 404 };
  }

  // 🧠 Update fields only if provided
  if (title !== undefined) {
    if (!title.trim()) {
      throw { message: "Task title cannot be empty", status: 400 };
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  // 🎯 Priority validation
  if (priority !== undefined) {
    const validPriority = ["low", "medium", "high"];
    if (!validPriority.includes(priority)) {
      throw { message: "Invalid task priority", status: 400 };
    }
    task.priority = priority;
  }

  // 📅 Due date validation
  if (dueDate !== undefined) {
    const parsedDate = new Date(dueDate);

    if (isNaN(parsedDate.getTime())) {
      throw { message: "Invalid due date format", status: 400 };
    }
    task.dueDate = parsedDate;
  }

  // ✅ Status handling
  if (status !== undefined) {
    if (!validStatus.includes(status)) {
      throw { message: "Invalid task status", status: 400 };
    }

    task.status = status;

    if (status === "done") {
      task.completedAt = new Date();
      task.dueDate = null; // optional cleanup
    } else {
      task.completedAt = null;
    }
  }

  await task.save();

  // ✅ Success response
  return task;
};
