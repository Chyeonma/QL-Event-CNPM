import axiosInstance from '../config/axios';

const API_URL = '/api/events';

export const publicEventService = {
  // 1. Lấy danh sách sự kiện công khai
  getPublishedEvents: async (keyword) => {
    const params = {};
    if (keyword && keyword.trim() !== '') params.keyword = keyword.trim();
    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  },

  // 2. Lấy chi tiết sự kiện
  getEventDetail: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // 3. Đăng ký tham gia
  registerEvent: async (id) => {
    const response = await axiosInstance.post(`${API_URL}/${id}/register`);
    return response.data;
  },

  // 4. Hủy đăng ký tham gia
  cancelRegistration: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}/register`);
    return response.data;
  },

  // 5. Lấy danh sách sự kiện đã đăng ký của tôi
  getMyRegistrations: async () => {
    const response = await axiosInstance.get(`${API_URL}/my-registrations`);
    return response.data;
  },

  // 6. Quét QR điểm danh
  checkInEvent: async (id) => {
    const response = await axiosInstance.post(`${API_URL}/${id}/check-in`);
    return response.data;
  }
};
