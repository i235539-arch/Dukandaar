const isEmail = (s) => /^\S+@\S+\.\S+$/.test(String(s || '').trim());

const registerSchema = (body) => {
  const errors = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('Name is required (min 2 characters)');
  if (!body.email || !isEmail(body.email)) errors.push('Valid email is required');
  if (!body.password || String(body.password).length < 6) errors.push('Password must be at least 6 characters');
  return errors;
};

const loginSchema = (body) => {
  const errors = [];
  if (!body.email || !isEmail(body.email)) errors.push('Valid email is required');
  if (!body.password) errors.push('Password is required');
  return errors;
};

const changePasswordSchema = (body) => {
  const errors = [];
  if (!body.currentPassword) errors.push('Current password is required');
  if (!body.newPassword || String(body.newPassword).length < 6) errors.push('New password must be at least 6 characters');
  return errors;
};

module.exports = { registerSchema, loginSchema, changePasswordSchema };
