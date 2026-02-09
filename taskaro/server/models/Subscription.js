const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscription: { type: Object, required: true },
});

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);