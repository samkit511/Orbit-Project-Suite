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

const demoProjects = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Launch Plan",
    slug: "launch-plan",
    description: "Coordinate the public launch checklist, release notes, and final QA signoff."
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    name: "Client Portal Refresh",
    slug: "client-portal-refresh",
    description: "Refresh the customer-facing portal with clearer navigation and faster project views."
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    name: "Mobile QA Stabilization",
    slug: "mobile-qa-stabilization",
    description: "Stabilize mobile workflows before the next stakeholder demo."
  }
];

const demoTasks = [
  ["22222222-2222-2222-2222-222222222222", "Prepare deployment checklist", "Confirm Railway variables, health checks, and release rollback notes.", "HIGH", "IN_PROGRESS", "ADMIN", "launch-plan", 1],
  ["33333333-3333-3333-3333-333333333333", "Plan sprint task ownership", "Break launch work into assignable tasks and confirm dependencies.", "HIGH", "TODO", "MANAGER", "launch-plan", 2],
  ["44444444-4444-4444-4444-444444444444", "Review project timeline", "Validate milestone dates and flag delivery risks for the launch plan.", "MEDIUM", "TODO", "PROJECT_LEAD", "launch-plan", 3],
  ["55555555-5555-5555-5555-555555555555", "Write smoke test cases", "Create test cases for login, project creation, task updates, and dashboard stats.", "MEDIUM", "TODO", "QA_LEAD", "mobile-qa-stabilization", 4],
  ["66666666-6666-6666-6666-666666666666", "Implement task filters", "Verify task filtering by status and project across dashboard and task pages.", "MEDIUM", "IN_PROGRESS", "DEVELOPER", "client-portal-refresh", 5],
  ["99999999-9999-9999-9999-999999999999", "Update demo screenshots", "Capture fresh screenshots for the final submission walkthrough.", "LOW", "TODO", "INTERN", "client-portal-refresh", 6],
  ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "Validate profile copy", "Check role names, button labels, and empty states for clarity.", "LOW", "TODO", "MEMBER", "client-portal-refresh", 7],
  ["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "Confirm API error handling", "Review common API failure states and make sure user-facing messages are useful.", "HIGH", "TODO", "DEVELOPER", "mobile-qa-stabilization", -1],
  ["cccccccc-cccc-cccc-cccc-cccccccccccc", "Close completed launch items", "Mark finished launch checklist items as done and summarize remaining blockers.", "MEDIUM", "DONE", "MANAGER", "launch-plan", -2]
];

async function upsertUser(user, password) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name, role: user.role, password },
    create: { ...user, password }
  });
}

async function main() {
  const password = await bcrypt.hash("Password123", 12);
  const users = {};

  for (const demoUser of demoUsers) {
    users[demoUser.role] = await upsertUser(demoUser, password);
  }

  const projects = {};
  for (const project of demoProjects) {
    projects[project.slug] = await prisma.project.upsert({
      where: { id: project.id },
      update: { ...project, createdById: users.MANAGER.id },
      create: { ...project, createdById: users.MANAGER.id }
    });

    for (const user of Object.values(users)) {
      await prisma.projectMember.upsert({
        where: { userId_projectId: { userId: user.id, projectId: project.id } },
        update: {},
        create: { userId: user.id, projectId: project.id }
      });
    }
  }

  for (const [id, title, description, priority, status, assignedRole, projectSlug, dayOffset] of demoTasks) {
    const dueDate = new Date(Date.now() + dayOffset * 86400000);
    const task = { title, description, priority, status, dueDate };

    await prisma.task.upsert({
      where: { id },
      update: {
        ...task,
        assignedToId: users[assignedRole].id,
        creatorId: users.MANAGER.id,
        projectId: projects[projectSlug].id
      },
      create: {
        id,
        ...task,
        assignedToId: users[assignedRole].id,
        creatorId: users.MANAGER.id,
        projectId: projects[projectSlug].id
      }
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
