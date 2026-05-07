const allowedTypes = ['shop', 'office', 'plaza', 'mall', 'warehouse', 'apartment'];

const propertySchema = (body) => {
  const errors = [];
  if (!body.title || String(body.title).trim().length < 3) errors.push('Title required');
  if (!body.propertyType || !allowedTypes.includes(body.propertyType)) errors.push('Invalid propertyType');
  if (!body.city) errors.push('City required');
  if (!body.address) errors.push('Address required');

  const totalValue = Number(body.totalValue);
  const totalShares = Number(body.totalShares);
  const pricePerShare = Number(body.pricePerShare);
  const sharesAvailable = body.sharesAvailable !== undefined ? Number(body.sharesAvailable) : totalShares;

  if (isNaN(totalValue) || totalValue <= 0) errors.push('totalValue must be > 0');
  if (isNaN(totalShares) || totalShares <= 0) errors.push('totalShares must be > 0');
  if (isNaN(pricePerShare) || pricePerShare <= 0) errors.push('pricePerShare must be > 0');
  if (isNaN(sharesAvailable) || sharesAvailable < 0 || sharesAvailable > totalShares) {
    errors.push('sharesAvailable invalid');
  }

  if (body.expectedAnnualYield !== undefined) {
    const y = Number(body.expectedAnnualYield);
    if (isNaN(y) || y < 0) errors.push('expectedAnnualYield invalid');
  }

  return errors;
};

const investSchema = (body) => {
  const errors = [];
  const shares = Number(body.shares);
  if (isNaN(shares) || shares <= 0) errors.push('shares must be > 0');
  return errors;
};

module.exports = { propertySchema, investSchema };
