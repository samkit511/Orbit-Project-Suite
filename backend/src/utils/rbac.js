const roleRanks = {
  ADMIN: 100,
  MANAGER: 80,
  PROJECT_LEAD: 60,
  QA_LEAD: 60,
  DEVELOPER: 40,
  MEMBER: 30,
  INTERN: 20
};

export const managerRoles = ["ADMIN", "MANAGER"];
export const leadRoles = ["ADMIN", "MANAGER", "PROJECT_LEAD", "QA_LEAD"];
export const taskCreatorRoles = ["ADMIN", "MANAGER", "PROJECT_LEAD", "QA_LEAD", "DEVELOPER", "MEMBER", "INTERN"];

export function roleRank(role) {
  return roleRanks[role] || 0;
}

export function canManageProjects(user) {
  return managerRoles.includes(user?.role);
}

export function canLeadWork(user) {
  return leadRoles.includes(user?.role);
}

export function canCreateTasks(user) {
  return taskCreatorRoles.includes(user?.role);
}

export function canAssignToRole(assignerRole, assigneeRole) {
  return roleRank(assignerRole) >= roleRank(assigneeRole);
}
