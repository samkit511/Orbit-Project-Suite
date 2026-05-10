import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { loginSchema, parseBody, signupSchema } from "../utils/validators.js";

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function signupUser(payload) {
  const data = parseBody(signupSchema, payload);
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const password = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password,
      role: "MEMBER"
    }
  });

  return { user: sanitizeUser(user), token: generateToken(user) };
}

export async function loginUser(payload) {
  const data = parseBody(loginSchema, payload);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return { user: sanitizeUser(user), token: generateToken(user) };
}

