import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { getMembers, createMember, updateMember, deleteMember } from '../../services/memberService';
import { useNotification } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';
import SearchInput from '../../components/common/SearchInput';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatDate';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '', status: 'active' });
  const [formLoading, setFormLoading] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { addNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMembers({ page, limit: 10, search: debouncedSearch });
      if (res.success) {
        setMembers(res.data);
        setPagination(res.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, debouncedSearch]);

  const openCreate = () => {
    setEditData(null);
    setForm({ full_name: '', email: '', phone: '', address: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditData(m);
    setForm({ full_name: m.full_name, email: m.email || '', phone: m.phone || '', address: m.address || '', status: m.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editData) {
        await updateMember(editData.id, form);
        addNotification('Anggota berhasil diperbarui', 'success');
      } else {
        await createMember(form);
        addNotification('Anggota berhasil ditambahkan', 'success');
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
      await deleteMember(deleteId);
      addNotification('Anggota berhasil dihapus', 'success');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  const statusBadge = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    suspended: 'bg-red-100 text-red-700'
  };

  const columns = [
    { key: 'member_code', label: 'Kode' },
    { key: 'full_name', label: 'Nama' },
    { key: 'phone', label: 'Telepon', render: (r) => r.phone || '-' },
    { key: 'join_date', label: 'Bergabung', render: (r) => formatDate(r.join_date) },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>{r.status}</span>
    )},
    { key: 'actions', label: 'Aksi', render: (r) => (
      <div className="flex gap-2">
        <Link to={`/members/${r.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye size={16} /></Link>
        <button onClick={() => openEdit(r)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"><Edit size={16} /></button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Anggota</h1>
        <Button onClick={openCreate}><Plus size={18} className="mr-1" /> Tambah Anggota</Button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, kode, email..." />
        </div>
        <DataTable columns={columns} data={members} loading={loading} />
        <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Anggota' : 'Tambah Anggota'}>
        <form onSubmit={handleSubmit}>
          <Input label="Nama Lengkap *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="mb-4">
            <label className="label">Alamat</label>
            <textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Tidak Aktif' },
              { value: 'suspended', label: 'Ditangguhkan' }
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={formLoading}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="Yakin ingin menghapus anggota ini?" />
    </div>
  );
};

export default Members;
