import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getMember } from '../../services/memberService';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';

const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMember(id)
      .then((res) => { if (res.success) setMember(res.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!member) return <p>Anggota tidak ditemukan</p>;

  return (
    <div>
      <Link to="/members" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4">
        <ArrowLeft size={16} className="mr-1" /> Kembali
      </Link>

      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{member.full_name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-500">Kode Anggota</p><p className="font-medium">{member.member_code}</p></div>
          <div><p className="text-gray-500">Email</p><p className="font-medium">{member.email || '-'}</p></div>
          <div><p className="text-gray-500">Telepon</p><p className="font-medium">{member.phone || '-'}</p></div>
          <div><p className="text-gray-500">Status</p><p className="font-medium capitalize">{member.status}</p></div>
          <div><p className="text-gray-500">Bergabung</p><p className="font-medium">{formatDate(member.join_date)}</p></div>
          <div><p className="text-gray-500">Alamat</p><p className="font-medium">{member.address || '-'}</p></div>
        </div>
      </div>

      {member.recent_loans?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Riwayat Peminjaman Terbaru</h3>
          <div className="space-y-2">
            {member.recent_loans.map((l) => (
              <div key={l.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <div>
                  <p className="font-medium">{l.loan_code}</p>
                  <p className="text-gray-500">{formatDate(l.loan_date)}</p>
                </div>
                <span className="capitalize">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetail;
