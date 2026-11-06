import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, FolderOpen, ArrowLeftRight,
  RotateCcw, UserCog, FileText, Settings, Library
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/books', icon: BookOpen, label: 'Buku' },
    { to: '/categories', icon: FolderOpen, label: 'Kategori' },
    { to: '/members', icon: Users, label: 'Anggota' },
    { to: '/loans', icon: ArrowLeftRight, label: 'Peminjaman' },
    { to: '/returns', icon: RotateCcw, label: 'Pengembalian' },
    { to: '/reports', icon: FileText, label: 'Laporan' },
    ...(user?.role === 'admin' ? [{ to: '/users', icon: UserCog, label: 'Pengguna' }] : []),
    { to: '/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
            <Library className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Perpustakaan</h1>
            <p className="text-xs text-gray-500">Sistem Manajemen</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
