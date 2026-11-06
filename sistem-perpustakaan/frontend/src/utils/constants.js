export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian'
};

export const LOAN_STATUS = {
  ACTIVE: 'active',
  RETURNED: 'returned',
  OVERDUE: 'overdue'
};

export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};
