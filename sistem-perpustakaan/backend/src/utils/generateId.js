const generateLoanCode = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LN${year}${month}${day}${random}`;
};

const generateMemberCode = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `MBR${year}${random}`;
};

module.exports = { generateLoanCode, generateMemberCode };
