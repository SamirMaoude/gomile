import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function generateUniqueGomileCode(): Promise<string> {
  const year = new Date().getFullYear();
  while (true) {
    const suffix = randomBytes(3).toString('hex').toUpperCase();
    const code = `GM-${suffix}-${year}`;
    const existing = await prisma.driver.findUnique({
      where: { gomileCode: code },
    });
    if (!existing) return code;
  }
}

async function main() {
  console.log('🌱 Démarrage du seed de la base...');

  // Nettoyer les données existantes
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Order" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "WalletEntry" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Wallet" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "DriverDocument" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "KycSubmission" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Driver" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Handshake" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Store" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Merchant" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "MerchantApiKey" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');

  // ═══════════════════════════════════════════════════════════════
  // 1️⃣ CRÉER LES DRIVERS
  // ═══════════════════════════════════════════════════════════════

  const driverUsers = [
    {
      email: 'jean.dupont@example.com',
      phone: '+33612345678',
      firstName: 'Jean',
      lastName: 'Dupont',
      gender: 'MALE' as const,
      dateOfBirth: new Date('1990-05-15'),
      transportType: 'BIKE' as const,
    },
    {
      email: 'marie.martin@example.com',
      phone: '+33723456789',
      firstName: 'Marie',
      lastName: 'Martin',
      gender: 'FEMALE' as const,
      dateOfBirth: new Date('1995-08-22'),
      transportType: 'SCOOTER' as const,
    },
    {
      email: 'pierre.bernard@example.com',
      phone: '+33634567890',
      firstName: 'Pierre',
      lastName: 'Bernard',
      gender: 'MALE' as const,
      dateOfBirth: new Date('1988-03-10'),
      transportType: 'CAR' as const,
    },
    {
      email: 'sophie.laurent@example.com',
      phone: '+33745678901',
      firstName: 'Sophie',
      lastName: 'Laurent',
      gender: 'FEMALE' as const,
      dateOfBirth: new Date('1992-11-30'),
      transportType: 'TRUCK' as const,
    },
    {
      email: 'thomas.richard@example.com',
      phone: '+33656789012',
      firstName: 'Thomas',
      lastName: 'Richard',
      gender: 'MALE' as const,
      dateOfBirth: new Date('1998-07-17'),
      transportType: 'BIKE' as const,
    },
  ];

  const drivers: any[] = [];

  for (const driverData of driverUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: driverData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const user = await prisma.user.create({
        data: {
          email: driverData.email,
          phone: driverData.phone,
          password: hashedPassword,
          role: 'DRIVER',
          emailVerified: true,
          driver: {
            create: {
              firstName: driverData.firstName,
              lastName: driverData.lastName,
              gender: driverData.gender,
              dateOfBirth: driverData.dateOfBirth,
              address: `${randomInt(1, 200)} rue de la Paix, Grenoble`,
              city: 'Grenoble',
              zipCode: '38000',
              street: 'rue de la Paix',
              deliveryCity: 'Grenoble',
              deliveryRadius: randomInt(5, 25),
              transportType: driverData.transportType,
              activeVehicle: driverData.transportType,
              rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
              totalTrips: randomInt(5, 150),
              gomileCode: await generateUniqueGomileCode(),
              status: 'OFFLINE',
              lastKnownLatitude: 45.1885 + (Math.random() - 0.5) * 0.1,
              lastKnownLongitude: 5.7245 + (Math.random() - 0.5) * 0.1,
              wallet: {
                create: {
                  balance: parseFloat((Math.random() * 500).toFixed(2)),
                },
              },
              kycStatus: 'PENDING',
            },
          },
        },
        include: { driver: true },
      });
      if (user.driver) {
        drivers.push(user.driver);
      }
      console.log(`✅ Driver créé: ${driverData.firstName} ${driverData.lastName} (${driverData.transportType})`);
    } else {
      const existing = await prisma.driver.findUnique({
        where: { userId: existingUser.id },
      });
      if (existing) drivers.push(existing);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 2️⃣ CRÉER LES MERCHANTS ET STORES
  // ═══════════════════════════════════════════════════════════════

  const merchantData = [
    {
      email: 'monoprix.grenoble@example.com',
      name: 'Monoprix Grenoble Centre',
      stores: [
        {
          name: 'Monoprix - Centre Ville',
          address: '10 rue de la Paix, 38000 Grenoble',
          latitude: 45.1885,
          longitude: 5.7245,
          description: 'Supermarché généraliste en centre-ville',
        },
      ],
    },
    {
      email: 'pharmacie.lyon@example.com',
      name: 'Pharmacie de la République',
      stores: [
        {
          name: 'Pharmacie - Grenoble',
          address: '22 boulevard Clemenceau, 38000 Grenoble',
          latitude: 45.1920,
          longitude: 5.7290,
          description: 'Pharmacie avec livraison rapide',
        },
      ],
    },
    {
      email: 'zara.store@example.com',
      name: 'Zara - Grenoble',
      stores: [
        {
          name: 'Zara Centre Commercial',
          address: '5 avenue Alsace-Lorraine, 38000 Grenoble',
          latitude: 45.1850,
          longitude: 5.7200,
          description: 'Vêtements et accessoires',
        },
      ],
    },
  ];

  const merchants: any[] = [];

  for (const data of merchantData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('MerchantPass123!', 10);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: 'MERCHANT',
          emailVerified: true,
          merchant: {
            create: {
              name: data.name,
              store: {
                create: data.stores.map((store) => ({
                  name: store.name,
                  address: store.address,
                  latitude: store.latitude,
                  longitude: store.longitude,
                  description: store.description,
                  isActive: true,
                  provider: 'OTHER' as const,
                })),
              },
            },
          },
        },
        include: { merchant: { include: { store: true } } },
      });
      if (user.merchant) {
        merchants.push(user.merchant);
      }
      console.log(`✅ Merchant créé: ${data.name}`);
    } else {
      const existing = await prisma.merchant.findUnique({
        where: { userId: existingUser.id },
      });
      if (existing) merchants.push(existing);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 3️⃣ CRÉER LES ORDERS
  // ═══════════════════════════════════════════════════════════════

  const orderTypes = ['FOOD', 'PHARMACY', 'GROCERY', 'CLOTHING', 'DOCUMENTS'] as const;
  const packageSizes = ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'] as const;
  const orderStatuses = ['SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'] as const;

  const orders: any[] = [];

  for (const merchant of merchants) {
    const stores = await prisma.store.findMany({
      where: { merchantId: merchant.userId },
    });

    for (const store of stores) {
      for (let i = 0; i < randomInt(2, 5); i++) {
        const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const assignedDriver = status !== 'SEARCHING_DRIVER' && status !== 'CANCELLED' ? drivers[Math.floor(Math.random() * drivers.length)] : undefined;

        const order = await prisma.order.create({
          data: {
            merchantId: merchant.userId,
            storeId: store.id,
            driverId: assignedDriver?.userId,
            status: status as any,
            type: orderType as any,
            packageSize: packageSizes[Math.floor(Math.random() * packageSizes.length)] as any,
            weight: parseFloat((Math.random() * 10).toFixed(2)),
            deliveryFee: parseFloat((Math.random() * 15 + 5).toFixed(2)),
            reward: parseFloat((Math.random() * 12 + 3).toFixed(2)),
            distanceKm: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
            orderReference: `ORDER-${Date.now()}-${randomInt(1000, 9999)}`,
            customerName: ['Alice Dupont', 'Bob Martin', 'Claire Laurent', 'David Bernard'][Math.floor(Math.random() * 4)],
            customerPhone: `+3370${randomInt(10000000, 99999999)}`,
            dropOffAddress: `${randomInt(1, 200)} avenue Alsace-Lorraine, Grenoble`,
            acceptedAt: status !== 'SEARCHING_DRIVER' && status !== 'CANCELLED' ? new Date(Date.now() - randomInt(1000, 100000)) : undefined,
            pickedUpAt: ['PICKED_UP', 'DELIVERED'].includes(status) ? new Date(Date.now() - randomInt(1000, 50000)) : undefined,
            deliveredAt: status === 'DELIVERED' ? new Date(Date.now() - randomInt(1000, 10000)) : undefined,
            cancelledAt: status === 'CANCELLED' ? new Date(Date.now() - randomInt(1000, 100000)) : undefined,
          },
        });

        orders.push(order);
      }
    }
  }

  console.log(`✅ ${orders.length} orders créées`);

  // ═══════════════════════════════════════════════════════════════
  // 4️⃣ AJOUTER DES WALLET ENTRIES
  // ═══════════════════════════════════════════════════════════════

  for (const driver of drivers) {
    const wallet = await prisma.wallet.findUnique({
      where: { driverId: driver.userId },
    });

    if (wallet && randomInt(0, 1) === 1) {
      const entriesCount = randomInt(2, 8);
      for (let i = 0; i < entriesCount; i++) {
        const statuses = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;
        const types = ['CREDIT', 'DEBIT'] as const;

        await prisma.walletEntry.create({
          data: {
            walletId: wallet.id,
            type: types[Math.floor(Math.random() * types.length)],
            amount: parseFloat((Math.random() * 50 + 1).toFixed(2)),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            createdAt: new Date(Date.now() - randomInt(1000000, 10000000)),
          },
        });
      }
    }
  }

  console.log(`✅ Wallet entries créées`);

  // ═══════════════════════════════════════════════════════════════
  // 5️⃣ AJOUTER DES KYC SUBMISSIONS ET DRIVER DOCUMENTS
  // ═══════════════════════════════════════════════════════════════

  for (const driver of drivers) {
    if (randomInt(0, 1) === 1) {
      const kycStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;

      // Créer une KYC submission
      await prisma.kycSubmission.create({
        data: {
          driverId: driver.userId,
          status: kycStatuses[Math.floor(Math.random() * kycStatuses.length)],
          rejectionReason: Math.random() > 0.7 ? 'Document floue' : undefined,
        },
      });

      // Créer aussi des documents du driver
      const documentTypes = ['CNI', 'DRIVING_LICENSE', 'REGISTRATION_CARD', 'RIB'] as const;
      for (let i = 0; i < randomInt(1, 3); i++) {
        await prisma.driverDocument.create({
          data: {
            driverId: driver.userId,
            type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
            url: `https://example.com/doc-${randomBytes(4).toString('hex')}.jpg`,
            verified: Math.random() > 0.5,
            rejectionReason: Math.random() > 0.7 ? 'Document not clear' : undefined,
          },
        });
      }
    }
  }

  console.log(`✅ KYC submissions créées`);

  console.log('\n🎉 Seed terminé avec succès!');
  console.log(`   - ${drivers.length} drivers`);
  console.log(`   - ${merchants.length} merchants`);
  console.log(`   - ${orders.length} orders`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
