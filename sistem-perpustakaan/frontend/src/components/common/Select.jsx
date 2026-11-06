const Select = ({ label, error, options = [], placeholder = 'Pilih...', className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'border-red-500' : ''} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
