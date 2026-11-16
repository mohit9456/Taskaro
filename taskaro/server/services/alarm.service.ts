import Alarm from "../models/Alarm";
import User from "../models/User";
import { connectToDatabase } from "../db/mongodb";

/**
 * CREATE ALARM SERVICE
 */
export const createAlarmService = async ({
  email,
  label = "Alarm",
  time,
  repeat = "Everyday",
  customDays = [],
  message = "",
  purpose,
  sound = "classic",
  volume = 80,
  snoozeDuration = 5,
  challenge = "none",
  vibration = true,
  gradualVolume = true,
  tags = [],
}: any) => {
  await connectToDatabase();

  // ✅ AUTH CHECK
  if (!email) {
    throw { message: "User email required", status: 401 };
  }

  // ✅ REQUIRED VALIDATION
  if (!time) {
    throw { message: "Alarm time is required", status: 400 };
  }

  // ✅ USER FIND
  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  // ✅ TIME VALIDATION (HH:mm)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    throw { message: "Invalid time format (HH:mm required)", status: 400 };
  }

  // ✅ repeat validation
  const validRepeat = ["Everyday", "Weekdays", "Custom", "Once"];
  if (!validRepeat.includes(repeat)) {
    throw { message: "Invalid repeat type", status: 400 };
  }

  // ✅ custom days required
  if (repeat === "Custom" && (!customDays || customDays.length === 0)) {
    throw { message: "Select at least one custom day", status: 400 };
  }

  // Fallback default purpose
  const defaultPurpose = purpose?.label
    ? purpose
    : { label: label || "Wake Up", emoji: "⏰", color: "from-blue-500 to-indigo-600" };

  // ✅ CREATE ALARM
  const alarm = await Alarm.create({
    userId: user._id,
    label: label.trim() || defaultPurpose.label,
    time,
    repeat,
    customDays: repeat === "Custom" ? customDays : [],
    message: message?.trim() || "",
    purpose: defaultPurpose,
    sound,
    volume: Number(volume) || 80,
    snoozeDuration: Number(snoozeDuration) || 5,
    challenge,
    vibration: Boolean(vibration),
    gradualVolume: Boolean(gradualVolume),
    tags: Array.isArray(tags) ? tags : [],
    isActive: true,
  });

  return alarm;
};

/**
 * LIST ALL ALARMS FOR USER (Both active and paused)
 */
export const listAlarmService = async ({ email }: { email: string }) => {
  await connectToDatabase();
  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const alarms = await Alarm.find({
    userId: user._id,
  }).sort({ time: 1, createdAt: -1 });

  return alarms;
};

/**
 * TOGGLE ALARM ACTIVE STATE
 */
export const toggleAlarmService = async ({
  email,
  alarmId,
  isActive,
}: {
  email: string;
  alarmId: string;
  isActive?: boolean;
}) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const alarm = await Alarm.findOne({ _id: alarmId, userId: user._id });
  if (!alarm) {
    throw { message: "Alarm not found", status: 404 };
  }

  alarm.isActive = isActive !== undefined ? isActive : !alarm.isActive;
  await alarm.save();

  return alarm;
};

/**
 * DELETE ALARM
 */
export const deleteAlarmService = async ({
  email,
  alarmId,
}: {
  email: string;
  alarmId: string;
}) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const alarm = await Alarm.findOneAndDelete({ _id: alarmId, userId: user._id });
  if (!alarm) {
    throw { message: "Alarm not found", status: 404 };
  }

  return { success: true, alarmId };
};

/**
 * DONE ALARM SERVICE
 */
export const doneAlarmService = async ({
  email,
  alarmId,
}: {
  email: string;
  alarmId: string;
}) => {
  await connectToDatabase();

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

  // Repeating alarms remain active for future days; non-repeating alarms become inactive
  const isRepeating = ["Everyday", "Weekdays", "Custom"].includes(alarm.repeat);
  if (!isRepeating) {
    alarm.isActive = false;
    await alarm.save();
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
}: {
  email: string;
  alarmId: string;
  snoozeMinutes?: number;
}) => {
  await connectToDatabase();

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

  const [hours, minutes] = alarm.time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes + (snoozeMinutes || alarm.snoozeDuration || 5));

  const newTime =
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0");

  alarm.time = newTime;
  await alarm.save();

  return alarm;
};

/**
 * GET CURRENTLY RINGING / ACTIVE ALARM
 */
export const getActiveAlarmService = async ({ email }: { email: string }) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const now = new Date();
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

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
    label: alarm.label,
    message: alarm.message,
    purpose: alarm.purpose,
    sound: alarm.sound,
    challenge: alarm.challenge,
    snoozeDuration: alarm.snoozeDuration,
  };
};
