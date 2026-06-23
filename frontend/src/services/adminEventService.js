import axiosInstance from '../config/axios';

const API_URL = '/api/admin/events';

export const adminEventService = {
  // 1. Lấy danh sách sự kiện (Có lọc trạng thái và từ khoá)
  getAllEvents: async (status, keyword) => {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (keyword && keyword.trim() !== '') params.keyword = keyword.trim();
    
    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  },

  // 2. Lấy chi tiết sự kiện
  getEventById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // 3. Tạo sự kiện
  createEvent: async (eventData) => {
    const response = await axiosInstance.post(API_URL, eventData);
    return response.data;
  },

  // 4. Cập nhật sự kiện
  updateEvent: async (id, eventData) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, eventData);
    return response.data;
  },

  // 5. Xoá sự kiện
  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  }
};
