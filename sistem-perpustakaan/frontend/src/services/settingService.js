import api from './api';

export const getSettings = async () => {
  const res = await api.get('/settings');
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await api.put('/settings', data);
  return res.data;
};
