const cron = require("node-cron");
const Alarm = require("../models/Alarm");
const User = require("../models/User");
const sendPush = require("../services/push.service");

const startAlarmCron = () => {
  // every minute
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Alarm cron running");

    const now = new Date();

    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    const today = now.getDay(); // 0 sunday, 1 monday...
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayName = DAY_NAMES[today];

    const alarms = await Alarm.find({
      time: currentTime,
      isActive: true,
    }).lean();

    for (const alarm of alarms) {
      // ✅ WEEKDAYS CHECK (Mon-Fri)
      if (alarm.repeat === "Weekdays" && (today === 0 || today === 6)) {
        continue;
      }

      // ✅ CUSTOM DAY CHECK (Supports "Mon", "Tue" strings and 0-6 numbers)
      if (alarm.repeat === "Custom") {
        const hasDay =
          alarm.customDays.includes(todayName) ||
          alarm.customDays.includes(today) ||
          alarm.customDays.includes(String(today));
        if (!hasDay) continue;
      }

      const user = await User.findById(alarm.userId);

      if (!user?.fcmToken) continue;

      await sendPush({
        token: user.fcmToken,
        title: "⏰ Alarm",
        body: `${alarm.purpose?.emoji} ${alarm.purpose?.label} Time`,
        data: {
          type: "ALARM_RING",
          alarmId: alarm._id.toString(),
          clickUrl: "/dashboard/smart-alarm",
        },
      });
    }

    console.log("✅ Alarm cron done");
  });
};

module.exports = startAlarmCron;