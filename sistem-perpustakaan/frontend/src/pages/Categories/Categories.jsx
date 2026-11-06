import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const { addNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      if (res.success) setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditData(null);
    setForm({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditData(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editData) {
        await updateCategory(editData.id, form);
        addNotification('Kategori berhasil diperbarui', 'success');
      } else {
        await createCategory(form);
        addNotification('Kategori berhasil ditambahkan', 'success');
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
      await deleteCategory(deleteId);
      addNotification('Kategori berhasil dihapus', 'success');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'description', label: 'Deskripsi', render: (r) => r.description || '-' },
    { key: 'book_count', label: 'Jumlah Buku' },
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
        <h1 className="text-2xl font-bold">Kategori Buku</h1>
        <Button onClick={openCreate}><Plus size={18} className="mr-1" /> Tambah</Button>
      </div>

      <div className="card">
        <DataTable columns={columns} data={categories} loading={loading} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSubmit}>
          <Input label="Nama *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="mb-4">
            <label className="label">Deskripsi</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={formLoading}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Yakin ingin menghapus kategori ini?" />
    </div>
  );
};

export default Categories;
