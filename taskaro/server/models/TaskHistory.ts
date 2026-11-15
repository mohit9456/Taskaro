import mongoose from "mongoose";


const TaskTracker = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changes: { type: Object }, // JSON format me store karega kya change hua
    updatedAt: { type: Date, default: Date.now },
})

const TaskHistoryModel: any =
  mongoose.models.TaskTracker || mongoose.model("TaskTracker", TaskTracker);
export default TaskHistoryModel;