import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required").max(120, "Project name is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable()
});

export const memberSchema = z.object({
  userId: z.string().uuid("Valid userId is required")
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required").max(160, "Task title is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignedToId: z.string().uuid("Valid assigned user is required"),
  projectId: z.string().uuid("Valid project is required")
});

export const taskUpdateSchema = taskSchema.partial().extend({
  dueDate: z.string().datetime().optional().nullable()
});

export const statusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"])
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors.map((error) => error.message).join(", ");
    const validationError = new Error(message);
    validationError.statusCode = 400;
    throw validationError;
  }
  return result.data;
}


