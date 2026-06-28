import axiosInstance from '../config/axios';

export const adminRegistrationService = {
  getEventRegistrations: async (eventId) => {
    const response = await axiosInstance.get(`/api/admin/events/${eventId}/registrations`);
    return response.data;
  },

  getAllRegistrations: async () => {
    const response = await axiosInstance.get('/api/admin/events/registrations/all');
    return response.data;
  },

  manualCheckIn: async (registrationId) => {
    const response = await axiosInstance.post(`/api/admin/events/registrations/${registrationId}/check-in`);
    return response.data;
  },

  cancelCheckIn: async (registrationId) => {
    const response = await axiosInstance.post(`/api/admin/events/registrations/${registrationId}/cancel-check-in`);
    return response.data;
  },

  cancelRegistration: async (registrationId) => {
    const response = await axiosInstance.delete(`/api/admin/events/registrations/${registrationId}`);
    return response.data;
  }
};
