import api from './api';

export const getDashboardStats = async () => {
  const res = await api.get('/reports/dashboard');
  return res.data;
};

export const getBookReport = async () => {
  const res = await api.get('/reports/books');
  return res.data;
};

export const getMemberReport = async () => {
  const res = await api.get('/reports/members');
  return res.data;
};

export const getTransactionReport = async (params = {}) => {
  const res = await api.get('/reports/transactions', { params });
  return res.data;
};
