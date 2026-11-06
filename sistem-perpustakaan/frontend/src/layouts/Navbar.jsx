import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
      <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-primary-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
