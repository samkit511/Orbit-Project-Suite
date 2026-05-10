export function formatDate(date) {
  if (!date) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function statusLabel(status) {
  return {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    DONE: "Done"
  }[status] || status;
}

export function roleLabel(role) {
  return {
    ADMIN: "Admin",
    MANAGER: "Manager",
    PROJECT_LEAD: "Project Lead",
    QA_LEAD: "QA Lead",
    DEVELOPER: "Developer",
    INTERN: "Intern",
    MEMBER: "Member"
  }[role] || role;
}

export function priorityClass(priority) {
  return {
    LOW: "bg-emerald-100 text-emerald-700",
    MEDIUM: "bg-gold/20 text-amber-800",
    HIGH: "bg-coral/15 text-coral"
  }[priority] || "bg-slate-100 text-slate-700";
}

export function getErrorMessage(error) {
  return error?.response?.data?.message || error.message || "Something went wrong";
}
