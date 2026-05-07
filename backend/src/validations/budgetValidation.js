const budgetSchema = (body) => {
  const errors = [];
  if (!body.month || !/^\d{4}-\d{2}$/.test(String(body.month))) {
    errors.push('Month must be in YYYY-MM format');
  }
  const total = Number(body.totalLimit);
  if (isNaN(total) || total <= 0) errors.push('totalLimit must be greater than 0');

  if (body.categoryLimits && !Array.isArray(body.categoryLimits)) {
    errors.push('categoryLimits must be an array');
  }
  if (Array.isArray(body.categoryLimits)) {
    body.categoryLimits.forEach((c, i) => {
      if (!c.category || String(c.category).trim().length === 0) errors.push(`categoryLimits[${i}].category required`);
      const lim = Number(c.limit);
      if (isNaN(lim) || lim <= 0) errors.push(`categoryLimits[${i}].limit must be > 0`);
    });
  }

  if (body.warningThreshold !== undefined) {
    const t = Number(body.warningThreshold);
    if (isNaN(t) || t < 1 || t > 100) errors.push('warningThreshold must be between 1 and 100');
  }
  return errors;
};

module.exports = { budgetSchema };
