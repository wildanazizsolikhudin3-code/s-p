import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { getBooks, deleteBook } from '../../services/bookService';
import { getCategories } from '../../services/categoryService';
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
import { createBook, updateBook } from '../../services/bookService';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', publisher: '', publication_year: '', category_id: '', stock: 1, description: '' });
  const [coverFile, setCoverFile] = useState(null);

  const debouncedSearch = useDebounce(search);
  const { addNotification } = useNotification();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getBooks({ page, limit: 10, search: debouncedSearch });
      if (res.success) {
        setBooks(res.data);
        setPagination(res.pagination);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, debouncedSearch]);

  useEffect(() => {
    getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const openCreate = () => {
    setEditData(null);
    setForm({ title: '', author: '', isbn: '', publisher: '', publication_year: '', category_id: '', stock: 1, description: '' });
    setCoverFile(null);
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditData(book);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publication_year: book.publication_year || '',
      category_id: book.category_id || '',
      stock: book.stock,
      description: book.description || ''
    });
    setCoverFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (coverFile) formData.append('cover_image', coverFile);

      if (editData) {
        await updateBook(editData.id, formData);
        addNotification('Buku berhasil diperbarui', 'success');
      } else {
        await createBook(formData);
        addNotification('Buku berhasil ditambahkan', 'success');
      }
      setModalOpen(false);
      fetchBooks();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menyimpan', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBook(deleteId);
      addNotification('Buku berhasil dihapus', 'success');
      setDeleteId(null);
      fetchBooks();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal menghapus', 'error');
    }
  };

  const columns = [
    { key: 'title', label: 'Judul', render: (r) => (
      <div>
        <p className="font-medium">{r.title}</p>
        <p className="text-xs text-gray-500">{r.author}</p>
      </div>
    )},
    { key: 'isbn', label: 'ISBN' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'stock', label: 'Stok', render: (r) => `${r.available}/${r.stock}` },
    { key: 'actions', label: 'Aksi', render: (r) => (
      <div className="flex gap-2">
        <Link to={`/books/${r.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
          <Eye size={16} />
        </Link>
        <button onClick={() => openEdit(r)} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded">
          <Edit size={16} />
        </button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
          <Trash2 size={16} />
        </button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manajemen Buku</h1>
        <Button onClick={openCreate}>
          <Plus size={18} className="mr-1" /> Tambah Buku
        </Button>
      </div>

      <div className="card">
        <div className="p-4 border-b">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari judul, penulis, atau ISBN..." />
        </div>
        <DataTable columns={columns} data={books} loading={loading} emptyMessage="Belum ada buku" />
        <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? 'Edit Buku' : 'Tambah Buku'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Judul *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input label="Penulis *" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
            <Input label="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            <Input label="Penerbit" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            <Input label="Tahun Terbit" type="number" value={form.publication_year} onChange={(e) => setForm({ ...form, publication_year: e.target.value })} />
            <Select
              label="Kategori"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input label="Stok *" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            <div className="mb-4">
              <label className="label">Cover Buku</label>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="input" />
            </div>
          </div>
          <div className="mb-4">
            <label className="label">Deskripsi</label>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={formLoading}>{editData ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Apakah Anda yakin ingin menghapus buku ini?"
      />
    </div>
  );
};

export default Books;
