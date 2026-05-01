import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// Files
export const uploadFile = (data) => API.post("/files/upload", data);
export const getMyFiles = () => API.get("/files/my-files");
export const downloadFile = (id) => API.get(`/files/download/${id}`, { responseType: "blob" });
export const deleteFile = (id) => API.delete(`/files/delete/${id}`);

// Share
export const generateShareLink = (data) => API.post("/share/generate", data);
export const revokeShareLink = (id) => API.delete(`/share/revoke/${id}`);
export const getShareDetails = (id) => API.get(`/share/details/${id}`);

// Admin
export const getAdminStats = () => API.get("/admin/stats");
export const getAuditLogs = (page, filter) => API.get(`/admin/logs?page=${page}&filter=${filter}`);

// User Security (own logs)
export const getMyStats = () => API.get("/admin/my-stats");
export const getMyLogs = (page, filter) => API.get(`/admin/my-logs?page=${page}&filter=${filter}`);