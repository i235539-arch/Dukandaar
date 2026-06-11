require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Property = require('../models/Property');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const generateTransactionId = require('../utils/transactionId');

const seedAdminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@dukandaar.com';
const seedAdminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';
const seedAdminName = process.env.ADMIN_SEED_NAME || 'Platform Admin';

const expenseCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];
const transactionCategories = ['Investment', 'Dividend', 'Top-up', 'P2P Transfer', 'Withdrawal'];
const propertyCategories = ['Shop', 'Office', 'Plaza', 'Mall', 'Warehouse', 'Apartment'];

const STARTING_BALANCE = 250000;

const ensureUser = async ({ name, email, password, role = 'user', city = 'Karachi', occupation = '', phone = '' }) => {
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, passwordHash, role, status: 'active', city, occupation, phone });
    console.log(`Created ${role}: ${email}`);
  }
  let wallet = await Wallet.findOne({ userId: user._id });
  if (!wallet) {
    const startBalance = role === 'user' ? STARTING_BALANCE : 0;
    wallet = await Wallet.create({
      userId: user._id,
      balance: startBalance,
      currency: 'PKR',
      totalDeposits: startBalance,
    });
    if (startBalance > 0) {
      await Transaction.create({
        transactionId: generateTransactionId(),
        senderId: null,
        receiverId: user._id,
        amount: startBalance,
        type: 'deposit',
        status: 'successful',
        category: 'Top-up',
        description: 'Initial demo balance (seed)',
      });
    }
    await Notification.create({
      userId: user._id,
      title: 'Welcome to Dukandaar DAO',
      message: 'Your wallet has been pre-loaded with PKR 250,000 of demo funds. Start investing in properties!',
      type: 'account',
    });
  }
  return { user, wallet };
};

const ensureCategories = async (admin) => {
  const all = [
    ...expenseCategories.map((n) => ({ name: n, type: 'expense' })),
    ...transactionCategories.map((n) => ({ name: n, type: 'transaction' })),
    ...propertyCategories.map((n) => ({ name: n, type: 'property' })),
  ];
  for (const c of all) {
    const exists = await Category.findOne({ name: c.name, type: c.type });
    if (!exists) {
      await Category.create({ ...c, createdBy: admin._id, isActive: true });
    }
  }
  console.log('Categories seeded');
};

const sampleProperties = (adminId) => [
  {
    title: 'Gulberg Heights Retail Shop #12',
    propertyType: 'shop',
    city: 'Lahore',
    address: 'Block C, Gulberg III, Lahore',
    description: 'Prime ground-floor retail shop with steady foot traffic. Long-term tenant in place.',
    coverImage: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=1200',
    totalValue: 6000000, totalShares: 1200, pricePerShare: 5000, sharesAvailable: 1200,
    minSharesPerInvestor: 1, expectedAnnualYield: 9.5, monthlyRent: 47500, occupancyRate: 100,
    status: 'open', isVerified: true, spvName: 'Dukandaar SPV - GH-12', createdBy: adminId,
  },
  {
    title: 'I-9 Industrial Warehouse Unit 4',
    propertyType: 'warehouse',
    city: 'Islamabad',
    address: 'I-9 Industrial Area, Islamabad',
    description: 'Logistics warehouse leased to a national e-commerce operator on a 5-year contract.',
    coverImage: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200',
    totalValue: 12000000, totalShares: 2400, pricePerShare: 5000, sharesAvailable: 2400,
    minSharesPerInvestor: 1, expectedAnnualYield: 11, monthlyRent: 110000, occupancyRate: 100,
    status: 'open', isVerified: true, spvName: 'Dukandaar SPV - IND-9-4', createdBy: adminId,
  },
  {
    title: 'Clifton Block 4 Co-working Office',
    propertyType: 'office',
    city: 'Karachi',
    address: 'Clifton Block 4, Karachi',
    description: 'Modern co-working office floor with multiple SME tenants. Diversified rental income.',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    totalValue: 9000000, totalShares: 1800, pricePerShare: 5000, sharesAvailable: 1800,
    minSharesPerInvestor: 2, expectedAnnualYield: 10, monthlyRent: 75000, occupancyRate: 92,
    status: 'open', isVerified: true, spvName: 'Dukandaar SPV - CB4-CO', createdBy: adminId,
  },
  {
    title: 'Saddar Plaza Food Court Stall',
    propertyType: 'plaza',
    city: 'Rawalpindi',
    address: 'Saddar Plaza, Rawalpindi',
    description: 'Food court stall in a high-traffic shopping plaza near Saddar bazaar.',
    coverImage: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1200',
    totalValue: 3000000, totalShares: 600, pricePerShare: 5000, sharesAvailable: 600,
    minSharesPerInvestor: 1, expectedAnnualYield: 8.5, monthlyRent: 21000, occupancyRate: 100,
    status: 'open', isVerified: true, spvName: 'Dukandaar SPV - SP-FC', createdBy: adminId,
  },
  {
    title: 'DHA Phase 6 Boutique Showroom',
    propertyType: 'shop',
    city: 'Lahore',
    address: 'DHA Phase 6, Lahore',
    description: 'Boutique fashion showroom on a high-end commercial street.',
    coverImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200',
    totalValue: 8000000, totalShares: 1600, pricePerShare: 5000, sharesAvailable: 1600,
    minSharesPerInvestor: 1, expectedAnnualYield: 9, monthlyRent: 60000, occupancyRate: 100,
    status: 'open', isVerified: true, spvName: 'Dukandaar SPV - DHA6-BS', createdBy: adminId,
  },
];

