const generateTransactionId = () => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  const ms = Date.now().toString().slice(-5);
  return `TXN-${ymd}-${ms}${rand}`;
};

module.exports = generateTransactionId;
