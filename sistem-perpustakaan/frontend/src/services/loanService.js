import api from './api';

export const getLoans = async (params = {}) => {
  const res = await api.get('/loans', { params });
  return res.data;
};

export const getLoan = async (id) => {
  const res = await api.get(`/loans/${id}`);
  return res.data;
};

export const createLoan = async (data) => {
  const res = await api.post('/loans', data);
  return res.data;
};
