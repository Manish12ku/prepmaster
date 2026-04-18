import api from './api';

export const getStudentMonthlyPerformance = async (year) => {
  const response = await api.get(`/monthly-performance/student?year=${year}`);
  return response.data;
};

export const getTopMonthlyPerformers = async (month, year, limit = 15) => {
  const response = await api.get(`/monthly-performance/top-performers?month=${month}&year=${year}&limit=${limit}`);
  return response.data;
};

export const getAllMonthlyPerformance = async (year) => {
  const response = await api.get(`/monthly-performance/all?year=${year}`);
  return response.data;
};

export const recalculateMonthlyPerformance = async (year, month) => {
  const response = await api.post('/monthly-performance/recalculate', { year, month });
  return response.data;
};
