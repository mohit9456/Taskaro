exports.groupByUser = (tasks) => {
  return tasks.reduce((acc, task) => {
    const id = task.assignedTo.toString();
    acc[id] = acc[id] || [];
    acc[id].push(task);
    return acc;
  }, {});
};

exports.getOverdueStage = (days) => {
  if (days >= 7) return "OVERDUE_7_DAYS";
  if (days >= 3) return "OVERDUE_3_DAYS";
  if (days >= 1) return "OVERDUE_1_DAY";
  return null;
};
