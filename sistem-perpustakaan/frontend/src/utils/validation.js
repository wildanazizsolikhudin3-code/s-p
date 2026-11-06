export const required = (value) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return 'Field ini wajib diisi';
  }
  return null;
};

export const email = (value) => {
  if (!value) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Format email tidak valid';
  return null;
};

export const minLength = (min) => (value) => {
  if (value && value.length < min) return `Minimal ${min} karakter`;
  return null;
};
