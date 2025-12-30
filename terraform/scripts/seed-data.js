#!/usr/bin/env node
// ============================================================================
// EcoKart Seed Data Script - Generate Realistic Demo Data
// ============================================================================
// Purpose: Generate 30 days of realistic orders, customers, and update stock
//
// Features:
// - 30 days of order history (realistic distribution)
// - 50-150 orders with realistic revenue patterns
// - 30-50 customers with various registration dates
// - Updated product stock levels (mix of high/medium/low)
// - Weekday/weekend patterns (more sales on weekends)
// - Seasonal variations
// ============================================================================

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  BatchWriteCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';
const AWS_PROFILE = process.env.AWS_PROFILE || 'personal';
const TABLES = {
  orders: process.env.ORDERS_TABLE || 'ecokart-orders',
  customers: process.env.CUSTOMERS_TABLE || 'ecokart-users',
  products: process.env.PRODUCTS_TABLE || 'ecokart-products'
};

// Initialize DynamoDB Client
// Note: In CI/CD (GitHub Actions), AWS credentials are provided via OIDC
// In local development, use AWS_PROFILE
const isCI = process.env.CI || process.env.GITHUB_ACTIONS;
const clientConfig = {
  region: AWS_REGION,
  // Only use profile in local development (not in CI)
  ...(!isCI && AWS_PROFILE && { profile: AWS_PROFILE })
};

const client = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(client);

// ============================================================================
// Helper Functions
// ============================================================================

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Check if date is weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

// ============================================================================
// Product Data & Stock Management
// ============================================================================

const PRODUCT_STOCK_STRATEGY = {
  // High stock - popular items, well stocked
  high: { min: 50, max: 150, count: 15 },
  // Medium stock - regular items
  medium: { min: 20, max: 49, count: 10 },
  // Low stock - needs reordering soon
  low: { min: 5, max: 19, count: 4 },
  // Critical/Out of stock - alerts
  critical: { min: 0, max: 4, count: 2 }
};

async function getProducts() {
  console.log('📦 Fetching products from DynamoDB...');
  const result = await docClient.send(new ScanCommand({
    TableName: TABLES.products
  }));
  console.log(`✅ Found ${result.Items.length} products`);
  return result.Items;
}

async function updateProductStock(products) {
  console.log('\n📊 Updating product stock levels...');

  // Shuffle products for random distribution
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  let index = 0;

  for (const [level, config] of Object.entries(PRODUCT_STOCK_STRATEGY)) {
    const productsInLevel = shuffled.slice(index, index + config.count);

    for (const product of productsInLevel) {
      const newStock = getRandomInt(config.min, config.max);

      await docClient.send(new UpdateCommand({
        TableName: TABLES.products,
        Key: { id: product.id },
        UpdateExpression: 'SET stock = :stock',
        ExpressionAttributeValues: {
          ':stock': newStock
        }
      }));

      console.log(`  ${level.padEnd(8)} | ${product.name.substring(0, 30).padEnd(30)} | Stock: ${newStock}`);
    }

    index += config.count;
  }

  console.log(`✅ Updated stock for ${index} products\n`);
  return shuffled;
}

// ============================================================================
// Customer Generation
// ============================================================================

const CUSTOMER_NAMES = [
  'Max Mustermann', 'Anna Schmidt', 'Peter Müller', 'Lisa Weber',
  'Thomas Fischer', 'Sarah Meyer', 'Michael Wagner', 'Julia Becker',
  'Daniel Schulz', 'Laura Hoffmann', 'Christian Koch', 'Sophie Richter',
  'Sebastian Klein', 'Marie Wolf', 'Jan Schröder', 'Emma Neumann',
  'Lukas Schwarz', 'Lena Zimmermann', 'Felix Braun', 'Hannah Krüger',
  'Tim Hartmann', 'Lea Lange', 'Nico Schmitt', 'Mia Werner',
  'David Krause', 'Elena Meier', 'Jonas Köhler', 'Sophia Huber',
  'Florian Maier', 'Charlotte Fuchs', 'Leon Schmidt', 'Amelie Schneider',
  'Paul Kaiser', 'Emily Stein', 'Ben Friedrich', 'Clara Vogel',
  'Luis Herrmann', 'Emilia Kraus', 'Noah Hofmann', 'Lina König',
  'Elias Berger', 'Mila Franke', 'Henry Albrecht', 'Ella Günther',
  'Anton Roth', 'Ida Jung', 'Oskar Keller', 'Mathilda Lang'
];

