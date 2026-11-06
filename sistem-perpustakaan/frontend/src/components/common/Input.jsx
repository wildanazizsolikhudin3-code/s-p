const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <input className={`input ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
