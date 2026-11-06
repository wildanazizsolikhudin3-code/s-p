import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = 'Cari...' }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  );
};

export default SearchInput;