function generateCustomers(count = 40) {
  console.log(`👥 Generating ${count} customers...`);
  const customers = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const name = CUSTOMER_NAMES[i] || `Customer ${i}`;
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}.${i}@example.com`;

    // Registration date: Random date in last 90 days
    const daysAgo = getRandomInt(1, 90);
    const registrationDate = new Date(now);
    registrationDate.setDate(registrationDate.getDate() - daysAgo);

    customers.push({
      id: `customer-${i + 1}`,
      email,
      name,
      createdAt: registrationDate.toISOString(),
      orderHistory: []
    });
  }

  console.log(`✅ Generated ${customers.length} customers\n`);
  return customers;
}

// ============================================================================
// Order Generation
// ============================================================================

function generateOrders(products, customers, days = 30) {
  console.log(`📝 Generating orders for ${days} days...`);
  const orders = [];
  const now = new Date();

  // Total orders to generate (3-6 per day average)
  const totalOrders = getRandomInt(days * 3, days * 6);

  for (let i = 0; i < totalOrders; i++) {
    // Random day in the last ${days} days
    const daysAgo = Math.floor(Math.random() * days);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);

    // Add random hours/minutes
    orderDate.setHours(getRandomInt(8, 22), getRandomInt(0, 59), getRandomInt(0, 59));

    // Weekend boost: 30% more likely to order on weekends
    const isWeekendOrder = isWeekend(orderDate);
    if (!isWeekendOrder && Math.random() < 0.3) {
      continue; // Skip some weekday orders
    }

    // Select random customer
    const customer = getRandomElement(customers);

    // Generate order items (1-4 items per order)
    const itemCount = getRandomInt(1, 4);
    const items = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = getRandomElement(products);
      const quantity = getRandomInt(1, 3);
      const price = product.price || getRandomFloat(20, 200);

      items.push({
        productId: product.id,
        name: product.name,  // ✅ Fixed: was "productName", now "name" to match OrderItem interface
        quantity,
        price,
        imageUrl: product.imageUrl || '/pics/placeholder.jpg',  // ✅ Added: required by OrderItem interface
        subtotal: price * quantity
      });

      total += price * quantity;
    }

    orders.push({
      id: `order-${generateId()}`,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      items,
      subtotal: parseFloat(total.toFixed(2)),
      shipping: 4.99,
      total: parseFloat((total + 4.99).toFixed(2)),
      status: 'completed',
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      createdAt: orderDate.toISOString(),
      updatedAt: orderDate.toISOString()
    });
  }

  // Sort by date (oldest first)
  orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  console.log(`✅ Generated ${orders.length} orders\n`);
  return orders;
}

// ============================================================================
// Statistics Display
// ============================================================================

function displayStatistics(orders) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SEED DATA STATISTICS');
  console.log('='.repeat(60));

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = totalRevenue / orders.length;

  // Orders by day
  const ordersByDay = {};
  orders.forEach(order => {
    const date = order.createdAt.split('T')[0];
    ordersByDay[date] = (ordersByDay[date] || 0) + 1;
  });

  // Last 7 days revenue
  const last7Days = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const daysAgo = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const revenue7d = last7Days.reduce((sum, o) => sum + o.total, 0);

  // Last 30 days revenue
  const last30Days = orders;
  const revenue30d = totalRevenue;

  console.log(`Total Orders:          ${orders.length}`);
  console.log(`Total Revenue:         €${totalRevenue.toFixed(2)}`);
  console.log(`Average Order Value:   €${avgOrderValue.toFixed(2)}`);
  console.log(`\nLast 7 Days:`);
  console.log(`  Orders:              ${last7Days.length}`);
  console.log(`  Revenue:             €${revenue7d.toFixed(2)}`);
  console.log(`\nLast 30 Days:`);
  console.log(`  Orders:              ${last30Days.length}`);
  console.log(`  Revenue:             €${revenue30d.toFixed(2)}`);
  console.log(`\nOrders per day:        ${(orders.length / 30).toFixed(1)} avg`);
  console.log(`Peak day orders:       ${Math.max(...Object.values(ordersByDay))}`);
  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// DynamoDB Table Cleanup
// ============================================================================

async function clearTable(tableName, itemType) {
  console.log(`🗑️  Clearing existing ${itemType} from ${tableName}...`);

  try {
    // Scan all items
    const scanResult = await docClient.send(new ScanCommand({
      TableName: tableName
    }));

    const items = scanResult.Items || [];

    if (items.length === 0) {
      console.log(`  No existing ${itemType} to clear.\n`);
      return;
    }

    // Delete all items in batches (max 25 per batch)
    const batchSize = 25;
    let deleted = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: batch.map(item => ({
            DeleteRequest: {
              Key: { id: item.id }
            }
          }))
        }
      }));

      deleted += batch.length;
      process.stdout.write(`\r  Progress: ${deleted}/${items.length}`);
    }

    console.log(`\n✅ Successfully cleared ${deleted} ${itemType}\n`);
  } catch (error) {
    console.error(`❌ Error clearing ${tableName}:`, error);
    throw error;
  }
}

// ============================================================================
// DynamoDB Batch Write
// ============================================================================

async function batchWriteItems(tableName, items, itemType) {
  console.log(`💾 Writing ${items.length} ${itemType} to ${tableName}...`);

  // DynamoDB batch write limit: 25 items
  const batchSize = 25;
  let written = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    await docClient.send(new BatchWriteCommand({
      RequestItems: {
        [tableName]: batch.map(item => ({
          PutRequest: { Item: item }
        }))
      }
    }));

    written += batch.length;
    process.stdout.write(`\r  Progress: ${written}/${items.length}`);
  }

  console.log(`\n✅ Successfully wrote ${written} ${itemType}\n`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function seed() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 ECOKART SEED DATA GENERATOR');
  console.log('='.repeat(60));
  console.log(`Region: ${AWS_REGION}`);
  console.log(`Profile: ${AWS_PROFILE}`);
  console.log(`Orders Table: ${TABLES.orders}`);
  console.log(`Customers Table: ${TABLES.customers}`);
  console.log(`Products Table: ${TABLES.products}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Get and update products
    const products = await getProducts();
    await updateProductStock(products);

    // Step 2: Generate customers
    const customers = generateCustomers(40);

    // Step 3: Generate orders (30 days)
    const orders = generateOrders(products, customers, 30);

    // Step 4: Display statistics
    displayStatistics(orders);

    // Step 5: Clear existing data (ensures clean state)
    await clearTable(TABLES.customers, 'customers');
    await clearTable(TABLES.orders, 'orders');

    // Step 6: Write new data to DynamoDB
    await batchWriteItems(TABLES.customers, customers, 'customers');
    await batchWriteItems(TABLES.orders, orders, 'orders');

    console.log('✅ SEED DATA GENERATION COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

// Run seed function
seed().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
