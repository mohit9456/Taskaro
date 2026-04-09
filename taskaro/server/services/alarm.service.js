import Alarm from "../models/Alarm";
import Notification from "../models/Notification";
import User from "../models/User";

/**
 * CREATE ALARM SERVICE
 */
export const createAlarmService = async ({
  email,
  time,
  repeat,
  customDays,
  message,
  purpose,
}) => {
  // ✅ AUTH CHECK
  if (!email) {
    throw { message: "User email required", status: 401 };
  }

  // ✅ REQUIRED VALIDATION
  if (!time) {
    throw { message: "Alarm time is required", status: 400 };
  }

  if (!purpose?.label) {
    throw { message: "Alarm purpose required", status: 400 };
  }

  // ✅ USER FIND
  const user = await User.findOne({ email });

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  // ✅ TIME VALIDATION (HH:mm)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timeRegex.test(time)) {
    throw { message: "Invalid time format", status: 400 };
  }

  // ✅ repeat validation
  const validRepeat = ["Everyday", "Weekdays", "Custom"];

  if (!validRepeat.includes(repeat)) {
    throw { message: "Invalid repeat type", status: 400 };
  }

  // ✅ custom days required
  if (repeat === "Custom" && (!customDays || customDays.length === 0)) {
    throw {
      message: "Select at least one custom day",
      status: 400,
    };
  }

  // ✅ CREATE ALARM
  const alarm = await Alarm.create({
    userId: user._id,
    time,
    repeat,
    customDays: repeat === "Custom" ? customDays : [],
    message: message?.trim() || "",
    purpose,
  });

  //   // 🔔 Notification (same pattern as task)
  //   await Notification.create({
  //     userId: user._id,
  //     title: "Alarm Created",
  //     message: `${purpose.emoji} Alarm set for ${time}`,
  //     type: "ALARM_CREATED",
  //   });

  return alarm;
};

export const listAlarmService = async ({ email }) => {
  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const alarms = await Alarm.find({
    userId: user._id,
    isActive: true,
  }).sort({ createdAt: -1 });

  return alarms;
};


/**
 * DONE ALARM SERVICE
 */
export const doneAlarmService = async ({ email, alarmId }) => {
  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  if (!alarmId) {
    throw { message: "Alarm id required", status: 400 };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const alarm = await Alarm.findOneAndUpdate(
    {
      _id: alarmId,
      userId: user._id,
    },
    {
      isActive: false,
    },
    { new: true }
  );

  if (!alarm) {
    throw { message: "Alarm not found", status: 404 };
  }

  return alarm;
};


/**
 * SNOOZE ALARM SERVICE
 */
export const snoozeAlarmService = async ({
  email,
  alarmId,
  snoozeMinutes = 5,
}) => {
  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  if (!alarmId) {
    throw { message: "Alarm id required", status: 400 };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const alarm = await Alarm.findOne({
    _id: alarmId,
    userId: user._id,
  });

  if (!alarm) {
    throw { message: "Alarm not found", status: 404 };
  }

  // ✅ current alarm time
  const [hours, minutes] = alarm.time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + snoozeMinutes);

  const newTime =
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0");

  alarm.time = newTime;

  await alarm.save();

  return alarm;
};



export const getActiveAlarmService = async ({ email }) => {
  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  // ✅ current time HH:mm
  const now = new Date();
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  // ✅ find matching alarm
  const alarm = await Alarm.findOne({
    userId: user._id,
    time: currentTime,
    isActive: true,
  });

  if (!alarm) {
    return {
      alarmActive: false,
    };
  }

  return {
    alarmActive: true,
    alarmId: alarm._id,
    message: alarm.message,
    purpose: alarm.purpose,
  };
};