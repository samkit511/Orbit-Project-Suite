import prisma from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

export async function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      const error = new Error("Authentication token is required");
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      const error = new Error("Authenticated user no longer exists");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
}
