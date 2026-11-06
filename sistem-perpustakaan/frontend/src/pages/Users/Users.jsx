import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', role: 'librarian' });
  const [formLoading, setFormLoading] = useState(false);
  const { addNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      if (res.success) setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditData(null);
    setForm({ username: '', email: '', password: '', full_name: '', role: 'librarian' });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditData(u);
    setForm({ username: u.username, email: u.email, password: '', full_name: u.full_name, role: u.role, is_active: u.is_active });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editData) {
        const payload = { email: form.email, full_name: form.full_name, role: form.role, is_active: form.is_active };
        if (form.password) payload.password = form.password;
        await updateUser(editData.id, payload);
        addNotification('User berhasil diperbarui', 'success');
      } else {
        await createUser(form);
        addNotification('User berhasil ditambahkan', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      addNotification('User berhasil dihapus', 'success');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'full_name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
    { key: 'is_active', label: 'Status', render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {r.is_active ? 'Aktif' : 'Nonaktif'}
      </span>
    )},
    { key: 'actions', label: 'Aksi', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"><Edit size={16} /></button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pengguna</h1>
        <Button onClick={openCreate}><Plus size={18} className="mr-1" /> Tambah User</Button>
      </div>

      <div className="card">
        <DataTable columns={columns} data={users} loading={loading} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit User' : 'Tambah User'}>
        <form onSubmit={handleSubmit}>
          {!editData && (
            <Input label="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          )}
          <Input label="Nama Lengkap *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label={editData ? 'Password (kosongkan jika tidak diubah)' : 'Password *'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editData} />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'librarian', label: 'Pustakawan' }
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={formLoading}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Yakin ingin menghapus user ini?" />
    </div>
  );
};

export default Users;
