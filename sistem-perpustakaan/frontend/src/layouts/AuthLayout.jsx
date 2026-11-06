import { Outlet } from 'react-router-dom';
import { Library } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Library className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Sistem Perpustakaan</h1>
          <p className="text-primary-200 mt-1">Manajemen perpustakaan digital</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
