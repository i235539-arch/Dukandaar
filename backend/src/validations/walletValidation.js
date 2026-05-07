const positiveNumber = (n) => typeof n === 'number' && !isNaN(n) && n > 0;

const depositSchema = (body) => {
  const errors = [];
  const amount = Number(body.amount);
  if (!positiveNumber(amount)) errors.push('Amount must be a positive number');
  if (amount > 5_000_000) errors.push('Single deposit cannot exceed PKR 5,000,000');
  return errors;
};

const withdrawSchema = (body) => {
  const errors = [];
  const amount = Number(body.amount);
  if (!positiveNumber(amount)) errors.push('Amount must be a positive number');
  return errors;
};

const transferSchema = (body) => {
  const errors = [];
  const amount = Number(body.amount);
  if (!positiveNumber(amount)) errors.push('Amount must be a positive number');
  if (!body.receiverEmail || typeof body.receiverEmail !== 'string') errors.push('Receiver email is required');
  return errors;
};

module.exports = { depositSchema, withdrawSchema, transferSchema };
