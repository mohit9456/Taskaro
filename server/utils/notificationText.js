exports.dueTomorrowText = (count) => {
  const lines = [
    `⏳ ${count} tasks are due tomorrow`,
    `📅 Tomorrow you have ${count} tasks lined up`,
    `⚡ ${count} tasks need attention by tomorrow`,
    `🕒 Heads up! ${count} tasks due tomorrow`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
};

exports.overdueText = (count, days) => {
  const lines = [
    `⚠️ ${count} tasks overdue for ${days} days`,
    `🔥 ${count} tasks are waiting since ${days} days`,
    `😬 ${count} overdue tasks need attention`,
    `🚨 ${count} tasks crossed their deadline`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
};
