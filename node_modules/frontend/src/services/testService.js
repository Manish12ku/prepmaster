import api from './api';

export const getAllTests = async (params = {}) => {
  const response = await api.get('/tests', { params });
  return response.data;
};

export const getAvailableTests = async (params = {}) => {
  const response = await api.get('/tests/available', { params });
  return response.data;
};

export const getTestById = async (id) => {
  const response = await api.get(`/tests/${id}`);
  return response.data;
};

export const getTestForAttempt = async (id, secretCode) => {
  const response = await api.get(`/tests/${id}/attempt`, {
    params: { secretCode }
  });
  return response.data;
};

export const createTest = async (testData) => {
  const response = await api.post('/tests', testData);
  return response.data;
};

export const updateTest = async (id, testData) => {
  const response = await api.patch(`/tests/${id}`, testData);
  return response.data;
};

export const deleteTest = async (id) => {
  const response = await api.delete(`/tests/${id}`);
  return response.data;
};
