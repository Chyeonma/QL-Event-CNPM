import axiosInstance from '../config/axios';

export const adminUserService = {
  getUsersByRole: async (role) => {
    const response = await axiosInstance.get(`/api/admin/users?role=${role}`);
    return response.data;
  },
  
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post('/api/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },

  lockUser: async (id) => {
    const response = await axiosInstance.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  unlockUser: async (id) => {
    const response = await axiosInstance.post(`/api/admin/users/${id}/unlock`);
    return response.data;
  }
};
