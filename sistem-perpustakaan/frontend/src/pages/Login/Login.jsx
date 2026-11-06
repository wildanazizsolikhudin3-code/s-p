import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      addNotification('Username dan password wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi(username, password);
      if (res.success) {
        login(res.data.token, res.data.user);
        addNotification('Login berhasil!', 'success');
        navigate('/');
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Login gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-6">Masuk ke Akun</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username / Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full" loading={loading}>
          Masuk
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Demo: admin / admin123
      </p>
    </div>
  );
};

export default Login;
