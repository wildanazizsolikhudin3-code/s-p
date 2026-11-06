import { useState, useEffect } from 'react';
import { getBookReport, getMemberReport, getTransactionReport } from '../../services/reportService';
import DataTable from '../../components/common/DataTable';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const Reports = () => {
  const [tab, setTab] = useState('books');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let res;
        if (tab === 'books') res = await getBookReport();
        else if (tab === 'members') res = await getMemberReport();
        else res = await getTransactionReport();
        if (res.success) setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tab]);

  const tabs = [
    { key: 'books', label: 'Laporan Buku' },
    { key: 'members', label: 'Laporan Anggota' },
    { key: 'transactions', label: 'Laporan Transaksi' }
  ];

  const bookColumns = [
    { key: 'title', label: 'Judul' },
    { key: 'author', label: 'Penulis' },
    { key: 'category_name', label: 'Kategori' },
    { key: 'stock', label: 'Stok' },
    { key: 'total_loans', label: 'Total Dipinjam' }
  ];

  const memberColumns = [
    { key: 'member_code', label: 'Kode' },
    { key: 'full_name', label: 'Nama' },
    { key: 'total_loans', label: 'Total Pinjam' },
    { key: 'active_loans', label: 'Aktif' },
    { key: 'status', label: 'Status' }
  ];

  const transactionColumns = [
    { key: 'loan_code', label: 'Kode' },
    { key: 'member_name', label: 'Anggota' },
    { key: 'loan_date', label: 'Tgl Pinjam', render: (r) => formatDate(r.loan_date) },
    { key: 'status', label: 'Status' },
    { key: 'total_fine', label: 'Denda', render: (r) => formatCurrency(r.total_fine || 0) }
  ];

  const columns = tab === 'books' ? bookColumns : tab === 'members' ? memberColumns : transactionColumns;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Laporan</h1>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable columns={columns} data={data} loading={loading} />
      </div>
    </div>
  );
};

export default Reports;
