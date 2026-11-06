import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getLoan } from '../../services/loanService';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const LoanDetail = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoan(id)
      .then((res) => { if (res.success) setLoan(res.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!loan) return <p>Peminjaman tidak ditemukan</p>;

  return (
    <div>
      <Link to="/loans" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4">
        <ArrowLeft size={16} className="mr-1" /> Kembali
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">{loan.loan_code}</h1>
            <p className="text-gray-500 capitalize">{loan.status}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-gray-500">Anggota</p><p className="font-medium">{loan.member_name}</p></div>
          <div><p className="text-gray-500">Tgl Pinjam</p><p className="font-medium">{formatDate(loan.loan_date)}</p></div>
          <div><p className="text-gray-500">Jatuh Tempo</p><p className="font-medium">{formatDate(loan.due_date)}</p></div>
          <div><p className="text-gray-500">Diproses oleh</p><p className="font-medium">{loan.processed_by}</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Detail Buku</h3>
        <div className="space-y-3">
          {loan.details?.map((d) => (
            <div key={d.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-gray-500">{d.author} • Qty: {d.quantity}</p>
              </div>
              <div className="text-right text-sm">
                <p className="capitalize">{d.status}</p>
                {d.fine > 0 && <p className="text-red-600">{formatCurrency(d.fine)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanDetail;
