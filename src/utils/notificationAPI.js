import axios from "axios";
import { BASE_URL } from "../constants/commonData";

const normalizeArrayResponse = (res, key) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.[key])) return res.data[key];
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

export const notificationAPI = {
  // Get all notifications for the logged-in user
  async getNotifications() {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      withCredentials: true,
    });
    return normalizeArrayResponse(res, "notifications");
  },

  // Mark a single notification as read
  async markAsRead(notificationId) {
    const res = await axios.patch(
      `${BASE_URL}/notifications/${notificationId}/read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const res = await axios.patch(
      `${BASE_URL}/notifications/read-all`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    const res = await axios.delete(
      `${BASE_URL}/notifications/${notificationId}`,
      { withCredentials: true }
    );
    return res.data;
  },

  // Clear all notifications
  async clearAll() {
    const res = await axios.delete(`${BASE_URL}/notifications`, {
      withCredentials: true,
    });
    return res.data;
  },
};

export default notificationAPI;
