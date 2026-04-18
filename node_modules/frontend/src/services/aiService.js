import api from './api';

export const evaluateAnswer = async (data) => {
  const response = await api.post('/ai/evaluate-answer', data);
  return response.data;
};
