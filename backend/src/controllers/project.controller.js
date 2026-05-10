import {
  addMemberToProject,
  createProject,
  getAllProjects,
  getProjectById,
  removeMemberFromProject
} from "../services/project.service.js";

export async function create(req, res, next) {
  try {
    res.status(201).json(await createProject(req.user.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    res.json(await getAllProjects(req.user));
  } catch (error) {
    next(error);
  }
}

export async function detail(req, res, next) {
  try {
    res.json(await getProjectById(req.user, req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function addMember(req, res, next) {
  try {
    res.status(201).json(await addMemberToProject(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    res.json(await removeMemberFromProject(req.params.id, req.params.memberId));
  } catch (error) {
    next(error);
  }
}
