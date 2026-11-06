import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { getLoans, createLoan } from '../../services/loanService';
import { getMembers } from '../../services/memberService';
import { getBooks } from '../../services/bookService';
import { useNotification } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';
import SearchInput from '../../components/common/SearchInput';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/formatDate';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ member_id: '', due_date: '', notes: '', books: [{ book_id: '', quantity: 1 }] });
  const [formLoading, setFormLoading] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { addNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getLoans({ page, limit: 10, search: debouncedSearch });
      if (res.success) {
        setLoans(res.data);
        setPagination(res.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, debouncedSearch]);

  const openCreate = async () => {
    const [mRes, bRes] = await Promise.all([
      getMembers({ limit: 100, status: 'active' }),
      getBooks({ limit: 100, available: 'true' })
    ]);
    if (mRes.success) setMembers(mRes.data);
    if (bRes.success) setBooks(bRes.data);
    setForm({ member_id: '', due_date: '', notes: '', books: [{ book_id: '', quantity: 1 }] });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        member_id: form.member_id,
        due_date: form.due_date || undefined,
        notes: form.notes,
        books: form.books.filter((b) => b.book_id).map((b) => ({
          book_id: parseInt(b.book_id),
          quantity: parseInt(b.quantity) || 1
        }))
      };
      await createLoan(payload);
      addNotification('Peminjaman berhasil dibuat', 'success');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal membuat peminjaman', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const statusBadge = {
    active: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700'
  };

  const columns = [
    { key: 'loan_code', label: 'Kode' },
    { key: 'member_name', label: 'Anggota', render: (r) => (
      <div><p className="font-medium">{r.member_name}</p><p className="text-xs text-gray-500">{r.member_code}</p></div>
    )},
    { key: 'loan_date', label: 'Tgl Pinjam', render: (r) => formatDate(r.loan_date) },
    { key: 'due_date', label: 'Jatuh Tempo', render: (r) => formatDate(r.due_date) },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[r.status]}`}>{r.status}</span>
    )},
    { key: 'actions', label: 'Aksi', render: (r) => (
      <Link to={`/loans/${r.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded inline-block"><Eye size={16} /></Link>
    )}
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Peminjaman</h1>
        <Button onClick={openCreate}><Plus size={18} className="mr-1" /> Buat Peminjaman</Button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari kode atau nama anggota..." />
        </div>
        <DataTable columns={columns} data={loans} loading={loading} />
        <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Buat Peminjaman" size="lg">
        <form onSubmit={handleSubmit}>
          <Select
            label="Anggota *"
            value={form.member_id}
            onChange={(e) => setForm({ ...form, member_id: e.target.value })}
            options={members.map((m) => ({ value: m.id, label: `${m.member_code} - ${m.full_name}` }))}
          />
          <Input label="Jatuh Tempo" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <div className="mb-4">
            <label className="label">Buku *</label>
            {form.books.map((b, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  className="input flex-1"
                  value={b.book_id}
                  onChange={(e) => {
                    const nb = [...form.books];
                    nb[idx].book_id = e.target.value;
                    setForm({ ...form, books: nb });
                  }}
                  required
                >
                  <option value="">Pilih buku</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>{book.title} (tersedia: {book.available})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="input w-20"
                  value={b.quantity}
                  onChange={(e) => {
                    const nb = [...form.books];
                    nb[idx].quantity = e.target.value;
                    setForm({ ...form, books: nb });
                  }}
                />
              </div>
            ))}
            <button type="button" className="text-sm text-primary-600" onClick={() => setForm({ ...form, books: [...form.books, { book_id: '', quantity: 1 }] })}>
              + Tambah buku
            </button>
          </div>
          <div className="mb-4">
            <label className="label">Catatan</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={formLoading}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Loans;
