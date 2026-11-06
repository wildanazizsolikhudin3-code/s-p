import api from './api';

export const getBooks = async (params = {}) => {
  const res = await api.get('/books', { params });
  return res.data;
};

export const getBook = async (id) => {
  const res = await api.get(`/books/${id}`);
  return res.data;
};

export const createBook = async (formData) => {
  const res = await api.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const updateBook = async (id, formData) => {
  const res = await api.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteBook = async (id) => {
  const res = await api.delete(`/books/${id}`);
  return res.data;
};
