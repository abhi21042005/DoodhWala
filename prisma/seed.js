const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('seeding database...');

  // clear existing data
  await prisma.walletTransaction.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.pause.deleteMany();
  await prisma.planDay.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.milkProduct.deleteMany();
  await prisma.user.deleteMany();

  // milk products - realistic punjab prices
  const desiCow = await prisma.milkProduct.create({
    data: {
      name: 'Desi Cow Milk',
      pricePerLitre: 62,
      active: true,
    },
  });

  const a2Gir = await prisma.milkProduct.create({
    data: {
      name: 'A2 Gir Cow Milk',
      pricePerLitre: 85,
      active: true,
    },
  });

  const adminHash = await bcrypt.hash('admin1234', 10);
  const customerHash = await bcrypt.hash('demo1234', 10);

  // admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Harjit Sandhu',
      phone: '9876500000',
      email: 'harjit@doodhwala.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      area: 'Fatehgarh Sahib',
      address: 'Gurdwara Road, near Main Chowk, Fatehgarh Sahib',
      walletBalance: 0,
    },
  });

  // customer users
  const gurpreet = await prisma.user.create({
    data: {
      name: 'Gurpreet Singh',
      phone: '9876500001',
      email: 'gurpreet@gmail.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      area: 'Mandi Gobindgarh',
      address: 'House 45, Mohalla Guru Nanak, Mandi Gobindgarh',
      walletBalance: 2500,
    },
  });

  const simran = await prisma.user.create({
    data: {
      name: 'Simran Kaur',
      phone: '9876500002',
      email: 'simran.kaur@gmail.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      area: 'Amloh',
      address: '12-B, Prem Nagar, Amloh',
      walletBalance: 1800,
    },
  });

  const rajveer = await prisma.user.create({
    data: {
      name: 'Rajveer Dhillon',
      phone: '9876500003',
      email: 'rajveer.dhillon@gmail.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      area: 'Fatehgarh Sahib',
      address: 'Street 7, Bassi Pathana Road, Fatehgarh Sahib',
      walletBalance: 500,
    },
  });

  const manpreet = await prisma.user.create({
    data: {
      name: 'Manpreet Brar',
      phone: '9876500004',
      email: 'manpreet.brar@yahoo.com',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      area: 'Mandi Gobindgarh',
      address: 'Flat 3, above Punjab Cloth House, GT Road, Mandi Gobindgarh',
      walletBalance: 3200,
    },
  });

  // subscriptions and plan days for gurpreet (desi cow)
  const gurpreetSub = await prisma.subscription.create({
    data: {
      userId: gurpreet.id,
      productId: desiCow.id,
      status: 'ACTIVE',
    },
  });

  // gurpreet wants 1L mon-fri, 2L on weekends
  const gurpreetDays = [1, 1, 1, 1, 1, 2, 2];
  for (let i = 0; i < 7; i++) {
    await prisma.planDay.create({
      data: {
        subscriptionId: gurpreetSub.id,
        weekday: i,
        litres: gurpreetDays[i],
      },
    });
  }

  // simran subscribes to a2 gir
  const simranSub = await prisma.subscription.create({
    data: {
      userId: simran.id,
      productId: a2Gir.id,
      status: 'ACTIVE',
    },
  });

  const simranDays = [0.5, 0.5, 0.5, 0.5, 0.5, 1, 1];
  for (let i = 0; i < 7; i++) {
    await prisma.planDay.create({
      data: {
        subscriptionId: simranSub.id,
        weekday: i,
        litres: simranDays[i],
      },
    });
  }

  // rajveer subscribes to desi cow
  const rajveerSub = await prisma.subscription.create({
    data: {
      userId: rajveer.id,
      productId: desiCow.id,
      status: 'ACTIVE',
    },
  });

  const rajveerDays = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5];
  for (let i = 0; i < 7; i++) {
    await prisma.planDay.create({
      data: {
        subscriptionId: rajveerSub.id,
        weekday: i,
        litres: rajveerDays[i],
      },
    });
  }

  // manpreet subscribes to a2 gir
  const manpreetSub = await prisma.subscription.create({
    data: {
      userId: manpreet.id,
      productId: a2Gir.id,
      status: 'ACTIVE',
    },
  });

  const manpreetDays = [1, 1, 1, 1, 1, 0, 0];
  for (let i = 0; i < 7; i++) {
    await prisma.planDay.create({
      data: {
        subscriptionId: manpreetSub.id,
        weekday: i,
        litres: manpreetDays[i],
      },
    });
  }

  // add wallet transactions for gurpreet (initial topup)
  await prisma.walletTransaction.create({
    data: {
      userId: gurpreet.id,
      type: 'CREDIT',
      amount: 3000,
      balanceAfter: 3000,
      description: 'Initial wallet top-up',
    },
  });
  await prisma.walletTransaction.create({
    data: {
      userId: gurpreet.id,
      type: 'DEBIT',
      amount: 500,
      balanceAfter: 2500,
      description: 'Milk delivery - 5 days',
    },
  });

  // wallet transactions for simran
  await prisma.walletTransaction.create({
    data: {
      userId: simran.id,
      type: 'CREDIT',
      amount: 2000,
      balanceAfter: 2000,
      description: 'Wallet top-up',
    },
  });
  await prisma.walletTransaction.create({
    data: {
      userId: simran.id,
      type: 'DEBIT',
      amount: 200,
      balanceAfter: 1800,
      description: 'Milk delivery - 3 days',
    },
  });

  // wallet for rajveer
  await prisma.walletTransaction.create({
    data: {
      userId: rajveer.id,
      type: 'CREDIT',
      amount: 500,
      balanceAfter: 500,
      description: 'Wallet top-up',
    },
  });

  // wallet for manpreet
  await prisma.walletTransaction.create({
    data: {
      userId: manpreet.id,
      type: 'CREDIT',
      amount: 3200,
      balanceAfter: 3200,
      description: 'Wallet top-up via UPI',
    },
  });

  console.log('seed complete!');
  console.log('');
  console.log('test logins:');
  console.log('  customer: phone 9876500001 / password demo1234');
  console.log('  admin:    phone 9876500000 / password admin1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
