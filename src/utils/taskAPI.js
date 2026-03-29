import axios from "axios";
import { BASE_URL } from "../constants/commonData";

export const taskAPI = {
  async getTasks(projectId) {
    const res = await axios.get(`${BASE_URL}/projects/${projectId}/tasks`, { withCredentials: true });
    return res.data;
  },
  async createTask(projectId, taskData) {
    const res = await axios.post(`${BASE_URL}/projects/${projectId}/tasks`, taskData, { withCredentials: true });
    return res.data;
  },
  async updateTask(projectId, taskId, updateData) {
    const res = await axios.patch(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, updateData, { withCredentials: true });
    return res.data;
  },
  async deleteTask(projectId, taskId) {
    const res = await axios.delete(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, { withCredentials: true });
    return res.data;
  }
};
