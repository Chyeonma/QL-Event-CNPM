import axiosInstance from '../config/axios';

export const notificationService = {
  getMyNotifications: async () => {
    const response = await axiosInstance.get('/api/notifications');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.put('/api/notifications/read-all');
    return response.data;
  },

  sendNotificationForManager: async (eventId, data) => {
    const response = await axiosInstance.post(`/api/events/${eventId}/notifications`, data);
    return response.data;
  }
};
