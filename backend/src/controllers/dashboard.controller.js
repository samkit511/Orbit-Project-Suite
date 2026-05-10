import { getDashboardStats, getRecentTasks } from "../services/dashboard.service.js";

export async function stats(req, res, next) {
  try {
    res.json(await getDashboardStats(req.user));
  } catch (error) {
    next(error);
  }
}

export async function recent(req, res, next) {
  try {
    res.json(await getRecentTasks(req.user));
  } catch (error) {
    next(error);
  }
}
