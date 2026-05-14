import prisma from "../config/db.js";
import { canAssignToRole, canCreateTasks, canLeadWork, canManageProjects } from "../utils/rbac.js";
import { parseBody, statusSchema, taskSchema, taskUpdateSchema } from "../utils/validators.js";

const taskInclude = {
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  creator: { select: { id: true, name: true } },
  project: { select: { id: true, slug: true, name: true } }
};

async function ensureProjectAndAssignee(projectId, assignedToId) {
  const [project, assignee, membership] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.user.findUnique({ where: { id: assignedToId }, select: { id: true, name: true, email: true, role: true } }),
    prisma.projectMember.findUnique({ where: { userId_projectId: { userId: assignedToId, projectId } } })
  ]);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  if (!assignee || !membership) {
    const error = new Error("Assigned user must be a member of the project");
    error.statusCode = 400;
    throw error;
  }

  return { project, assignee };
}

async function ensureUserProjectAccess(userId, projectId) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });

  if (!membership) {
    const error = new Error("You must be a project member to work on this project");
    error.statusCode = 403;
    throw error;
  }
}

async function getTaskOrThrow(taskId) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: taskInclude });

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
}

export async function createTask(user, payload) {
  if (!canCreateTasks(user)) {
    const error = new Error("You do not have permission to create tasks");
    error.statusCode = 403;
    throw error;
  }

  const data = parseBody(taskSchema, payload);
  await ensureUserProjectAccess(user.id, data.projectId);
  const { assignee } = await ensureProjectAndAssignee(data.projectId, data.assignedToId);

  if (!canLeadWork(user) && data.assignedToId !== user.id) {
    const error = new Error("Developers, interns, and members can only create self-assigned tasks");
    error.statusCode = 403;
    throw error;
  }

  if (!canAssignToRole(user.role, assignee.role)) {
    const error = new Error("You can only assign work to your own role level or below");
    error.statusCode = 403;
    throw error;
  }

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedToId: data.assignedToId,
      creatorId: user.id,
      projectId: data.projectId
    },
    include: taskInclude
  });
}

export async function updateTask(user, taskId, payload) {
  const data = parseBody(taskUpdateSchema, payload);
  const task = await getTaskOrThrow(taskId);

  if (!canLeadWork(user) && task.assignedToId !== user.id) {
    const error = new Error("You can only update your own assigned tasks");
    error.statusCode = 403;
    throw error;
  }

  if (!canLeadWork(user)) {
    return changeTaskStatus(user, taskId, { status: data.status || task.status });
  }

  if (data.projectId || data.assignedToId) {
    const { assignee } = await ensureProjectAndAssignee(data.projectId || task.projectId, data.assignedToId || task.assignedToId);
    if (!canAssignToRole(user.role, assignee.role)) {
      const error = new Error("You can only assign work to your own role level or below");
      error.statusCode = 403;
      throw error;
    }
  }

  const updateData = {
    ...data,
    dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null
  };

  return prisma.task.update({ where: { id: taskId }, data: updateData, include: taskInclude });
}

export async function deleteTask(user, taskId) {
  const task = await getTaskOrThrow(taskId);

  // Only the creator or an ADMIN can delete the task
  if (user.role !== "ADMIN" && task.creatorId !== user.id) {
    const error = new Error("Only the task creator or an administrator can delete this task");
    error.statusCode = 403;
    throw error;
  }

  await prisma.task.delete({ where: { id: taskId } });
  return { message: "Task deleted" };
}

export async function changeTaskStatus(user, taskId, payload) {
  const data = parseBody(statusSchema, payload);
  const task = await getTaskOrThrow(taskId);

  if (!canLeadWork(user) && task.assignedToId !== user.id) {
    const error = new Error("You can only update status for your assigned tasks");
    error.statusCode = 403;
    throw error;
  }

  return prisma.task.update({ where: { id: taskId }, data: { status: data.status }, include: taskInclude });
}

export async function getTasks(user, query) {
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(query.dueBefore ? { dueDate: { lte: new Date(query.dueBefore) } } : {})
  };

  if (!canManageProjects(user)) {
    where.project = { members: { some: { userId: user.id } } };
  }

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }]
  });
}

export async function getTaskById(user, taskId) {
  const task = await getTaskOrThrow(taskId);

  if (!canManageProjects(user)) {
    await ensureUserProjectAccess(user.id, task.projectId);
  }

  return task;
}
