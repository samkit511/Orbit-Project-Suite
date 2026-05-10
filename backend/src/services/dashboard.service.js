import { canManageProjects } from "../utils/rbac.js";
import prisma from "../config/db.js";

function taskScope(user) {
  return canManageProjects(user) ? {} : { project: { members: { some: { userId: user.id } } } };
}

export async function getDashboardStats(user) {
  const where = taskScope(user);
  const now = new Date();

  const [totalTasks, completedTasks, overdueTasks, pendingTasks, totalProjects] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, status: "DONE" } }),
    prisma.task.count({ where: { ...where, dueDate: { lt: now }, status: { not: "DONE" } } }),
    prisma.task.count({ where: { ...where, status: { not: "DONE" } } }),
    prisma.project.count(
      canManageProjects(user)
        ? {}
        : { where: { members: { some: { userId: user.id } } } }
    )
  ]);

  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { totalTasks, completedTasks, pendingTasks, overdueTasks, totalProjects, progress };
}

export async function getRecentTasks(user) {
  return prisma.task.findMany({
    where: taskScope(user),
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, slug: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 6
  });
}

