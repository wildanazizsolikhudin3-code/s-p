import api from './api';

export const getMembers = async (params = {}) => {
  const res = await api.get('/members', { params });
  return res.data;
};

export const getMember = async (id) => {
  const res = await api.get(`/members/${id}`);
  return res.data;
};

export const createMember = async (data) => {
  const res = await api.post('/members', data);
  return res.data;
};

export const updateMember = async (id, data) => {
  const res = await api.put(`/members/${id}`, data);
  return res.data;
};

export const deleteMember = async (id) => {
  const res = await api.delete(`/members/${id}`);
  return res.data;
};
