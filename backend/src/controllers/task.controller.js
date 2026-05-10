import {
  changeTaskStatus,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} from "../services/task.service.js";

export async function create(req, res, next) {
  try {
    res.status(201).json(await createTask(req.user, req.body));
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    res.json(await getTasks(req.user, req.query));
  } catch (error) {
    next(error);
  }
}

export async function detail(req, res, next) {
  try {
    res.json(await getTaskById(req.user, req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await updateTask(req.user, req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    res.json(await deleteTask(req.user, req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    res.json(await changeTaskStatus(req.user, req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

