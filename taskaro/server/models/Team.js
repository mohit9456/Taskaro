import mongoose from "mongoose";


const Team = mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Team ka naam unique hona chahiye
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users jo team me hain
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Team ka leader
    createdAt: { type: Date, default: Date.now }, // Timestamp
})

export default mongoose.models.Team || mongoose.model("Team", Team);