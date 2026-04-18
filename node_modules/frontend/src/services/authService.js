import api from './api';

export const syncUser = async (userData) => {
  const response = await api.post('/users/sync', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.patch('/users/profile', profileData);
  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/users/${userId}/role`, { role });
  return response.data;
};

export const toggleUserBlock = async (userId, isBlocked) => {
  const response = await api.patch(`/users/${userId}/block`, { isBlocked });
  return response.data;
};
