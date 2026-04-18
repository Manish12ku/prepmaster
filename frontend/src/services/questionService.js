import api from './api';

export const getAllQuestions = async (params = {}) => {
  const response = await api.get('/questions', { params });
  return response.data;
};

export const getQuestionById = async (id) => {
  const response = await api.get(`/questions/${id}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/questions', questionData);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await api.patch(`/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};

export const approveQuestion = async (id, isApproved) => {
  const response = await api.patch(`/questions/${id}/approve`, { isApproved });
  return response.data;
};

export const bulkUploadQuestions = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/questions/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getSubjects = async () => {
  const response = await api.get('/questions/subjects');
  return response.data;
};

export const getTopicsBySubject = async (subject) => {
  const response = await api.get(`/questions/subjects/${subject}/topics`);
  return response.data;
};
