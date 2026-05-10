export function isOverdue(task) {
  return task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();
}

export function toDateOrUndefined(value) {
  return value ? new Date(value) : undefined;
}
