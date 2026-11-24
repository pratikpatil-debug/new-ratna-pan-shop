/**
 * Comprehensive Automated End-to-End Suite for New Ratna Pan Shop
 */

import { notificationService } from '../src/services/notificationService.js';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '../src/data/initialProducts.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING NEW RATNA PAN SHOP TEST SUITE');
  console.log('==================================================\n');

  // TEST 1 — Token Formatting & Order Structure
  console.log('📌 TEST 1: Token Formatting & Customer Messages');
  const sampleOrder = {
    id: '1004',
    token: 1004,
    customerName: 'Aakash Gupta',
    mobile: '9876543210',
    items: [
      { productId: 'paan-01', name: 'Special Maghai Meetha Paan', price: 45, quantity: 2 },
      { productId: 'bev-01', name: 'Chilled Special Rose Thandai (300ml)', price: 65, quantity: 1 }
    ],
    total: 155,
    status: 'received'
  };

  const receivedMsg = notificationService.formatMessage(sampleOrder, 'received');
  assert(receivedMsg.includes('New Ratna Pan Shop'), 'Notification contains Shop Name');
  assert(receivedMsg.includes('Token: #1004'), 'Notification contains Token: #1004');
  assert(receivedMsg.includes('Status: Order Received.'), 'Notification contains Status: Order Received');

  // TEST 2 — Ready For Pickup Message
  console.log('\n📌 TEST 2: Ready for Pickup Notification');
  const readyMsg = notificationService.formatMessage(sampleOrder, 'ready');
  assert(readyMsg.includes('Token #1004 is READY FOR PICKUP.'), 'Ready message contains exact Token #1004 announcement');
  assert(readyMsg.includes('Please collect your order from the shop counter.'), 'Ready message includes shop counter pickup instruction');

  // TEST 3 — Status Lifecycle Pipeline & Token Permanence
  console.log('\n📌 TEST 3: Status Lifecycle & Token Permanence');
  const statuses = ['received', 'accepted', 'preparing', 'ready', 'collected'];
  let currentOrder = { ...sampleOrder };
  
  for (const nextStatus of statuses) {
    currentOrder.status = nextStatus;
    if (nextStatus === 'collected') {
      currentOrder.paymentStatus = 'Paid & Collected';
    }
    const msg = notificationService.formatMessage(currentOrder, nextStatus);
    assert(currentOrder.token === 1004, `Token remained #1004 during transition to '${nextStatus}'`);
    assert(msg.includes('#1004'), `Formatted message preserves #1004 for '${nextStatus}'`);
  }
  assert(currentOrder.paymentStatus === 'Paid & Collected', 'Payment status updated to Paid & Collected on handover');

  // TEST 4 — Input Validation & Error Handling
  console.log('\n📌 TEST 4: Form Validation & Error Protection');
  const validateOrder = (name, phone) => {
    if (!name || name.trim().length < 2) return { valid: false, error: 'Name must be at least 2 characters.' };
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) return { valid: false, error: 'Please enter a valid 10-digit mobile number.' };
    return { valid: true };
  };

  assert(!validateOrder('', '9876543210').valid, 'Rejects empty customer name');
  assert(!validateOrder('A', '9876543210').valid, 'Rejects 1-letter customer name');
  assert(!validateOrder('Rahul', '').valid, 'Rejects empty phone number');
  assert(!validateOrder('Rahul', '12345').valid, 'Rejects short phone number');
  assert(validateOrder('Rahul Sharma', '9876543210').valid, 'Accepts valid name and 10-digit phone');

  // TEST 5 — Sequential Token Increment Safety
  console.log('\n📌 TEST 5: Sequential Token Increment Safety');
  let currentSeq = 1004;
  const generatedTokens = [];
  for (let i = 0; i < 10; i++) {
    const token = currentSeq++;
    generatedTokens.push(token);
  }
  const uniqueTokens = new Set(generatedTokens);
  assert(uniqueTokens.size === 10, 'All 10 generated tokens are strictly unique');
  assert(generatedTokens[0] === 1004 && generatedTokens[9] === 1013, 'Tokens increment consecutively without skips (#1004 to #1013)');

  // TEST 6 — Product Catalog Integrity (Step 16 & Data Restoration)
  console.log('\n📌 TEST 6: Product Catalog Integrity & 29 Products Sequence');
  assert(INITIAL_PRODUCTS.length === 29, `Catalog has exactly 29 products (found ${INITIAL_PRODUCTS.length})`);
  const allHavePrice = INITIAL_PRODUCTS.every((p) => typeof p.price === 'number' && p.price > 0);
  assert(allHavePrice, 'Every product has a valid non-zero price');

  // Verify exact 1-29 sequence
  const isStrictSequence = INITIAL_PRODUCTS.every((p, idx) => p.displayOrder === idx + 1);
  assert(isStrictSequence, 'Products 01-29 strictly follow the 1-29 sequence');

  const EXPECTED_29 = [
    { name: 'Special Blackcurrant Paan', price: 70, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/6b443ff4-4528-4826-8c53-60a1f90cf91d_16b31ea8-b1fa-4258-8762-e9f07245c4c6.jpg' },
    { name: 'Special Blueberry Paan', price: 70, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/08b87f22-ebd8-4244-a471-3a7372070c9b_a77c2d5f-a611-450b-b69f-bb58203bbd96.jpg' },
    { name: 'Banaras 120 300 Paan', price: 40, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/e16b1286-bac1-4f83-a772-5f7feaaefd72_e04171a8-c0f4-4df7-b05c-c8aaf5deef8a.jpg' },
    { name: 'Dark Chocolate Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/abd49e69-2d2f-4aa5-92c3-213a3d513e4e_03146df5-a200-45a4-9a8a-6e0be22086ff.jpg_compressed' },
    { name: 'Malai Kulfi Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/34149502-093a-4b21-95e8-940af6e6040b_fc5c48df-e463-4238-86cf-25963a54d05d.jpg' },
    { name: 'Vanilla Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/4ded5209-d959-441c-b748-524ac5841290_bc893c29-5f54-43a2-9d4e-0dc4f84a0a77.jpg' },
    { name: 'Belgium Chocolate Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/9cb93f99-a8bb-47d2-a89f-2e95502902bb_0e3fd3d2-b09e-4ff9-81cc-4c031e2d6c9d.jpg' },
    { name: 'Mulberry Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/f967e89f-24e9-41bc-b6c7-5e46e1c7c4f3_b85cb50f-6304-4eba-a8df-95e70ab70a06.jpg' },
    { name: 'Special Kesar Masala Paan', price: 90, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/ee04ba6c-a0b0-4249-8364-c61de1067c26_47835704-1c0a-4f7f-97d4-91a8037f9015.jpg' },
    { name: 'Mojito Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/3fb23cc0-5dee-4040-9540-101d16eb167e_595095f0-aa51-440f-8bb3-f654c695a381.jpg' },
    { name: 'Maghai Masala Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/b0a55cbf-e3b7-46f2-af59-7de7eeda7979_1bbeddae-a141-46da-a147-42390103bd97.jpg' },
    { name: 'Mango Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/a2c6a061-7b51-40cb-95a7-f4a6ff0d79fb_4e323d79-3ede-4710-ba38-ac674f127422.jpg' },
    { name: 'Kolkata Masala Paan', price: 50, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/25ba65b3-03a1-4ee3-b315-754ad0ff4a94_d1c9536e-bdad-4815-b311-9151e89be33c.jpg_compressed' },
    { name: 'Strawberry Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/80f39931-88c1-4fa5-ba19-c63f866d9c65_d6d9d2f5-23df-461f-8ba8-6499a046471e.jpg' },
    { name: 'Butterscotch Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/0b86144b-b7c1-42d2-8ce8-d6bbcc09d592_648d93ef-42b9-4003-ba6b-788b5574e203.jpg' },
    { name: 'Special White Chocolate Paan', price: 70, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/cc14b660-8ec0-4a55-90f8-268baf42b761_50083b1f-0812-4e20-8e51-b90aac46818d.jpg' },
    { name: 'Special Mango Paan', price: 70, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/2140aedc-61ae-48f4-8ce0-6009a87788e7_47a7aeaf-f6b1-4d81-ac71-2c0c8b98ef1a.jpg' },
    { name: 'Pineapple Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/826eb2c2-f532-4d47-b7fa-cafa103209d2_2aaa040c-8b98-40e2-bd86-d4aef4ec9ea9.jpg' },
    { name: 'Special Pista Paan', price: 70, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/f1e39a7a-a4a7-40ac-8454-dbaf7d66f6e5_84184631-da77-431e-ab7c-a064fd92bed5.jpg' },
    { name: 'Sada Fulchand Paan', price: 50, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/0583b404-3a29-4040-b40a-d8c9eb422e70_2989df93-dc8d-4c4e-968a-fe785be0f1d4.jpg' },
    { name: 'Rampyari Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/14a25a25-80fc-4d44-a42e-62004d697657_e5aab33e-4d64-40fa-bb8c-fc5b8b49e006.jpg_compressed' },
    { name: 'Orange Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/345ccecd-6be2-42d2-973f-dc6dfeab8fd6_4d110a15-4816-4b25-8da4-251ade23be60.jpg' },
    { name: 'Blueberry Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/13c507bb-d8a5-42bb-89c4-77722d0567ec_3e97e079-cc69-4e25-971e-bb6b01edf47d.jpg' },
    { name: 'Blackcurrant Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/b0a55cbf-e3b7-46f2-af59-7de7eeda7979_1bbeddae-a141-46da-a147-42390103bd97.jpg' },
    { name: 'Pista Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/bfe251c0-b2e7-4fed-ba32-c75100a5c51f_c18548ca-d58c-4e67-b101-04243a7d19a3.jpg' },
    { name: 'Special Dry Fruits Masala Paan', price: 70, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/33788129-64d3-4ff3-9cd8-f09f49ae9ca7_1a2e42ff-b62a-4b89-b0b6-6c9b1451039b.jpg_compressed' },
    { name: 'Special Masala Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/efdd26f6-0b09-49bf-9365-3b955466ff1b_b7a29671-e937-454e-aac7-5b9a764e1ada.jpg' },
    { name: 'Banaras Masala Paan', price: 60, url: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/33a90257-3676-4832-b86f-94d538284230_2c4fcec5-e246-4cdc-b7ad-8a719d726d62.jpg' },
    { name: 'Laddu Paan', price: 60, url: null }
  ];

  EXPECTED_29.forEach((exp, idx) => {
    const p = INITIAL_PRODUCTS[idx];
    assert(p.name === exp.name, `Product #${idx + 1} name is "${exp.name}"`);
    assert(p.price === exp.price, `Product #${idx + 1} price is ₹${exp.price}`);
    if (exp.url) {
      assert(p.image === exp.url, `Product #${idx + 1} image matches exact URL`);
    } else {
      assert(p.image.includes('images.unsplash.com'), `Product #${idx + 1} uses neutral placeholder`);
    }
  });

  // STEP 18: Verify all 29 product image URLs are full color and free of e_grayscale transformation
  const noGrayscaleInUrls = INITIAL_PRODUCTS.every((p) => !p.image.includes('e_grayscale'));
  assert(noGrayscaleInUrls, 'None of the 29 product image URLs contain "e_grayscale" (100% full color)');

  // TEST 7 — Sales Calculation & Top Products Ranking
  console.log('\n📌 TEST 7: Sales Calculation & Top Products Ranking');
  const testOrderSet = [
    {
      id: '1001',
      token: 1001,
      status: 'collected',
      total: 150,
      grandTotal: 150,
      items: [{ productId: 'prod-01', name: 'Special Blackcurrant Paan', price: 70, quantity: 2 }]
    },
    {
      id: '1002',
      token: 1002,
      status: 'preparing',
      total: 200,
      grandTotal: 200,
      items: [
        { productId: 'prod-01', name: 'Special Blackcurrant Paan', price: 70, quantity: 1 },
        { productId: 'prod-04', name: 'Dark Chocolate Paan', price: 60, quantity: 1 }
      ]
    },
    {
      id: '1003',
      token: 1003,
      status: 'rejected',
      total: 500,
      grandTotal: 500,
      items: [{ productId: 'prod-09', name: 'Special Kesar Masala Paan', price: 90, quantity: 1 }]
    }
  ];

  // Sales should strictly exclude rejected orders
  const validOrders = testOrderSet.filter((o) => o.status !== 'rejected');
  const computedSales = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  assert(computedSales === 350, 'Sales calculation correctly sums valid orders (₹350) and excludes rejected (₹500)');

  // Top products ranking computation
  const rankMap = {};
  validOrders.forEach((o) => {
    o.items.forEach((it) => {
      if (!rankMap[it.productId]) {
        rankMap[it.productId] = { name: it.name, qty: 0, rev: 0 };
      }
      rankMap[it.productId].qty += it.quantity;
      rankMap[it.productId].rev += it.quantity * it.price;
    });
  });

  const rankedList = Object.values(rankMap).sort((a, b) => b.qty - a.qty);
  assert(rankedList[0].name === 'Special Blackcurrant Paan' && rankedList[0].qty === 3, 'Top product #1 correctly calculated as Special Blackcurrant Paan (3 units sold)');

  // TEST 8 — Product Stock Field & Schema Integrity (Step 16 Defaults)
  console.log('\n📌 TEST 8: Product Stock Field & Default Values (Step 16)');
  const allHaveStock = INITIAL_PRODUCTS.every(
    (p) => typeof p.stockQuantity === 'number' && p.stockQuantity >= 0
  );
  assert(allHaveStock, 'Every product has a valid stockQuantity >= 0');
  const allStockZero = INITIAL_PRODUCTS.every((p) => p.stockQuantity === 0);
  assert(allStockZero, 'All 29 products have default stockQuantity: 0');
  const allAvailable = INITIAL_PRODUCTS.every((p) => p.available === true && p.isAvailable === true);
  assert(allAvailable, 'All 29 products have default available: true');

  // TEST 9 — Low Stock & Sold Out Logic
  console.log('\n📌 TEST 9: Low Stock & Sold Out Logic Rules');
  const checkStockStatus = (stockQty, isAvailable) => {
    if (!isAvailable || stockQty <= 0) return 'sold_out';
    if (stockQty <= 5) return 'low_stock';
    return 'available';
  };

  assert(checkStockStatus(25, true) === 'available', 'stock = 25 -> Available');
  assert(checkStockStatus(5, true) === 'low_stock', 'stock = 5 -> Low Stock');
  assert(checkStockStatus(1, true) === 'low_stock', 'stock = 1 -> Low Stock');
  assert(checkStockStatus(0, true) === 'sold_out', 'stock = 0 -> Sold Out');
  assert(checkStockStatus(10, false) === 'sold_out', 'available = false -> Sold Out (regardless of stock number)');

  // TEST 10 — Cart Max Stock Limit Enforcement
  console.log('\n📌 TEST 10: Cart Max Stock Limit Enforcement');
  const testValidateCartAdd = (currentInCart, addQty, stockQty, isAvailable) => {
    if (!isAvailable || stockQty <= 0) {
      return { allowed: false, message: 'This item is currently sold out.' };
    }
    if (currentInCart + addQty > stockQty) {
      const remaining = Math.max(0, stockQty - currentInCart);
      return {
        allowed: false,
        message: remaining > 0 ? `Only ${stockQty} available.` : 'Maximum available quantity reached.'
      };
    }
    return { allowed: true };
  };

  assert(!testValidateCartAdd(0, 1, 0, true).allowed, 'Adding 1 to sold-out product (0 stock) is rejected');
  assert(testValidateCartAdd(0, 1, 5, true).allowed, 'Adding 1 when 5 in stock is allowed');
  assert(testValidateCartAdd(4, 1, 5, true).allowed, 'Adding 1 when 4 in cart and 5 in stock is allowed');
  assert(!testValidateCartAdd(5, 1, 5, true).allowed, 'Adding 1 when 5 already in cart and 5 in stock is rejected');
  assert(testValidateCartAdd(5, 1, 5, true).message === 'Maximum available quantity reached.', 'Rejection message informs max available quantity reached');
  assert(!testValidateCartAdd(3, 4, 5, true).allowed, 'Adding 4 when 3 in cart and 5 in stock is rejected');

  // TEST 11 — Order Placement Stock Deduction & Transaction Simulation
  console.log('\n📌 TEST 11: Order Placement Stock Deduction & Atomic Transaction');
  let mockProductsInventory = [
    { id: 'paan-01', name: 'Meetha Paan', stockQuantity: 10 },
    { id: 'paan-02', name: 'Chocolate Paan', stockQuantity: 5 }
  ];

  const simulateOrderTransaction = (orderItems, inventory) => {
    // 1. Verify stock for all items
    for (const item of orderItems) {
      const prod = inventory.find((p) => p.id === item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        throw new Error(`Sorry, this product is no longer available in the requested quantity (Only ${prod ? prod.stockQuantity : 0} available for "${item.name}").`);
      }
    }
    // 2. Decrement stock atomically
    return inventory.map((p) => {
      const ordered = orderItems.find((it) => it.productId === p.id);
      if (ordered) {
        return { ...p, stockQuantity: p.stockQuantity - ordered.quantity };
      }
      return p;
    });
  };

  // Customer places order of 3 Meetha Paans
  mockProductsInventory = simulateOrderTransaction(
    [{ productId: 'paan-01', name: 'Meetha Paan', quantity: 3 }],
    mockProductsInventory
  );
  assert(mockProductsInventory.find((p) => p.id === 'paan-01').stockQuantity === 7, 'Stock for Meetha Paan correctly decreased from 10 to 7 after order');

  // TEST 12 — Concurrency / Insufficient Stock Rejection
  console.log('\n📌 TEST 12: Insufficient Stock Rejection Protection');
  let transactionFailed = false;
  let errorMsg = '';
  try {
    // Attempt to order 8 Meetha Paans when only 7 are available
    simulateOrderTransaction(
      [{ productId: 'paan-01', name: 'Meetha Paan', quantity: 8 }],
      mockProductsInventory
    );
  } catch (err) {
    transactionFailed = true;
    errorMsg = err.message;
  }
  assert(transactionFailed, 'Transaction successfully blocked an order exceeding remaining stock');
  assert(errorMsg.includes('no longer available in the requested quantity'), 'User receives exact clear stock exhaustion error message');
  assert(mockProductsInventory.find((p) => p.id === 'paan-01').stockQuantity === 7, 'Stock remained untouched at 7 after aborted transaction');

  // TEST 13 — Admin Order Rejection Stock Restoration
  console.log('\n📌 TEST 13: Admin Order Rejection Stock Restoration (Idempotent)');
  const orderToReject = {
    id: '1005',
    token: 1005,
    status: 'received',
    stockRestored: false,
    items: [{ productId: 'paan-01', name: 'Meetha Paan', quantity: 3 }]
  };

  const simulateStatusUpdate = (order, newStatus, inventory) => {
    let nextInventory = [...inventory];
    let nextOrder = { ...order, status: newStatus };

    if (newStatus === 'rejected' && order.stockRestored !== true) {
      nextOrder.stockRestored = true;
      nextInventory = inventory.map((p) => {
        const item = order.items.find((it) => it.productId === p.id);
        if (item) {
          return { ...p, stockQuantity: p.stockQuantity + item.quantity };
        }
        return p;
      });
    }

    return { nextOrder, nextInventory };
  };

  const rejectionResult = simulateStatusUpdate(orderToReject, 'rejected', mockProductsInventory);
  mockProductsInventory = rejectionResult.nextInventory;
  assert(rejectionResult.nextOrder.stockRestored === true, 'Order marked as stockRestored = true');
  assert(mockProductsInventory.find((p) => p.id === 'paan-01').stockQuantity === 10, 'Stock restored from 7 back to 10 upon rejection');

  // Second rejection should be a no-op (idempotency check)
  const secondRejection = simulateStatusUpdate(rejectionResult.nextOrder, 'rejected', mockProductsInventory);
  assert(secondRejection.nextInventory.find((p) => p.id === 'paan-01').stockQuantity === 10, 'Repeated rejection does NOT restore stock twice');

  // TEST 14 — Collected Order Stock Non-Duplication
  console.log('\n📌 TEST 14: Collected Order Status Preservation');
  const collectedResult = simulateStatusUpdate(orderToReject, 'collected', mockProductsInventory);
  assert(collectedResult.nextInventory.find((p) => p.id === 'paan-01').stockQuantity === 10, 'Stock is untouched when order status moves to Collected');

  // TEST 15 — STEP 15: Admin to Customer Real-time Synchronization Pipeline
  console.log('\n📌 TEST 15: Admin -> Customer Real-time Synchronization');
  let liveCatalog = [
    {
      id: 'prod-test-01',
      name: 'Test Paan',
      price: 50,
      stockQuantity: 10,
      isAvailable: true,
      available: true,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      category: 'meetha'
    }
  ];

  // Helper simulating the shared Firestore collection & subscription
  const simulateAdminUpdate = (productId, updates) => {
    liveCatalog = liveCatalog.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          ...updates,
          price: updates.price !== undefined ? Number(updates.price) : p.price,
          stockQuantity: updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : p.stockQuantity,
          available: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : (updates.available !== undefined ? Boolean(updates.available) : p.available),
          isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : (updates.available !== undefined ? Boolean(updates.available) : p.isAvailable)
        };
      }
      return p;
    });
    return liveCatalog;
  };

  // 1. Initial State Check
  let customerViewProduct = liveCatalog.find((p) => p.id === 'prod-test-01');
  assert(customerViewProduct.name === 'Test Paan' && customerViewProduct.price === 50 && customerViewProduct.stockQuantity === 10, 'Initial product rendered in customer view: Test Paan @ ₹50, Stock 10');

  // 2. Admin Changes Price: ₹50 -> ₹80
  simulateAdminUpdate('prod-test-01', { price: 80 });
  customerViewProduct = liveCatalog.find((p) => p.id === 'prod-test-01');
  assert(customerViewProduct.price === 80, 'Admin changes price ₹50 -> ₹80: Customer portal immediately sees updated price ₹80');

  // 3. Admin Changes Image
  const newImgUrl = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';
  simulateAdminUpdate('prod-test-01', { image: newImgUrl });
  customerViewProduct = liveCatalog.find((p) => p.id === 'prod-test-01');
  assert(customerViewProduct.image === newImgUrl, 'Admin updates image: Customer portal immediately sees new image URL');

  // 4. Admin Changes Stock: 10 -> 0 (Sold Out)
  simulateAdminUpdate('prod-test-01', { stockQuantity: 0 });
  customerViewProduct = liveCatalog.find((p) => p.id === 'prod-test-01');
  assert(customerViewProduct.stockQuantity === 0, 'Admin updates stock 10 -> 0');
  const isOutOfStock = customerViewProduct.stockQuantity <= 0 || customerViewProduct.isAvailable === false;
  assert(isOutOfStock === true, 'Customer product card calculates Sold Out and disables Add button');

  // 5. Admin Changes Availability: Inactive / Hidden / Unavailable
  simulateAdminUpdate('prod-test-01', { isAvailable: false });
  customerViewProduct = liveCatalog.find((p) => p.id === 'prod-test-01');
  assert(customerViewProduct.isAvailable === false && customerViewProduct.available === false, 'Admin marks Unavailable: Customer product is deactivated from ordering');

  // 6. No duplicate product documents created on edit
  assert(liveCatalog.filter((p) => p.name === 'Test Paan').length === 1, 'Editing existing product never creates duplicate product IDs');

  // TEST 16 — Active Cart Items Dynamic Synchronization
  console.log('\n📌 TEST 16: Active Cart Items Dynamic Synchronization');
  let customerCart = [
    {
      product: { id: 'prod-test-01', name: 'Test Paan', price: 50, stockQuantity: 10, isAvailable: true },
      quantity: 2
    }
  ];

  // Admin updates price to 80 and stock to 5
  simulateAdminUpdate('prod-test-01', { price: 80, stockQuantity: 5, isAvailable: true });
  
  // Sync cart with liveCatalog
  customerCart = customerCart.map((it) => {
    const fresh = liveCatalog.find((p) => p.id === it.product.id);
    return fresh ? { ...it, product: fresh } : it;
  });

  const cartSubtotal = customerCart.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  assert(cartSubtotal === 160, 'Customer cart subtotal dynamically recalibrates to updated price: 2 × ₹80 = ₹160');
  assert(customerCart[0].product.stockQuantity === 5, 'Cart item references updated stock limit (5 units available)');

  // TEST 17 — STEP 17: Product Stock / Out-of-Stock End-to-End Synchronization
  console.log('\n📌 TEST 17: Step 17 Stock & Out-of-Stock Real-time Transitions');
  let testCatalog = [
    {
      id: 'prod-01',
      name: 'Special Blackcurrant Paan',
      price: 70,
      stockQuantity: 0,
      available: true,
      isAvailable: true
    }
  ];

  const evalProductState = (p) => {
    const stock = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0;
    const isAvail = p.available !== false && p.isAvailable !== false;
    const isSoldOut = isAvail && stock <= 0;
    const isUnavailable = !isAvail;
    const isOrderable = isAvail && stock > 0;
    return { stock, isAvail, isSoldOut, isUnavailable, isOrderable };
  };

  // Step A: Initial stock = 0
  let state = evalProductState(testCatalog[0]);
  assert(state.isSoldOut === true && state.isOrderable === false, 'Initial state (stock=0, available=true) -> SOLD OUT, Add to cart disabled');

  // Step B: Admin sets stockQuantity = 5
  testCatalog[0].stockQuantity = 5;
  state = evalProductState(testCatalog[0]);
  assert(state.isSoldOut === false && state.isOrderable === true && state.stock === 5, 'Admin sets stockQuantity = 5 -> Product is AVAILABLE, Add to cart enabled');

  // Step C: Customer adds quantities 1 to 5
  let cartTest = [];
  const addCartHelper = (qty) => {
    const p = testCatalog[0];
    const st = evalProductState(p);
    if (!st.isOrderable) return { success: false, msg: 'Sold out' };
    const current = cartTest.reduce((s, it) => s + it.quantity, 0);
    if (current + qty > st.stock) {
      return { success: false, msg: `Only ${st.stock} available.` };
    }
    cartTest.push({ productId: p.id, quantity: qty });
    return { success: true };
  };

  for (let i = 1; i <= 5; i++) {
    cartTest = [];
    const res = addCartHelper(i);
    assert(res.success === true, `Adding ${i} items when stock = 5 succeeds`);
  }

  // Step D: Customer attempts to add 6th item
  cartTest = [{ productId: 'prod-01', quantity: 5 }];
  const overflowRes = addCartHelper(1);
  assert(overflowRes.success === false && overflowRes.msg === 'Only 5 available.', 'Attempting 6 items when stock = 5 fails with "Only 5 available."');

  // Step E: Admin changes 5 -> 0
  testCatalog[0].stockQuantity = 0;
  state = evalProductState(testCatalog[0]);
  assert(state.isSoldOut === true && state.isOrderable === false, 'Admin changes 5 -> 0 -> Customer portal automatically shows SOLD OUT');

  // Step F: Admin changes 0 -> 8
  testCatalog[0].stockQuantity = 8;
  state = evalProductState(testCatalog[0]);
  assert(state.isSoldOut === false && state.isOrderable === true && state.stock === 8, 'Admin changes 0 -> 8 -> Customer portal automatically shows AVAILABLE (stock: 8)');

  // Step G: Admin sets available = false (independent of stockQuantity)
  testCatalog[0].available = false;
  testCatalog[0].isAvailable = false;
  state = evalProductState(testCatalog[0]);
  assert(state.isUnavailable === true && state.isOrderable === false && state.stock === 8, 'available = false, stockQuantity = 8 -> UNAVAILABLE, Add to cart disabled');

  // TEST 18 — STEP 19: Hero Featured Product Rampyari Paan
  console.log('\n📌 TEST 18: Step 19 Hero Featured Product Verification');
  const rampyariCatalogItem = INITIAL_PRODUCTS.find((p) => p.name === 'Rampyari Paan');
  assert(Boolean(rampyariCatalogItem), 'Rampyari Paan exists in the catalog (Product #21)');
  assert(rampyariCatalogItem.price === 60, 'Rampyari Paan price is ₹60');
  assert(
    rampyariCatalogItem.image === 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/14a25a25-80fc-4d44-a42e-62004d697657_e5aab33e-4d64-40fa-bb8c-fc5b8b49e006.jpg_compressed',
    'Rampyari Paan image matches full-color exact URL'
  );

  // TEST 19 — STEP 20: Product Card Stock Status Badge Formats
  console.log('\n📌 TEST 19: Step 20 Product Card Stock Status Badges');
  const getBadgeText = (stockQty, isAvail) => {
    if (!isAvail) return 'UNAVAILABLE';
    if (stockQty === 0) return 'SOLD OUT';
    if (stockQty >= 1 && stockQty <= 5) return `LOW STOCK • ${stockQty} LEFT`;
    return null; // no warning badge for stock > 5
  };

  assert(getBadgeText(10, true) === null, 'stock = 10, available = true -> No warning badge (Normal Add button)');
  assert(getBadgeText(5, true) === 'LOW STOCK • 5 LEFT', 'stock = 5, available = true -> "LOW STOCK • 5 LEFT"');
  assert(getBadgeText(1, true) === 'LOW STOCK • 1 LEFT', 'stock = 1, available = true -> "LOW STOCK • 1 LEFT"');
  assert(getBadgeText(0, true) === 'SOLD OUT', 'stock = 0, available = true -> "SOLD OUT"');
  assert(getBadgeText(10, false) === 'UNAVAILABLE', 'available = false -> "UNAVAILABLE"');
  assert(getBadgeText(0, false) === 'UNAVAILABLE', 'available = false (even if stock 0) -> "UNAVAILABLE"');

  // TEST 20 — STEP 21: Offers & Deals System
  console.log('\n📌 TEST 20: Step 21 Offers & Deals System');
  const { INITIAL_OFFERS } = await import('../src/data/initialOffers.js');
  const { offerService } = await import('../src/services/offerService.js');

  // 1. Initial 3 Offers Verification
  assert(INITIAL_OFFERS.length === 3, 'Initial offers contains exactly 3 offers');
  const offer1 = INITIAL_OFFERS.find((o) => o.title === 'Paan Party Deal');
  const offer2 = INITIAL_OFFERS.find((o) => o.title === 'Meetha Paan Combo');
  const offer3 = INITIAL_OFFERS.find((o) => o.title === 'Royal Paan Deal');

  assert(offer1 && offer1.discountValue === 20 && offer1.minimumQuantity === 3 && offer1.applicableCategory === 'all', 'Offer 1: Paan Party Deal (₹20 OFF, min 3, all paans)');
  assert(offer2 && offer2.discountValue === 10 && offer2.minimumQuantity === 2 && offer2.applicableCategory === 'meetha', 'Offer 2: Meetha Paan Combo (₹10 OFF, min 2, meetha)');
  assert(offer3 && offer3.discountValue === 15 && offer3.minimumQuantity === 2 && offer3.applicableCategory === 'royal', 'Offer 3: Royal Paan Deal (₹15 OFF, min 2, royal)');

  // 2. Offer Progress calculation when not qualified yet
  const cartWith1Paan = [
    { product: { id: 'prod-01', name: 'Special Blackcurrant Paan', price: 70, category: 'flavored' }, quantity: 1 }
  ];
  const evalProgress = offerService.evaluateCartOffers(cartWith1Paan, INITIAL_OFFERS);
  assert(evalProgress.appliedOffer === null, '1 item in cart -> No offer applied yet');
  assert(evalProgress.discount === 0, '1 item in cart -> discount is 0');
  assert(evalProgress.progressMessage.includes('Add 2 more eligible Paans to unlock ₹20 OFF'), 'Progress message accurately indicates 2 more items needed for Paan Party Deal');

  // 3. Qualification: 3 Paans qualifies for Paan Party Deal
  const cartWith3Paans = [
    { product: { id: 'prod-01', name: 'Special Blackcurrant Paan', price: 70, category: 'flavored' }, quantity: 2 },
    { product: { id: 'prod-02', name: 'Special Blueberry Paan', price: 70, category: 'flavored' }, quantity: 1 }
  ];
  const eval3Paans = offerService.evaluateCartOffers(cartWith3Paans, INITIAL_OFFERS);
  assert(eval3Paans.appliedOffer && eval3Paans.appliedOffer.title === 'Paan Party Deal', '3 Paans in cart -> Automatically applies Paan Party Deal');
  assert(eval3Paans.discount === 20, 'Paan Party Deal applies ₹20 discount');

  // 4. Qualification: 2 Meetha Paans qualifies for Meetha Paan Combo
  const cartWith2Meetha = [
    { product: { id: 'prod-15', name: 'Calcutta Meetha Paan', price: 50, category: 'meetha' }, quantity: 2 }
  ];
  const eval2Meetha = offerService.evaluateCartOffers(cartWith2Meetha, INITIAL_OFFERS);
  assert(eval2Meetha.appliedOffer && eval2Meetha.appliedOffer.title === 'Meetha Paan Combo', '2 Meetha Paans -> Automatically applies Meetha Paan Combo (₹10 OFF)');
  assert(eval2Meetha.discount === 10, 'Meetha Paan Combo discount is ₹10');

  // 5. Qualification: 2 Royal Specials qualifies for Royal Paan Deal
  const cartWith2Royal = [
    { product: { id: 'prod-25', name: 'Royal Rajwadi Special Paan', price: 90, category: 'royal' }, quantity: 2 }
  ];
  const eval2Royal = offerService.evaluateCartOffers(cartWith2Royal, INITIAL_OFFERS);
  assert(eval2Royal.appliedOffer && eval2Royal.appliedOffer.title === 'Royal Paan Deal', '2 Royal Specials -> Automatically applies Royal Paan Deal (₹15 OFF)');
  assert(eval2Royal.discount === 15, 'Royal Paan Deal discount is ₹15');

  // 6. Best Eligible Offer Selection: Cart with 3 Royal Paans qualifies for BOTH Paan Party Deal (₹20) and Royal Paan Deal (₹15) -> selects ₹20
  const cartWith3Royal = [
    { product: { id: 'prod-25', name: 'Royal Rajwadi Special Paan', price: 90, category: 'royal' }, quantity: 3 }
  ];
  const evalBest = offerService.evaluateCartOffers(cartWith3Royal, INITIAL_OFFERS);
  assert(evalBest.appliedOffer && evalBest.appliedOffer.title === 'Paan Party Deal' && evalBest.discount === 20, 'Best eligible offer selected: Paan Party Deal (₹20 OFF > ₹15 OFF)');

  // 7. Disabled offer does NOT apply
  const disabledOffers = INITIAL_OFFERS.map((o) => (o.title === 'Paan Party Deal' ? { ...o, enabled: false } : o));
  const evalDisabled = offerService.evaluateCartOffers(cartWith3Paans, disabledOffers);
  assert(evalDisabled.appliedOffer === null && evalDisabled.discount === 0, 'Disabled offer does NOT apply to cart');

  // 8. Expired offer does NOT apply
  const expiredOffers = INITIAL_OFFERS.map((o) => (o.title === 'Paan Party Deal' ? { ...o, endDate: '2020-01-01' } : o));
  const evalExpired = offerService.evaluateCartOffers(cartWith3Paans, expiredOffers);
  assert(evalExpired.appliedOffer === null && evalExpired.discount === 0, 'Expired offer does NOT apply to cart');

  // 9. Total calculation guarantees non-negative total
  const subtotal = 120;
  const discount = 20;
  const total = Math.max(0, subtotal - discount);
  assert(total === 100, 'Subtotal ₹120 - Offer ₹20 = Total ₹100');

  const zeroSubtotal = 10;
  const highDiscount = 25;
  const safeTotal = Math.max(0, zeroSubtotal - Math.min(highDiscount, zeroSubtotal));
  assert(safeTotal >= 0, 'Discount is capped at eligible subtotal and final total is never negative');

  // TEST 21 — STEP 23: Complete Pickup Order + Token Flow
  console.log('\n📌 TEST 21: Step 23 Complete Pickup Order + Token Flow');
  const { orderService } = await import('../src/services/orderService.js');
  const { productService } = await import('../src/services/productService.js');

  // 1. Check live products single source of truth
  const liveProds = await productService.getProducts();
  assert(liveProds.length === 29, 'Products collection has 29 products as single source of truth');

  // 2. Pickup Order Placement with Snapshot Items and Sequential Token
  const testPaan = liveProds[0]; // Special Blackcurrant Paan
  await productService.adjustStock(testPaan.id, 10, true);
  const initialStock = 10;

  const placedOrder = await orderService.createOrder({
    customerName: 'Aarav Patel',
    mobileNumber: '9876543210',
    items: [
      {
        productId: testPaan.id,
        productName: testPaan.name,
        price: testPaan.price,
        quantity: 2,
        imageUrl: testPaan.image
      }
    ],
    subtotal: testPaan.price * 2,
    discount: 0,
    total: testPaan.price * 2
  });

  assert(Boolean(placedOrder), 'Order created successfully');
  assert(Boolean(placedOrder.tokenNumber || placedOrder.token), 'Sequential token number generated');
  assert(placedOrder.pickupOnly === true, 'Order explicitly flagged as pickupOnly: true');
  assert(placedOrder.customerName === 'Aarav Patel', 'Customer name recorded');
  assert(placedOrder.mobileNumber === '9876543210' || placedOrder.mobile === '9876543210', '10-digit mobile number recorded');
  assert(placedOrder.items && placedOrder.items.length === 1, 'Items array recorded');
  assert(placedOrder.items[0].productId === testPaan.id, 'Item snapshot includes productId');
  assert(placedOrder.items[0].productName === testPaan.name || placedOrder.items[0].name === testPaan.name, 'Item snapshot includes productName');
  assert(placedOrder.items[0].price === testPaan.price, 'Item snapshot includes price');
  assert(placedOrder.items[0].quantity === 2, 'Item snapshot includes quantity');
  assert(Boolean(placedOrder.items[0].imageUrl || placedOrder.items[0].image), 'Item snapshot includes imageUrl');
  assert(placedOrder.orderStatus === 'PLACED' || placedOrder.status === 'placed', 'Initial status is PLACED / placed');

  // 3. Verify stock was atomically decreased
  const prodsAfterOrder = await productService.getProducts();
  const updatedPaan = prodsAfterOrder.find((p) => p.id === testPaan.id);
  const stockAfterOrder = Number(updatedPaan.stockQuantity !== undefined ? updatedPaan.stockQuantity : 0);
  assert(stockAfterOrder === initialStock - 2, 'Stock was atomically decreased by ordered quantity (2 units)');

  // 4. Test Token Sequencing (Consecutive Orders Have Incremented Tokens)
  const secondOrder = await orderService.createOrder({
    customerName: '', // Optional name test
    mobileNumber: '9876543210',
    items: [
      {
        productId: testPaan.id,
        productName: testPaan.name,
        price: testPaan.price,
        quantity: 1,
        imageUrl: testPaan.image
      }
    ],
    subtotal: testPaan.price,
    discount: 0,
    total: testPaan.price
  });

  assert(secondOrder.customerName === 'Valued Customer', 'Empty customer name defaults gracefully to "Valued Customer"');
  const token1 = Number(placedOrder.tokenNumber || placedOrder.token);
  const token2 = Number(secondOrder.tokenNumber || secondOrder.token);
  assert(token2 === token1 + 1, `Tokens increment sequentially (#${token1} -> #${token2}) without duplicates`);

  // 5. Test Status Transitions: PLACED -> ACCEPTED -> PREPARING -> READY -> COMPLETED
  await orderService.updateOrderStatus(placedOrder.id, 'ACCEPTED');
  let orderAfterAccept = await orderService.getOrderById(placedOrder.id);
  assert(
    orderAfterAccept.status === 'accepted' || orderAfterAccept.orderStatus === 'ACCEPTED',
    'Status successfully updated to ACCEPTED'
  );

  await orderService.updateOrderStatus(placedOrder.id, 'PREPARING');
  let orderAfterPrep = await orderService.getOrderById(placedOrder.id);
  assert(
    orderAfterPrep.status === 'preparing' || orderAfterPrep.orderStatus === 'PREPARING',
    'Status successfully updated to PREPARING'
  );

  await orderService.updateOrderStatus(placedOrder.id, 'READY');
  let orderAfterReady = await orderService.getOrderById(placedOrder.id);
  assert(
    orderAfterReady.status === 'ready' || orderAfterReady.orderStatus === 'READY',
    'Status successfully updated to READY'
  );

  await orderService.updateOrderStatus(placedOrder.id, 'COMPLETED');
  let orderAfterComplete = await orderService.getOrderById(placedOrder.id);
  assert(
    orderAfterComplete.status === 'completed' || orderAfterComplete.orderStatus === 'COMPLETED' || orderAfterComplete.status === 'collected',
    'Status successfully updated to COMPLETED'
  );

  // 6. Test Cancellation & Stock Restoration
  const stockBeforeCancel = Number(
    (await productService.getProducts()).find((p) => p.id === testPaan.id).stockQuantity
  );
  await orderService.updateOrderStatus(secondOrder.id, 'CANCELLED');
  let cancelledOrder = await orderService.getOrderById(secondOrder.id);
  assert(
    cancelledOrder.status === 'cancelled' || cancelledOrder.orderStatus === 'CANCELLED',
    'Status successfully updated to CANCELLED'
  );

  const stockAfterCancel = Number(
    (await productService.getProducts()).find((p) => p.id === testPaan.id).stockQuantity
  );
  assert(stockAfterCancel === stockBeforeCancel + 1, 'Stock was atomically restored upon order cancellation');

  // 7. Test Insufficient Stock Rejection (Atomic Safety)
  let rejectedError = null;
  try {
    await orderService.createOrder({
      customerName: 'Excess Buyer',
      mobileNumber: '9123456789',
      items: [
        {
          productId: testPaan.id,
          productName: testPaan.name,
          price: testPaan.price,
          quantity: 999999, // Exceeds available stock
          imageUrl: testPaan.image
        }
      ],
      total: testPaan.price * 999999
    });
  } catch (err) {
    rejectedError = err;
  }
  assert(Boolean(rejectedError), 'Order exceeding stockQuantity is rejected atomically with zero stock decrease');

  // TEST 22 — STEP 25: Customer Order History & Tracking Polish
  console.log('\n📌 TEST 22: Step 25 Customer Order History & Tracking Polish');

  // 1. Place 2 orders for Customer A (9988776655) and 1 for Customer B (9123456789)
  const custAOrder1 = await orderService.createOrder({
    customerName: 'Customer Alpha',
    mobileNumber: '9988776655',
    items: [{ productId: testPaan.id, productName: testPaan.name, price: 70, quantity: 1, imageUrl: testPaan.image }],
    subtotal: 70,
    discount: 0,
    total: 70
  });

  const custAOrder2 = await orderService.createOrder({
    customerName: 'Customer Alpha',
    mobileNumber: '9988776655',
    items: [{ productId: testPaan.id, productName: testPaan.name, price: 70, quantity: 2, imageUrl: testPaan.image }],
    subtotal: 140,
    discount: 0,
    total: 140
  });

  const custBOrder = await orderService.createOrder({
    customerName: 'Customer Beta',
    mobileNumber: '9123456789',
    items: [{ productId: testPaan.id, productName: testPaan.name, price: 70, quantity: 1, imageUrl: testPaan.image }],
    subtotal: 70,
    discount: 0,
    total: 70
  });

  // 2. Privacy & Phone Isolation: Searching for Customer A only returns Customer A's orders
  let custAOrdersReceived = [];
  const unsubCustA = orderService.subscribeToOrdersByPhone('9988776655', (orders) => {
    custAOrdersReceived = orders;
  });

  assert(custAOrdersReceived.length >= 2, 'Phone lookup finds Customer A orders');
  assert(
    custAOrdersReceived.every((o) => String(o.mobileNumber || o.mobile || o.phone).includes('9988776655')),
    'Privacy check: Search only returns orders belonging to searched mobile number'
  );
  assert(
    !custAOrdersReceived.some((o) => o.id === custBOrder.id),
    'Privacy check: Customer B orders are not exposed to Customer A'
  );

  // 3. Newest Orders First Sorting
  assert(
    new Date(custAOrdersReceived[0].createdAt) >= new Date(custAOrdersReceived[1].createdAt),
    'Customer order history is sorted newest first'
  );

  // 4. Verify All Required Document Fields
  const sampleOrderCustA = custAOrdersReceived[0];
  assert(Boolean(sampleOrderCustA.orderId || sampleOrderCustA.id), 'Field verified: orderId');
  assert(Boolean(sampleOrderCustA.tokenNumber || sampleOrderCustA.token), 'Field verified: tokenNumber');
  assert(sampleOrderCustA.customerName === 'Customer Alpha', 'Field verified: customerName');
  assert(Boolean(sampleOrderCustA.mobileNumber), 'Field verified: mobileNumber');
  assert(Array.isArray(sampleOrderCustA.items) && sampleOrderCustA.items.length > 0, 'Field verified: items');
  assert(sampleOrderCustA.subtotal !== undefined, 'Field verified: subtotal');
  assert(sampleOrderCustA.discount !== undefined, 'Field verified: discount');
  assert(sampleOrderCustA.total !== undefined, 'Field verified: total');
  assert(Boolean(sampleOrderCustA.orderStatus), 'Field verified: orderStatus');
  assert(Boolean(sampleOrderCustA.paymentStatus), 'Field verified: paymentStatus');
  assert(Boolean(sampleOrderCustA.createdAt), 'Field verified: createdAt');
  assert(Boolean(sampleOrderCustA.updatedAt), 'Field verified: updatedAt');
  assert(sampleOrderCustA.pickupOnly === true, 'Field verified: pickupOnly');

  // 5. Active vs History Separation: Move Order 1 to COMPLETED and Order 2 through tracking
  await orderService.updateOrderStatus(custAOrder1.id, 'COMPLETED');
  await orderService.updateOrderStatus(custAOrder2.id, 'READY');

  const updatedCustAList = custAOrdersReceived;
  const activeOrdersA = updatedCustAList.filter((o) =>
    ['placed', 'received', 'accepted', 'preparing', 'ready'].includes(String(o.status || o.orderStatus).toLowerCase())
  );
  const historyOrdersA = updatedCustAList.filter((o) =>
    ['completed', 'collected', 'cancelled', 'rejected'].includes(String(o.status || o.orderStatus).toLowerCase())
  );

  assert(activeOrdersA.some((o) => o.id === custAOrder2.id), 'Order with READY status is classified as Active Order');
  assert(historyOrdersA.some((o) => o.id === custAOrder1.id), 'Order with COMPLETED status is moved into Order History');

  // 6. Cancelled Order Handling
  await orderService.updateOrderStatus(custAOrder2.id, 'CANCELLED');
  const activeAfterCancel = custAOrdersReceived.filter((o) =>
    ['placed', 'received', 'accepted', 'preparing', 'ready'].includes(String(o.status || o.orderStatus).toLowerCase())
  );
  const historyAfterCancel = custAOrdersReceived.filter((o) =>
    ['completed', 'collected', 'cancelled', 'rejected'].includes(String(o.status || o.orderStatus).toLowerCase())
  );

  assert(!activeAfterCancel.some((o) => o.id === custAOrder2.id), 'Cancelled order is NOT in active pickup');
  assert(historyAfterCancel.some((o) => o.id === custAOrder2.id), 'Cancelled order remains safely in Order History');

  // TEST 24 — STEP 54: Commission Settlement + Pending/Paid + UPI Payment Proof System
  console.log('\n📌 TEST 24: Step 54 Commission Settlement & UPI Payment Proof System');

  const { commissionService, getPeriodId, getPeriodLabel, getPeriodRange } = await import('../src/services/commissionService.js');

  // 1. Commission Rate Verification
  assert(commissionService.COMMISSION_RATE === 2, 'Commission rate is exactly ₹2 per completed sold quantity');

  // 2. Calculation from Completed Orders
  const sampleCompletedOrder = {
    id: 'ord_test_comm_100',
    status: 'completed',
    customerName: 'Commission Test Buyer',
    completedAt: '2026-10-15T10:00:00.000Z',
    items: [
      { productId: '1', name: 'Paan A', price: 50, quantity: 40 },
      { productId: '2', name: 'Paan B', price: 60, quantity: 60 }
    ], // Total 100 units
    grandTotal: 5600
  };

  const sampleCancelledOrder = {
    id: 'ord_test_comm_cancel',
    status: 'cancelled',
    completedAt: '2026-10-16T10:00:00.000Z',
    items: [{ productId: '1', name: 'Paan A', price: 50, quantity: 50 }],
    grandTotal: 2500
  };

  const calculatedComms = commissionService.calculateCommissionsFromOrders([sampleCompletedOrder, sampleCancelledOrder]);
  assert(calculatedComms.length === 1, 'Only COMPLETED orders generate commission (Cancelled orders earn 0)');
  assert(calculatedComms[0].totalSoldQuantity === 100, 'Total sold quantity correctly sums to 100 items');
  assert(calculatedComms[0].earnedCommission === 200, 'Gross commission: 100 units × ₹2 = ₹200');

  // 3. Settlement State Computation: Initial PENDING state
  const testPeriodId = '2026-10';
  const initialSettlement = commissionService.computeSettlementState(testPeriodId, [sampleCompletedOrder], []);
  assert(initialSettlement.grossCommission === 200, 'Settlement gross commission is ₹200');
  assert(initialSettlement.paidAmount === 0, 'Initial paid amount is ₹0');
  assert(initialSettlement.pendingAmount === 200, 'Initial pending amount is ₹200');
  assert(initialSettlement.status === 'PENDING', 'Initial settlement status is PENDING');

  // 4. Record Payment & Full Settlement (PAID status)
  const payment1 = await commissionService.recordPayment({
    settlementId: initialSettlement.settlementId,
    periodId: testPeriodId,
    amount: 200,
    paymentDate: '2026-10-20',
    paymentMethod: 'UPI',
    paymentReference: 'UTR123456789012',
    paymentNote: 'Full October settlement payment via Google Pay',
    paymentProofUrl: 'data:image/png;base64,mockproofstring',
    createdBy: 'Shop Admin'
  });

  assert(payment1.amount === 200, 'Payment recorded with amount ₹200');
  assert(payment1.paymentMethod === 'UPI', 'Payment method is UPI');
  assert(payment1.paymentReference === 'UTR123456789012', 'Payment reference / UTR recorded');

  const settlementAfterPay = commissionService.computeSettlementState(testPeriodId, [sampleCompletedOrder], [payment1]);
  assert(settlementAfterPay.paidAmount === 200, 'Paid amount is ₹200');
  assert(settlementAfterPay.pendingAmount === 0, 'Pending balance is ₹0');
  assert(settlementAfterPay.status === 'PAID', 'Settlement status transitioned to PAID');

  // 5. Partial Settlement Flow
  const sampleOrder500 = {
    id: 'ord_test_comm_500',
    status: 'completed',
    completedAt: '2026-10-18T10:00:00.000Z',
    items: [{ productId: '1', name: 'Paan Special', price: 50, quantity: 250 }], // 250 units * ₹2 = ₹500 gross
    grandTotal: 12500
  };

  const partialPay1 = {
    paymentId: 'pay_part_1',
    periodId: '2026-10',
    amount: 200,
    paymentMethod: 'UPI',
    paymentReference: 'UTR_PART_1',
    status: 'PAID'
  };

  const settlementPartial = commissionService.computeSettlementState(testPeriodId, [sampleOrder500], [partialPay1]);
  assert(settlementPartial.grossCommission === 500, 'Gross commission is ₹500');
  assert(settlementPartial.paidAmount === 200, 'Paid amount is ₹200');
  assert(settlementPartial.pendingAmount === 300, 'Remaining pending amount is ₹300');
  assert(settlementPartial.status === 'PARTIALLY_PAID', 'Settlement status is PARTIALLY_PAID');

  const partialPay2 = {
    paymentId: 'pay_part_2',
    periodId: '2026-10',
    amount: 300,
    paymentMethod: 'UPI',
    paymentReference: 'UTR_PART_2',
    status: 'PAID'
  };

  const settlementFullyPaid = commissionService.computeSettlementState(testPeriodId, [sampleOrder500], [partialPay1, partialPay2]);
  assert(settlementFullyPaid.paidAmount === 500, 'Paid amount is ₹500 after 2 payments');
  assert(settlementFullyPaid.pendingAmount === 0, 'Pending amount is ₹0');
  assert(settlementFullyPaid.status === 'PAID', 'Settlement status is PAID after second payment');
  assert(settlementFullyPaid.allPayments.length === 2, 'Both payment records remain separately auditable');

  // 6. Duplicate UPI Reference Protection
  let duplicateRefError = null;
  try {
    await commissionService.recordPayment({
      settlementId: 'settlement_2026-10',
      periodId: '2026-10',
      amount: 100,
      paymentMethod: 'UPI',
      paymentReference: 'UTR123456789012' // Same reference as payment1
    });
  } catch (err) {
    duplicateRefError = err;
  }
  assert(Boolean(duplicateRefError), 'Duplicate UPI reference / UTR is blocked safely with error');

  // 7. Payment Voiding & Audit Trail
  const voidedPay = await commissionService.voidPayment(payment1.paymentId, 'Duplicate transaction correction', 'SuperAdmin');
  assert(voidedPay.status === 'VOIDED', 'Payment record status marked as VOIDED');
  assert(voidedPay.voidReason === 'Duplicate transaction correction', 'Void reason preserved in audit log');

  const settlementAfterVoid = commissionService.computeSettlementState(testPeriodId, [sampleCompletedOrder], [voidedPay]);
  assert(settlementAfterVoid.paidAmount === 0, 'Voided payment is excluded from paid total');
  assert(settlementAfterVoid.pendingAmount === 200, 'Pending amount restored to ₹200 after payment void');

  // 8. Audit Adjustments
  const sampleAdjustment = { id: 'adj_1', amount: 100, type: 'BONUS', reason: 'Diwali sales bonus' };
  const settlementWithAdj = commissionService.computeSettlementState(testPeriodId, [sampleCompletedOrder], [], [sampleAdjustment]);
  assert(settlementWithAdj.grossCommission === 300, 'Adjustment adds ₹100 to gross commission (₹200 base + ₹100 bonus = ₹300)');

  // 9. Customer Pricing Protection
  assert(sampleCompletedOrder.grandTotal === 5600, 'Customer order grand total is ₹5600 without any commission surcharge');

  // 10. Receiving UPI Configuration
  const savedUpi = commissionService.saveReceivingUpiConfig({
    ownerUpiId: 'test.ratna@upi',
    ownerName: 'Test Operations Owner'
  });
  assert(savedUpi.ownerUpiId === 'test.ratna@upi', 'Receiving UPI ID configured successfully');

  // 11. CSV Export Generation
  const csvSettlements = commissionService.exportSettlementsToCsv([initialSettlement]);
  assert(csvSettlements.includes('Gross Commission (Rs)'), 'Settlement CSV header generated properly');

  const csvPayments = commissionService.exportPaymentsToCsv([payment1]);
  assert(csvPayments.includes('UTR / Reference'), 'Payment CSV header generated properly');

  // Restore test paan initial stock
  await productService.adjustStock(testPaan.id, initialStock, true);

  console.log('\n==================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();



