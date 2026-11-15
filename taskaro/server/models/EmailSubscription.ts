import mongoose from "mongoose";

const emailSubscriptionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

const EmailSubscription: any =
  mongoose.models.EmailSubscription ||
  mongoose.model("EmailSubscription", emailSubscriptionSchema);
export default EmailSubscription;