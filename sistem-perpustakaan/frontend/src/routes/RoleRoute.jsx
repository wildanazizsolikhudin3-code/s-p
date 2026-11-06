import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
