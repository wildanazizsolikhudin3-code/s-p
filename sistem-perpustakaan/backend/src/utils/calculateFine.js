/**
 * Calculate fine based on overdue days
 * @param {Date|string} dueDate 
 * @param {Date|string} returnDate 
 * @param {number} finePerDay - default from settings
 * @returns {number}
 */
const calculateFine = (dueDate, returnDate = new Date(), finePerDay = 1000) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  
  // Reset time part
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);
  
  const diffTime = returned - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 0;
  return diffDays * finePerDay;
};

module.exports = { calculateFine };
