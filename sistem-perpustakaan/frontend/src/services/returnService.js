import api from './api';

export const getPendingReturns = async () => {
  const res = await api.get('/returns/pending');
  return res.data;
};

export const processReturn = async (data) => {
  const res = await api.post('/returns', data);
  return res.data;
};
