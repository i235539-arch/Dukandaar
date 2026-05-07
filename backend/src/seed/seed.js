require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Property = require('../models/Property');
const Category = require('../models/Category');

const seedAdminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@dukandaar.com';
const seedAdminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin@12345';
const seedAdminName = process.env.ADMIN_SEED_NAME || 'Platform Admin';

const expenseCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];
const transactionCategories = ['Investment', 'Dividend', 'Top-up', 'P2P Transfer', 'Withdrawal'];
const propertyCategories = ['Shop', 'Office', 'Plaza', 'Mall', 'Warehouse', 'Apartment'];

const ensureUser = async ({ name, email, password, role = 'user', city = 'Karachi', occupation = '' }) => {
  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, passwordHash, role, status: 'active', city, occupation });
    await Wallet.create({ userId: user._id, balance: role === 'user' ? 250000 : 0, currency: 'PKR' });
    console.log(`Created ${role}: ${email}`);
  }
  return user;
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

const ensureProperties = async (admin) => {
  const count = await Property.countDocuments({});
  if (count > 0) return;

  const samples = [
    {
      title: 'Gulberg Heights Retail Shop #12',
      propertyType: 'shop',
      city: 'Lahore',
      address: 'Block C, Gulberg III, Lahore',
      description: 'Prime ground-floor retail shop with steady foot traffic. Long-term tenant in place.',
      coverImage: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=1200',
      totalValue: 6000000,
      totalShares: 1200,
      pricePerShare: 5000,
      sharesAvailable: 1200,
      minSharesPerInvestor: 1,
      expectedAnnualYield: 9.5,
      monthlyRent: 47500,
      occupancyRate: 100,
      status: 'open',
      isVerified: true,
      spvName: 'Dukandaar SPV - GH-12',
      createdBy: admin._id,
    },
    {
      title: 'I-9 Industrial Warehouse Unit 4',
      propertyType: 'warehouse',
      city: 'Islamabad',
      address: 'I-9 Industrial Area, Islamabad',
      description: 'Logistics warehouse leased to a national e-commerce operator on a 5-year contract.',
      coverImage: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200',
      totalValue: 12000000,
      totalShares: 2400,
      pricePerShare: 5000,
      sharesAvailable: 2400,
      minSharesPerInvestor: 1,
      expectedAnnualYield: 11,
      monthlyRent: 110000,
      occupancyRate: 100,
      status: 'open',
      isVerified: true,
      spvName: 'Dukandaar SPV - IND-9-4',
      createdBy: admin._id,
    },
    {
      title: 'Clifton Block 4 Co-working Office',
      propertyType: 'office',
      city: 'Karachi',
      address: 'Clifton Block 4, Karachi',
      description: 'Modern co-working office floor with multiple SME tenants. Diversified rental income.',
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
      totalValue: 9000000,
      totalShares: 1800,
      pricePerShare: 5000,
      sharesAvailable: 1800,
      minSharesPerInvestor: 2,
      expectedAnnualYield: 10,
      monthlyRent: 75000,
      occupancyRate: 92,
      status: 'open',
      isVerified: true,
      spvName: 'Dukandaar SPV - CB4-CO',
      createdBy: admin._id,
    },
    {
      title: 'Saddar Plaza Food Court Stall',
      propertyType: 'plaza',
      city: 'Rawalpindi',
      address: 'Saddar Plaza, Rawalpindi',
      description: 'Food court stall in a high-traffic shopping plaza near Saddar bazaar.',
      coverImage: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1200',
      totalValue: 3000000,
      totalShares: 600,
      pricePerShare: 5000,
      sharesAvailable: 600,
      minSharesPerInvestor: 1,
      expectedAnnualYield: 8.5,
      monthlyRent: 21000,
      occupancyRate: 100,
      status: 'open',
      isVerified: true,
      spvName: 'Dukandaar SPV - SP-FC',
      createdBy: admin._id,
    },
    {
      title: 'DHA Phase 6 Boutique Showroom',
      propertyType: 'shop',
      city: 'Lahore',
      address: 'DHA Phase 6, Lahore',
      description: 'Boutique fashion showroom on a high-end commercial street.',
      coverImage: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200',
      totalValue: 8000000,
      totalShares: 1600,
      pricePerShare: 5000,
      sharesAvailable: 1600,
      minSharesPerInvestor: 1,
      expectedAnnualYield: 9,
      monthlyRent: 60000,
      occupancyRate: 100,
      status: 'open',
      isVerified: true,
      spvName: 'Dukandaar SPV - DHA6-BS',
      createdBy: admin._id,
    },
  ];

  await Property.insertMany(samples);
  console.log(`Seeded ${samples.length} properties`);
};

const run = async () => {
  await connectDB();
  const admin = await ensureUser({
    name: seedAdminName,
    email: seedAdminEmail,
    password: seedAdminPassword,
    role: 'admin',
  });
  await ensureUser({
    name: 'Ali Khan',
    email: 'ali@example.com',
    password: 'User@12345',
    role: 'user',
    city: 'Karachi',
    occupation: 'Software Engineer',
  });
  await ensureUser({
    name: 'Sara Ahmed',
    email: 'sara@example.com',
    password: 'User@12345',
    role: 'user',
    city: 'Lahore',
    occupation: 'Banker',
  });
  await ensureCategories(admin);
  await ensureProperties(admin);
  console.log('\nSeed complete.');
  console.log(`Admin login: ${seedAdminEmail} / ${seedAdminPassword}`);
  console.log('User logins: ali@example.com / User@12345  •  sara@example.com / User@12345');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
