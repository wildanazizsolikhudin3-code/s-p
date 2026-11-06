import api from './api';

export const login = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get('/auth/profile');
  return res.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await api.put('/auth/change-password', { currentPassword, newPassword });
  return res.data;
};
