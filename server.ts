import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, STORES, Product, Order, User } from './src/server/database';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize server-side Gemini client
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      console.log('Gemini GenAI client successfully initialized on backend.');
    } catch (e) {
      console.error('Error initializing Gemini client:', e);
    }
  } else {
    console.log('Gemini API key is unconfigured or default placeholder, using mock simulations.');
  }

  // --- API ROUTES ---

  // Get Stores
  app.get('/api/stores', (req, res) => {
    res.json(STORES);
  });

  // Get Products
  app.get('/api/products', (req, res) => {
    res.json(db.products);
  });

  // Add Product (Shopkeeper)
  app.post('/api/products/add', (req, res) => {
    const { name, category, price, image, unit, stock, lowStockThreshold, description } = req.body;
    
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Missing required product parameters' });
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name,
      category,
      price: parseFloat(price),
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
      unit: unit || 'pcs',
      stock: parseInt(stock),
      lowStockThreshold: parseInt(lowStockThreshold || 5),
      description: description || ''
    };

    db.products.push(newProduct);
    db.save();
    res.json({ success: true, product: newProduct });
  });

  // Update Product (Shopkeeper)
  app.post('/api/products/update', (req, res) => {
    const { id, name, category, price, image, unit, stock, lowStockThreshold, description } = req.body;
    
    const prodIdx = db.products.findIndex(p => p.id === id);
    if (prodIdx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.products[prodIdx] = {
      ...db.products[prodIdx],
      name: name !== undefined ? name : db.products[prodIdx].name,
      category: category !== undefined ? category : db.products[prodIdx].category,
      price: price !== undefined ? parseFloat(price) : db.products[prodIdx].price,
      image: image !== undefined ? image : db.products[prodIdx].image,
      unit: unit !== undefined ? unit : db.products[prodIdx].unit,
      stock: stock !== undefined ? parseInt(stock) : db.products[prodIdx].stock,
      lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : db.products[prodIdx].lowStockThreshold,
      description: description !== undefined ? description : db.products[prodIdx].description
    };

    db.save();
    res.json({ success: true, product: db.products[prodIdx] });
  });

  // Delete Product
  app.post('/api/products/delete', (req, res) => {
    const { id } = req.body;
    const initialLen = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'Product not found' });
    }

    db.save();
    res.json({ success: true });
  });

  // Get Orders
  app.get('/api/orders', (req, res) => {
    const { email } = req.query;
    if (email) {
      const userOrders = db.orders.filter(o => o.customerEmail === email);
      return res.json(userOrders);
    }
    res.json(db.orders);
  });

  // Create Pre-Order
  app.post('/api/orders/create', (req, res) => {
    const { storeId, customerName, customerEmail, customerPhone, items, paymentMethod, scheduledPickupTime, notes } = req.body;

    if (!storeId || !customerName || !customerEmail || !items || !items.length) {
      return res.status(400).json({ error: 'Incomplete pre-order data.' });
    }

    // Process packing queue metrics
    const pendingOrdersCount = db.orders.filter(o => o.status === 'pending' || o.status === 'packing').length;
    // Base packing calculation: 3 minutes per unique item, plus 2 minutes per pending queue order
    const estimatedMinutes = Math.max(5, (items.length * 3) + (pendingOrdersCount * 2));

    // Resolve details, update stock, check alternatives if stock is inadequate
    const orderItemsResolved = [];
    let totalAmount = 0;

    for (const item of items) {
      const dbProd = db.products.find(p => p.id === item.productId);
      if (!dbProd) {
        return res.status(404).json({ error: `Product id ${item.productId} not found` });
      }

      // Deduct stock, allow back-orders but enforce floor zero for standard simulation
      const qtyRequested = parseInt(item.quantity) || 1;
      dbProd.stock = Math.max(0, dbProd.stock - qtyRequested);

      orderItemsResolved.push({
        productId: dbProd.id,
        productName: dbProd.name,
        price: dbProd.price,
        quantity: qtyRequested
      });

      totalAmount += dbProd.price * qtyRequested;
    }

    const uniqueId = `ord-${100 + db.orders.length + Math.floor(Math.random() * 900)}`;
    const newOrder: Order = {
      id: uniqueId,
      storeId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '+1 555-0100',
      items: orderItemsResolved,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: 'pending',
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentMethod === 'Cash' ? 'pending' : 'paid',
      scheduledPickupTime: scheduledPickupTime || 'As soon as packed',
      pickupToken: `QP-${Math.floor(1000 + Math.random() * 9000)}-${uniqueId.toUpperCase()}`,
      estimatedPackingMinutes: estimatedMinutes,
      createdAt: new Date().toISOString(),
      notes: notes || ''
    };

    db.orders.unshift(newOrder); // Add to beginning of live queue

    // Reward Loyalty Points (10 pts per full $1 spent)
    const pointsEarned = Math.floor(totalAmount * 10);
    const user = db.users.find(u => u.email === customerEmail);
    if (user) {
      user.loyaltyPoints += pointsEarned;
      if (user.loyaltyPoints > 1000) user.memberTier = 'Platinum';
      else if (user.loyaltyPoints > 500) user.memberTier = 'Gold';
      else if (user.loyaltyPoints > 200) user.memberTier = 'Silver';
    }

    db.save();
    res.json({ success: true, order: newOrder, pointsEarned });
  });

  // Re-order past order simple service
  app.post('/api/orders/reorder', (req, res) => {
    const { orderId } = req.body;
    const oldOrder = db.orders.find(o => o.id === orderId);
    if (!oldOrder) {
      return res.status(404).json({ error: 'Original order not found' });
    }

    // Map items back for verification
    const reorderedItems = oldOrder.items.map(it => ({
      productId: it.productId,
      quantity: it.quantity
    }));

    res.json({ success: true, items: reorderedItems });
  });

  // Update Status
  app.post('/api/orders/update-status', (req, res) => {
    const { orderId, status } = req.body;
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (status === 'picked_up') {
      order.paymentStatus = 'paid';
    }
    db.save();
    res.json({ success: true, order });
  });

  // Assign Packing Staff
  app.post('/api/orders/assign-staff', (req, res) => {
    const { orderId, staffName } = req.body;
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.assignedStaff = staffName;
    db.save();
    res.json({ success: true, order });
  });

  // Get Store Analytics
  app.get('/api/analytics', (req, res) => {
    const analytics = db.getSalesAnalytics();
    
    // Low stock items list
    const lowStockItems = db.products.filter(p => p.stock <= p.lowStockThreshold);

    res.json({
      revenue: analytics.revenue,
      completedOrdersCount: analytics.completedOrdersCount,
      avgOrderValue: analytics.avgOrderValue,
      categoryBreakdown: analytics.categoryBreakdown,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map(p => ({ id: p.id, name: p.name, stock: p.stock, threshold: p.lowStockThreshold }))
    });
  });

  // --- REVIEWS SYSTEM ENDPOINTS ---

  // Get Product Reviews
  app.get('/api/reviews/product', (req, res) => {
    const { productId } = req.query;
    if (productId) {
      const filtered = db.productReviews.filter(r => r.productId === productId);
      return res.json(filtered);
    }
    res.json(db.productReviews);
  });

  // Create Product Review
  app.post('/api/reviews/product', (req, res) => {
    const { productId, customerName, customerEmail, rating, comment } = req.body;
    if (!productId || !customerName || !customerEmail || rating === undefined || !comment) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const newReview = {
      id: `pr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      customerName,
      customerEmail,
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    db.productReviews.unshift(newReview);
    db.save();
    res.json({ success: true, review: newReview });
  });

  // Get Pickup Experience Reviews
  app.get('/api/reviews/pickup', (req, res) => {
    res.json(db.pickupReviews);
  });

  // Create Pickup Experience Review
  app.post('/api/reviews/pickup', (req, res) => {
    const { orderId, customerName, customerEmail, rating, comment } = req.body;
    if (!orderId || !customerName || !customerEmail || rating === undefined || !comment) {
      return res.status(400).json({ error: 'Missing required review fields.' });
    }

    const newReview = {
      id: `pkr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId,
      customerName,
      customerEmail,
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    db.pickupReviews.unshift(newReview);
    db.save();
    res.json({ success: true, review: newReview });
  });

  // Pre-configured profiles and fake logins inside dashboard
  app.post('/api/users/login', (req, res) => {
    const { email, role } = req.body;
    let found = db.users.find(u => u.email === email);
    if (!found) {
      // Auto-register
      found = {
        id: `usr-${Date.now()}`,
        email: email || 'user@example.com',
        name: email ? email.split('@')[0] : 'Guest Customer',
        phone: '+1 555-0100',
        role: role || 'customer',
        loyaltyPoints: 50,
        memberTier: 'Regular'
      };
      db.users.push(found);
      db.save();
    }
    res.json(found);
  });

  // Profile Update
  app.post('/api/users/profile/update', (req, res) => {
    const { email, name, phone } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User does not exist.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    db.save();
    res.json({ success: true, user });
  });

  // AI RECOMMENDATIONS ROUTE (Uses Gemini API under MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API)
  app.post('/api/ai/recommendations', async (req, res) => {
    const { cartItems, recentPurchases } = req.body;
    
    // Fallback static recommendation rules if Gemini is not set up
    const defaultRecs = db.products.filter(p => p.isPopular).slice(0, 3);

    if (!ai) {
      return res.json({
        recommendations: defaultRecs,
        aiExplanation: "Our smart recommendations suggest customer favorites and common organic produce items naturally paired together.",
        offer: "QuickPack Smart Deal: Get 10% off any organic groceries in your next pre-order!"
      });
    }

    try {
      const cartContext = cartItems && cartItems.length > 0 
        ? cartItems.map((c: any) => {
            const pr = db.products.find(p => p.id === c.productId);
            return pr ? `${pr.name} (category: ${pr.category})` : 'Unknown Product';
          }).join(', ')
        : 'Empty cart';

      const prompt = `You are the AI retail brain for "QuickPack".
Customer current shopping cart content: [ ${cartContext} ].
Available store catalog:
${db.products.map(p => `- Product: ${p.name}, Category: ${p.category}, Price: $${p.price}, ID: ${p.id}`).join('\n')}

Based on this category list and products list:
1. Identify up to 3 specific product IDs from the Catalog list that are highly relevant cross-sells or complementary treats.
2. Provide a short 1-line encouraging explanation about why these recommend items are curated.
3. Write a personalized promotional deal slogan.

Respond strictly in valid JSON format:
{
  "recommendedProductIds": ["p-1", "p-3"],
  "aiExplanation": "explanatory string here",
  "offer": "offer discount string here"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      const recommendedIds = parsed.recommendedProductIds || [];
      const recProducts = db.products.filter(p => recommendedIds.includes(p.id));
      
      res.json({
        recommendations: recProducts.length > 0 ? recProducts : defaultRecs,
        aiExplanation: parsed.aiExplanation || "Complementary fresh items suggested based on your category focus.",
        offer: parsed.offer || "Special 10% Bundle Deal Applied on Checkout!"
      });

    } catch (e: any) {
      console.error('Error generating suggestions with Gemini:', e);
      res.json({
        recommendations: defaultRecs,
        aiExplanation: "Intelligent match suggestions resolved from our store catalog algorithm.",
        offer: "Get double reward loyalty points on bakery items today!"
      });
    }
  });

  // AI VOICE/CHAT PARSER ROUTE (Transforms natural speech/text command into Shopping Cart Items!)
  app.post('/api/ai/voice-command', async (req, res) => {
    const { sentence } = req.body;
    if (!sentence) {
      return res.status(400).json({ error: 'Please enter a query sentence.' });
    }

    const catalogList = db.products.map(p => ({ id: p.id, name: p.name }));

    if (!ai) {
      // Safe fallback offline match logic for demo purposes
      // Match words like "bananas", "milk", "bread", "apples", etc.
      const sentenceLower = sentence.toLowerCase();
      const matched: { product: Product; quantity: number }[] = [];
      
      for (const p of db.products) {
        const noun = p.name.split(' ').pop()?.toLowerCase() || '';
        if (noun && sentenceLower.includes(noun)) {
          // extract likely quantity (look for numbers preceding)
          let quantity = 1;
          const matchNum = sentenceLower.match(new RegExp(`(\\d+)\\s*${noun}`));
          if (matchNum && matchNum[1]) {
            quantity = parseInt(matchNum[1]);
          }
          matched.push({ product: p, quantity });
        }
      }

      return res.json({
        recognizedText: sentence,
        matchedItems: matched,
        aiNote: "Analyzed your message using our localized search lookup. (Simulated voice input parsing)"
      });
    }

    try {
      const prompt = `You are "QuickPack Voice Ordering Intelligence".
Analyze the user's shopping request sentence: "${sentence}".
Match it against our exact official items list:
${JSON.stringify(catalogList)}

Extract all requested items. For each item:
1. Locate the closest matched product ID from the list.
2. Determine the requested quantity (default is 1 if unspecified).

Output ONLY a JSON array, exactly like this format:
[
  {"productId": "p-1", "quantity": 2},
  {"productId": "p-3", "quantity": 1}
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const parsedArray = JSON.parse(response.text || '[]');
      const matchedList = [];
      
      for (const item of parsedArray) {
        const matchingProd = db.products.find(p => p.id === item.productId);
        if (matchingProd) {
          matchedList.push({
            product: matchingProd,
            quantity: Math.max(1, parseInt(item.quantity) || 1)
          });
        }
      }

      res.json({
        recognizedText: sentence,
        matchedItems: matchedList,
        aiNote: `Parsed "${sentence}" successfully using Gemini AI.`
      });

    } catch (e) {
      console.error('Error in Voice Parsing:', e);
      res.status(500).json({ error: 'Failed to process prompt voice syntax.' });
    }
  });

  // AI PICKUP TIME PREDICTION ROUTE
  app.post('/api/ai/predict-pickup', async (req, res) => {
    const { itemsCount, scheduledTime, trafficLevel, distanceKm } = req.body;

    const baseMins = 5 + (itemsCount * 2);
    const activeStaff = 2; // Simulated staff count

    if (!ai) {
      // Simulated pickup time delay logic
      const trafficDelay = trafficLevel === 'heavy' ? 15 : trafficLevel === 'moderate' ? 8 : 2;
      const travelMins = Math.round(distanceKm * 3);
      const totalMinutesToReady = baseMins + Math.round((2 / activeStaff) * 3);
      const arrivalStatus = (travelMins >= totalMinutesToReady) 
        ? "Safe! Your order will be packed and ready before your arrival."
        : `Tight window! Your order will take ${totalMinutesToReady} mins to prepare, but your commute is only ${travelMins} mins. Consider picking up 5 mins later.`;

      return res.json({
        totalMinutesToReady,
        travelMins,
        arrivalStatus,
        aiRecommendation: `We recommend planning your departure for ${scheduledTime || 'As soon as possible'}. Live counter shows 2 packs ahead.`
      });
    }

    try {
      const prompt = `Calculate the QuickPack retail packaging prediction:
- Number of items to pack: ${itemsCount}
- Number of packers scheduled: ${activeStaff}
- Live pending queue order count: 3
- Customer's scheduled pickup: ${scheduledTime}
- Customer Commute: ${distanceKm} km with ${trafficLevel} traffic conditions.

Assess if the customer should leave now or postpone, factoring in packing duration.
Respond in valid JSON format:
{
  "totalMinutesToReady": 12,
  "travelMins": 15,
  "arrivalStatus": "status string assessment here",
  "aiRecommendation": "direct action-oriented pick recommendation here"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);

    } catch (e) {
      res.json({
        totalMinutesToReady: baseMins + 4,
        travelMins: Math.round(distanceKm * 2.5),
        arrivalStatus: "Order ready window is standard.",
        aiRecommendation: `Please head to the pickup locker. Live updates are visible in your app!`
      });
    }
  });

  // --- VITE MIDDLEWARE SETUP FOR DEV VS STATIC PROD ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuickPack Server running on http://localhost:${PORT}`);
  });
}

startServer();
