import path from 'path';

import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { ProductOrder, OrderStatus, OrderType } from '../../../../apps/order/src/entity/product-order.entity';
import { Product, TransactionPurpose } from '../../../../apps/order/src/entity/product.entity';
import { User } from '../../../../apps/auth/src/entity/user.entity';

async function createOrderDataSource(): Promise<DataSource> {
  config({ path: path.resolve(__dirname, '../../../../apps/order/.env') });
  return new DataSource({
    type: 'mariadb',
    host: process.env.MARIADB_HOST,
    port: parseInt(process.env.MARIADB_PORT || '3306', 10),
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    entities: [Product, ProductOrder],
    synchronize: true,
  });
}

async function createAuthDataSource(): Promise<DataSource> {
  config({ path: path.resolve(__dirname, '../../../../apps/auth/.env'), override: true });
  return new DataSource({
    type: 'mariadb',
    host: process.env.MARIADB_HOST,
    port: parseInt(process.env.MARIADB_PORT || '3307', 10),
    username: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    entities: [User],
    synchronize: true,
  });
}

async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  if ((await userRepository.find()).length > 0) {
    // 현 구현사항에서 고정값이므로 최초 1회만 실행
    console.log('Users already seeded');
    return;
  }

  const users = [
    {
      username: 'user1',
      email: 'user1@example.com',
      name: '사용자1',
      password: await bcrypt.hash('password123', 10),
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      name: '사용자2',
      password: await bcrypt.hash('password456', 10),
    },
  ];

  await userRepository.insert(users);

  console.log('Users seeded successfully');
}

async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);

  if ((await productRepository.find()).length > 0) {
    // 현 구현사항에서 고정값이므로 최초 1회만 실행
    console.log('Products already seeded');
    return;
  }

  const products = [
    {
      name: '금',
      purity: 99.99,
      price: 80000000,
      stockAmount: 10,
      transactionPurpose: TransactionPurpose.FOR_SALE,
    },
    {
      name: '금',
      purity: 99.9,
      price: 1000000,
      stockAmount: 20,
      transactionPurpose: TransactionPurpose.FOR_PURCHASE,
    },
    {
      name: '금',
      purity: 99.9,
      price: 1000000,
      stockAmount: 20,
      transactionPurpose: TransactionPurpose.FOR_SALE,
    },
    {
      name: '금',
      purity: 99.9,
      price: 1000000,
      stockAmount: 20,
      transactionPurpose: TransactionPurpose.FOR_PURCHASE,
    },
  ];

  await productRepository.insert(products);

  console.log('Products seeded successfully');
}

async function seedProductOrders(orderDataSource: DataSource, authDataSource: DataSource) {
  const productOrderRepository = orderDataSource.getRepository(ProductOrder);
  const productRepository = orderDataSource.getRepository(Product);

  const userRepository = authDataSource.getRepository(User);

  const users = await userRepository.find();
  const products = await productRepository.find();

  const orders = [
    {
      orderNumber: 'ORD' + Date.now().toString().slice(-10),
      type: OrderType.BUY,
      userId: users[0].id,
      status: OrderStatus.ORDERED,
      product: products[0],
      quantity: 0.5,
      totalPrice: products[0].price * 0.5,
      shippingAddress: '서울시 강남구',
      shippingName: '홍길동',
      shippingPhone: '010-1234-5678',
      shippingMemo: '부재시 경비실에 맡겨주세요',
    },
    {
      orderNumber: 'ORD' + (Date.now() + 1).toString().slice(-10),
      type: OrderType.SELL,
      userId: users[1].id,
      status: OrderStatus.DEPOSITED,
      product: products[1],
      quantity: 1,
      totalPrice: products[1].price,
      shippingAddress: '부산시 해운대구',
      shippingName: '김철수',
      shippingPhone: '010-9876-5432',
      shippingMemo: '조심히 다뤄주세요',
    },
  ];

  await productOrderRepository.save(orders);

  console.log('ProductOrders seeded successfully');
}

export async function seedAll() {
  let orderDataSource: DataSource | null = null;

  let authDataSource: DataSource | null = null;

  try {
    orderDataSource = await createOrderDataSource();
    await orderDataSource.initialize();

    authDataSource = await createAuthDataSource();
    await authDataSource.initialize();

    await seedUsers(authDataSource);
    await seedProducts(orderDataSource);
    await seedProductOrders(orderDataSource, authDataSource);

    console.log('All seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    if (orderDataSource) {
      await orderDataSource.destroy();
    }

    if (authDataSource) {
      await authDataSource.destroy();
    }
  }
}

seedAll();
