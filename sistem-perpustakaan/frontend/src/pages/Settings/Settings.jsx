import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/settingService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.success) setSettings(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      addNotification('Hanya admin yang dapat mengubah pengaturan', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateSettings(settings);
      addNotification('Pengaturan berhasil disimpan', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

      <div className="card p-6 max-w-xl">
        <form onSubmit={handleSave}>
          <Input
            label="Nama Perpustakaan"
            value={settings.library_name || ''}
            onChange={(e) => setSettings({ ...settings, library_name: e.target.value })}
          />
          <Input
            label="Maksimal Hari Peminjaman"
            type="number"
            value={settings.max_loan_days || ''}
            onChange={(e) => setSettings({ ...settings, max_loan_days: e.target.value })}
          />
          <Input
            label="Denda per Hari (Rp)"
            type="number"
            value={settings.fine_per_day || ''}
            onChange={(e) => setSettings({ ...settings, fine_per_day: e.target.value })}
          />
          <Input
            label="Maksimal Buku per Peminjaman"
            type="number"
            value={settings.max_books_per_loan || ''}
            onChange={(e) => setSettings({ ...settings, max_books_per_loan: e.target.value })}
          />
          <Input
            label="Maksimal Peminjaman Aktif per Anggota"
            type="number"
            value={settings.max_active_loans || ''}
            onChange={(e) => setSettings({ ...settings, max_active_loans: e.target.value })}
          />

          {user?.role === 'admin' && (
            <Button type="submit" loading={saving}>Simpan Pengaturan</Button>
          )}
          {user?.role !== 'admin' && (
            <p className="text-sm text-gray-500">Hanya admin yang dapat mengubah pengaturan.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
