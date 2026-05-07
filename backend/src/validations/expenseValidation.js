const expenseSchema = (body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 2) errors.push('Title is required');
  const amount = Number(body.amount);
  if (isNaN(amount) || amount <= 0) errors.push('Amount must be greater than 0');
  if (!body.category || String(body.category).trim().length === 0) errors.push('Category is required');
  if (body.date && isNaN(Date.parse(body.date))) errors.push('Invalid date');
  return errors;
};

module.exports = { expenseSchema };
