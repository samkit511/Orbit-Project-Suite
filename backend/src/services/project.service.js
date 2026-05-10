import prisma from "../config/db.js";
import { canManageProjects } from "../utils/rbac.js";
import { createUniqueProjectSlug } from "../utils/slug.js";
import { memberSchema, parseBody, projectSchema } from "../utils/validators.js";

const projectInclude = {
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  },
  tasks: {
    include: {
      assignedTo: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: "desc" }
  }
};

export async function createProject(userId, payload) {
  const data = parseBody(projectSchema, payload);
  const slug = await createUniqueProjectSlug(prisma, data.name);
  return prisma.project.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      createdById: userId,
      members: { create: { userId } }
    },
    include: projectInclude
  });
}

export async function getAllProjects(user) {
  const where = canManageProjects(user)
    ? {}
    : { members: { some: { userId: user.id } } };

  return prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function getProjectById(user, projectKey) {
  const project = await prisma.project.findFirst({
    where: { OR: [{ id: projectKey }, { slug: projectKey }] },
    include: projectInclude
  });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const hasAccess = canManageProjects(user) || project.members.some((member) => member.userId === user.id);

  if (!hasAccess) {
    const error = new Error("You do not have access to this project");
    error.statusCode = 403;
    throw error;
  }

  return project;
}

export async function addMemberToProject(projectKey, payload) {
  const data = parseBody(memberSchema, payload);
  const [project, user] = await Promise.all([
    prisma.project.findFirst({ where: { OR: [{ id: projectKey }, { slug: projectKey }] } }),
    prisma.user.findUnique({ where: { id: data.userId } })
  ]);

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.projectMember.upsert({
    where: { userId_projectId: { userId: data.userId, projectId: project.id } },
    update: {},
    create: { userId: data.userId, projectId: project.id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } }
  });
}

export async function removeMemberFromProject(projectKey, memberId) {
  const project = await prisma.project.findFirst({ where: { OR: [{ id: projectKey }, { slug: projectKey }] } });

  if (!project) {
    const error = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const member = await prisma.projectMember.findFirst({ where: { id: memberId, projectId: project.id } });

  if (!member) {
    const error = new Error("Project member not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.projectMember.delete({ where: { id: member.id } });
  return { message: "Member removed from project" };
}

