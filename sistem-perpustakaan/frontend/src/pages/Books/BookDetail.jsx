import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getBook } from '../../services/bookService';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatDate';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBook(id)
      .then((res) => {
        if (res.success) setBook(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!book) return <p>Buku tidak ditemukan</p>;

  return (
    <div>
      <Link to="/books" className="inline-flex items-center text-sm text-primary-600 hover:underline mb-4">
        <ArrowLeft size={16} className="mr-1" /> Kembali
      </Link>

      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-40 h-56 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {book.cover_image ? (
              <img
                src={`http://localhost:5000/uploads/book-covers/${book.cover_image}`}
                alt={book.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="text-gray-300" size={48} />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
            <p className="text-gray-600 mb-4">oleh {book.author}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">ISBN</p>
                <p className="font-medium">{book.isbn || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Kategori</p>
                <p className="font-medium">{book.category_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Penerbit</p>
                <p className="font-medium">{book.publisher || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Tahun Terbit</p>
                <p className="font-medium">{book.publication_year || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Stok</p>
                <p className="font-medium">{book.available} / {book.stock}</p>
              </div>
              <div>
                <p className="text-gray-500">Ditambahkan</p>
                <p className="font-medium">{formatDate(book.created_at)}</p>
              </div>
            </div>

            {book.description && (
              <div className="mt-6">
                <p className="text-gray-500 text-sm mb-1">Deskripsi</p>
                <p className="text-gray-700">{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
