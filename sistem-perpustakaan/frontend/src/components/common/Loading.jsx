const Loading = ({ text = 'Memuat...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
};

export default Loading;
