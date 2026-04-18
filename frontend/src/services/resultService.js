import api from './api';

export const submitResult = async (resultData) => {
  const response = await api.post('/results', resultData);
  return response.data;
};

export const getUserResults = async (userId) => {
  const response = await api.get(`/results/user/${userId}`);
  return response.data;
};

export const getResultById = async (id) => {
  const response = await api.get(`/results/${id}`);
  return response.data;
};

export const getResultsByTest = async (testId) => {
  const response = await api.get(`/results/test/${testId}`);
  return response.data;
};

export const getPlatformAnalytics = async () => {
  const response = await api.get('/results/analytics/platform');
  return response.data;
};

export const getStudentPerformance = async (userId) => {
  const response = await api.get(`/results/student/${userId}/performance`);
  return response.data;
};

export const getPausedResult = async (testId) => {
  const response = await api.get(`/results/paused/${testId}`);
  return response.data;
};

export const savePausedResult = async (pauseData) => {
  const response = await api.post('/results/pause', pauseData);
  return response.data;
};