const ensureProperties = async (admin) => {
  if ((await Property.countDocuments({})) > 0) return;
  await Property.insertMany(sampleProperties(admin._id));
  console.log('Seeded 5 properties');
};

const ensureSampleExpensesAndBudget = async (user) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const month = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

  const existingExpense = await Expense.findOne({ userId: user._id });
  if (!existingExpense) {
    const samples = [
      { title: 'Lunch at Kababjees', amount: 850, category: 'Food', date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 3) },
      { title: 'Careem to office',  amount: 420, category: 'Transport', date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 5) },
      { title: 'K-Electric bill',   amount: 6800, category: 'Utilities', date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 7) },
      { title: 'Netflix',            amount: 1100, category: 'Entertainment', date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 10) },
      { title: 'Groceries',         amount: 4500, category: 'Food', date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 12) },
      { title: 'Coursera course',   amount: 3200, category: 'Education', date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 15) },
    ];
    await Expense.insertMany(samples.map((s) => ({ ...s, userId: user._id, paymentMethod: 'Wallet' })));
    console.log(`Sample expenses created for ${user.email}`);
  }

  const existingBudget = await Budget.findOne({ userId: user._id, month });
  if (!existingBudget) {
    const totalLimit = 30000;
    const expenses = await Expense.find({ userId: user._id });
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const ratio = (spent / totalLimit) * 100;
    const status = ratio >= 100 ? 'exceeded' : ratio >= 80 ? 'nearLimit' : 'safe';
    await Budget.create({
      userId: user._id,
      month,
      totalLimit,
      categoryLimits: [
        { category: 'Food', limit: 8000 },
        { category: 'Transport', limit: 3000 },
        { category: 'Utilities', limit: 10000 },
        { category: 'Entertainment', limit: 2000 },
      ],
      spentAmount: spent,
      status,
      warningThreshold: 80,
    });
    console.log(`Sample budget created for ${user.email}`);
  }
};

const run = async () => {
  await connectDB();
  const { user: admin } = await ensureUser({
    name: seedAdminName,
    email: seedAdminEmail,
    password: seedAdminPassword,
    role: 'admin',
  });
  const { user: ali } = await ensureUser({
    name: 'Ali Khan', email: 'ali@example.com', password: 'User@12345',
    role: 'user', city: 'Karachi', occupation: 'Software Engineer', phone: '0300-1234567',
  });
  const { user: sara } = await ensureUser({
    name: 'Sara Ahmed', email: 'sara@example.com', password: 'User@12345',
    role: 'user', city: 'Lahore', occupation: 'Banker', phone: '0321-7654321',
  });
  await ensureCategories(admin);
  await ensureProperties(admin);
  await ensureSampleExpensesAndBudget(ali);
  await ensureSampleExpensesAndBudget(sara);

  console.log('\nSeed complete.');
  console.log(`Admin login: ${seedAdminEmail} / ${seedAdminPassword}`);
  console.log('User logins: ali@example.com / User@12345  •  sara@example.com / User@12345');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
