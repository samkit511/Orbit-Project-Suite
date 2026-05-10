import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoUsers = [
  { name: "Admin User", email: "admin@example.com", role: "ADMIN" },
  { name: "Manager User", email: "manager@example.com", role: "MANAGER" },
  { name: "Project Lead User", email: "pl@example.com", role: "PROJECT_LEAD" },
  { name: "QA Lead User", email: "ql@example.com", role: "QA_LEAD" },
  { name: "Developer User", email: "developer@example.com", role: "DEVELOPER" },
  { name: "Intern User", email: "intern@example.com", role: "INTERN" },
  { name: "Team Member", email: "member@example.com", role: "MEMBER" }
];

async function upsertUser(user, password) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name, role: user.role },
    create: { ...user, password }
  });
}

async function main() {
  const password = await bcrypt.hash("Password123", 12);
  const users = {};

  for (const demoUser of demoUsers) {
    users[demoUser.role] = await upsertUser(demoUser, password);
  }

  const project = await prisma.project.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {
      name: "Launch Plan",
      slug: "launch-plan",
      description: "Demo project for testing each role.",
      createdById: users.ADMIN.id
    },
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Launch Plan",
      slug: "launch-plan",
      description: "Demo project for testing each role.",
      createdById: users.ADMIN.id
    }
  });

  for (const user of Object.values(users)) {
    await prisma.projectMember.upsert({
      where: { userId_projectId: { userId: user.id, projectId: project.id } },
      update: {},
      create: { userId: user.id, projectId: project.id }
    });
  }

  const demoTasks = [
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Prepare deployment checklist",
      description: "Confirm Railway environment variables and migration command.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      assignedToId: users.MANAGER.id
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      title: "Plan sprint tasks",
      description: "Break project work into assignable tasks.",
      priority: "MEDIUM",
      status: "TODO",
      assignedToId: users.PROJECT_LEAD.id
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      title: "Write smoke test cases",
      description: "Create QA test cases for login, project, and task flows.",
      priority: "MEDIUM",
      status: "TODO",
      assignedToId: users.QA_LEAD.id
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      title: "Implement task filters",
      description: "Verify task filtering by status and project.",
      priority: "LOW",
      status: "TODO",
      assignedToId: users.DEVELOPER.id
    },
    {
      id: "66666666-6666-6666-6666-666666666666",
      title: "Update demo screenshots",
      description: "Capture screens for the final README and submission.",
      priority: "LOW",
      status: "TODO",
      assignedToId: users.INTERN.id
    }
  ];

  for (const task of demoTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: { ...task, projectId: project.id, dueDate: new Date(Date.now() + 86400000) },
      create: { ...task, projectId: project.id, dueDate: new Date(Date.now() + 86400000) }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

