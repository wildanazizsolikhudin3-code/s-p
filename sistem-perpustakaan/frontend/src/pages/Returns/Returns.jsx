import { useState, useEffect } from 'react';
import { getPendingReturns, processReturn } from '../../services/returnService';
import { getLoan } from '../../services/loanService';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const Returns = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const { addNotification } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPendingReturns();
      if (res.success) setLoans(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openReturn = async (loan) => {
    const res = await getLoan(loan.id);
    if (res.success) {
      setSelected(res.data);
      setDetails(res.data.details?.filter((d) => d.status === 'borrowed') || []);
    }
  };

  const handleReturn = async () => {
    setFormLoading(true);
    try {
      const res = await processReturn({
        loan_id: selected.id,
        details: details.map((d) => ({ loan_detail_id: d.id }))
      });
      if (res.success) {
        addNotification(
          res.data.total_fine > 0
            ? `Pengembalian berhasil. Total denda: ${formatCurrency(res.data.total_fine)}`
            : 'Pengembalian berhasil',
          'success'
        );
        setSelected(null);
        fetchData();
      }
    } catch (err) {
      addNotification(err.response?.data?.message || 'Gagal memproses', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: 'loan_code', label: 'Kode' },
    { key: 'member_name', label: 'Anggota', render: (r) => (
      <div><p className="font-medium">{r.member_name}</p><p className="text-xs text-gray-500">{r.member_code}</p></div>
    )},
    { key: 'due_date', label: 'Jatuh Tempo', render: (r) => formatDate(r.due_date) },
    { key: 'pending_books', label: 'Buku' },
    { key: 'actions', label: 'Aksi', render: (r) => (
      <Button size="sm" onClick={() => openReturn(r)}>Proses</Button>
    )}
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pengembalian Buku</h1>

      <div className="card">
        <DataTable columns={columns} data={loans} loading={loading} emptyMessage="Tidak ada peminjaman aktif" />
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Pengembalian - ${selected?.loan_code}`} size="lg">
        {selected && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Anggota: <strong>{selected.member_name}</strong> • Jatuh tempo: {formatDate(selected.due_date)}
            </p>
            <div className="space-y-2 mb-6">
              {details.map((d) => (
                <div key={d.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-sm text-gray-500">Qty: {d.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelected(null)}>Batal</Button>
              <Button variant="success" onClick={handleReturn} loading={formLoading}>
                Konfirmasi Pengembalian
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Returns;
