import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Books from '../pages/Books/Books';
import BookDetail from '../pages/Books/BookDetail';
import Categories from '../pages/Categories/Categories';
import Members from '../pages/Members/Members';
import MemberDetail from '../pages/Members/MemberDetail';
import Loans from '../pages/Loans/Loans';
import LoanDetail from '../pages/Loans/LoanDetail';
import Returns from '../pages/Returns/Returns';
import Users from '../pages/Users/Users';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/loans/:id" element={<LoanDetail />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
