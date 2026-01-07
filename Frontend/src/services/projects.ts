/**
 * Project management API service
 */
import apiRequest from "./api";

export interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
}

export interface ProjectUpdate {
  name: string;
}

/**
 * Get all projects for the current user
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function getProjects(token: string | null): Promise<Project[]> {
  return apiRequest<Project[]>("/api/projects", token);
}

/**
 * Get a specific project by ID
 * @param projectId - Project ID
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function getProject(
  projectId: string,
  token: string | null
): Promise<Project> {
  return apiRequest<Project>(`/api/projects/${projectId}`, token);
}

/**
 * Create a new project
 * @param data - Project data
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function createProject(
  data: ProjectCreate,
  token: string | null
): Promise<Project> {
  return apiRequest<Project>("/api/projects", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a project
 * @param projectId - Project ID
 * @param data - Updated project data
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function updateProject(
  projectId: string,
  data: ProjectUpdate,
  token: string | null
): Promise<Project> {
  return apiRequest<Project>(`/api/projects/${projectId}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a project
 * @param projectId - Project ID
 * @param token - Clerk session token (from useAuth().getToken())
 */
export async function deleteProject(
  projectId: string,
  token: string | null
): Promise<void> {
  return apiRequest<void>(`/api/projects/${projectId}`, token, {
    method: "DELETE",
  });
}
