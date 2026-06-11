import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Mic, 
  MapPin, 
  Clock, 
  QrCode, 
  User as UserIcon, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  AlertTriangle, 
  CornerDownRight, 
  RotateCcw, 
  Volume2, 
  HelpCircle, 
  FileText,
  CreditCard,
  Smartphone,
  Sparkles,
  ArrowRight,
  Sparkle,
  MessageSquareOff,
  Bell,
  RefreshCw,
  TrendingDown,
  Globe,
  Scissors
} from 'lucide-react';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { Store, Product, CartItem, Order, User, AIPickupPrediction, AIRecommendationResponse, ProductReview, PickupReview } from './types';

// Preseeded Stores List
const STORES: Store[] = [
  { id: 'store-1', name: 'QuickPack SuperMarket - Downtown', address: '128 Main St, Downtown', gps: { lat: 40.7128, lng: -74.0060 }, phone: '+1 555-0101' },
  { id: 'store-2', name: 'QuickPack Organic Grocer - West End', address: '492 West Ave, West End', gps: { lat: 40.7589, lng: -73.9851 }, phone: '+1 555-0102' },
  { id: 'store-3', name: 'QuickPack Daily Express - Central', address: 'Terminal 2, Central Station', gps: { lat: 40.7306, lng: -73.9352 }, phone: '+1 555-0103' }
];

// Supported Languages Configuration
const LANGUAGES = {
  en: {
    heroTitle: "PRE-ORDER & BYPASS THE LINE",
    heroSubtitle: "Packed in advance, ready the moment you walk in. Enjoy AI-assisted express pickup shopping.",
    categoryAll: "All Categories",
    voicePlaceholder: "Try saying: 'I need 3 organic bananas, a carton of whole milk and 1 sourdough bread'",
    cartTitle: "Your Pre-Order Cart",
    commutePlanner: "AI Pickup & Commute Optimizer",
    placeOrder: "Confirm Pre-Order",
    activeTracker: "Pre-order Status Tracker",
    shopkeeperDashboard: "Store Management Suite",
    incomingQueue: "Live Packing Queue",
    inventoryManager: "Inventory & Stock Room",
    revenueToday: "Revenue Today",
    activeOrdersLabel: "Active Orders",
    readyPickupLabel: "Ready for Pickup",
    predictedSurge: "AI Demand Insights",
    loyaltyTier: "Loyalty Status"
  },
  hi: {
    heroTitle: "प्री-ऑर्डर करें और लाइन से बचें",
    heroSubtitle: "पहले से पैक, आपके स्टोर में कदम रखते ही तैयार। एआई-संचालित एक्सप्रेस पिकअप सुविधा।",
    categoryAll: "सभी श्रेणियां",
    voicePlaceholder: "बोलें: 'मुझे 3 केले, एक लीटर दूध और एक ब्रेड चाहिए'",
    cartTitle: "आपका प्री-ऑर्डर कार्ट",
    commutePlanner: "एआई पिकअप और यात्रा अनुकूलक",
    placeOrder: "प्री-ऑर्डर की पुष्टि करें",
    activeTracker: "कार्ट स्थिति और लाइव ट्रैकर",
    shopkeeperDashboard: "दुकानदार डैशबोर्ड",
    incomingQueue: "लाइव पैकिंग कतार",
    inventoryManager: "इन्वेंट्री और उत्पाद सूची",
    revenueToday: "आज की कुल आय",
    activeOrdersLabel: "सक्रिय ऑर्डर",
    readyPickupLabel: "पिकअप के लिए तैयार",
    predictedSurge: "AI मांग पूर्वानुमान",
    loyaltyTier: "वफादारी स्तर"
  },
  es: {
    heroTitle: "RESERVA Y SÁLTATE LA COLA",
    heroSubtitle: "Empacado con anticipación, listo al instante. Compras express con asistencia de Inteligencia Artificial.",
    categoryAll: "Todas las Categorías",
    voicePlaceholder: "Diga: 'Necesito 3 plátanos orgánicos, 1 leche entera y un pan de masa madre'",
    cartTitle: "Tu Carrito de Pre-Pedido",
    commutePlanner: "Optimización de Tráfico e IA",
    placeOrder: "Confirmar Reserva",
    activeTracker: "Estado del Pedido en Vivo",
    shopkeeperDashboard: "Consola del Vendedor",
    incomingQueue: "Cola de Empaque en Vivo",
    inventoryManager: "Gestión de Inventario",
    revenueToday: "Ingresos de Hoy",
    activeOrdersLabel: "Pedidos Activos",
    readyPickupLabel: "Listo para Recoger",
    predictedSurge: "AI Predicción de Demanda",
    loyaltyTier: "Nivel de Lealtad"
  }
};

export default function App() {
  // Session / Multi-role State
  const [currentRole, setCurrentRole] = useState<'customer' | 'shopkeeper'>('customer');
  const [lang, setLang] = useState<'en' | 'hi' | 'es'>('en');
  const text = LANGUAGES[lang];

  // Store lists & selected store
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1');
  
  // App data list states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // App alert / notification messages
  const [alerts, setAlerts] = useState<{ id: string; type: 'info' | 'success'; title: string; body: string }[]>([]);

  // User details (Mock login switch inside client)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState('john@example.com');
  const [userNameInput, setUserNameInput] = useState('John Doe');
  const [userPhoneInput, setUserPhoneInput] = useState('+1 555-0192');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Customer Catalog Selection & Filtration
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shopping Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // AI Voice Assistant State
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceBanner, setVoiceBanner] = useState<string | null>(null);

  // AI commute prediction input states
  const [commuteDistance, setCommuteDistance] = useState<number>(3.5);
  const [trafficLevel, setTrafficLevel] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [scheduledTime, setScheduledTime] = useState<string>('12:30 PM');
  const [aiPrediction, setAiPrediction] = useState<AIPickupPrediction | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // AI recommendations (Cart context dependent)
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [aiRecExplanation, setAiRecExplanation] = useState('');
  const [aiRecOffer, setAiRecOffer] = useState('');
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Pre-Order Placement UI inputs
  const [paymentOption, setPaymentOption] = useState<'UPI' | 'Card' | 'Cash'>('UPI');
  const [specialNotes, setSpecialNotes] = useState('');

  // Shopkeeper form inputs for adding/editing products
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Fruits & Vegetables');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newProdThreshold, setNewProdThreshold] = useState('5');
  const [newProdUnit, setNewProdUnit] = useState('pack');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  // Analytics State
  const [storeAnalytics, setStoreAnalytics] = useState<any>({
    revenue: 0,
    completedOrdersCount: 0,
    avgOrderValue: 0,
    categoryBreakdown: [],
    lowStockCount: 0,
    lowStockItems: []
  });

  // Verification QR Modal state
  const [qrToVerify, setQrToVerify] = useState<string>('');
  const [qrVerificationResult, setQrVerificationResult] = useState<{ foundOrder?: Order; message?: string } | null>(null);

  // Review & Rating State variables
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [pickupReviews, setPickupReviews] = useState<PickupReview[]>([]);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // Review submission inputs
  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(null);
  const [overallRating, setOverallRating] = useState<number>(5);
  const [overallComment, setOverallComment] = useState<string>('');
  const [productRatings, setProductRatings] = useState<{ [productId: string]: { rating: number; comment: string } }>({});
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // Helper lists
  const categories = ['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Snacks & Munchies', 'Beverages'];
  const staffMembers = ['David Packman', 'Rahul Sharma', 'Sofia Lopez', 'Bob Packer'];

  // Init Data
  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchOrders();
    fetchAnalytics();
    fetchProductReviews();
    fetchPickupReviews();
    triggerDemoLogin('john@example.com', 'customer');
  }, []);

  // Sync AI Recommendations whenever cart items change
  useEffect(() => {
    fetchAIRecommendations();
  }, [cart]);

  // Alert simulation helper
  const addAlert = (title: string, body: string, type: 'info' | 'success' = 'info') => {
    const freshAlert = { id: `alert-${Date.now()}`, type, title, body };
    setAlerts(prev => [freshAlert, ...prev]);
    // Auto remove after 8 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== freshAlert.id));
    }, 8000);
  };

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      setStores(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setStoreAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const res = await fetch('/api/reviews/product');
      const data = await res.json();
      setProductReviews(data);
    } catch (e) {
      console.error('Error fetching product reviews:', e);
    }
  };

  const fetchPickupReviews = async () => {
    try {
      const res = await fetch('/api/reviews/pickup');
      const data = await res.json();
      setPickupReviews(data);
    } catch (e) {
      console.error('Error fetching pickup reviews:', e);
    }
  };

  const submitPickupReview = async (orderId: string) => {
    try {
      const res = await fetch('/api/reviews/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName: currentUser?.name || 'Anonymous Customer',
          customerEmail: currentUser?.email || 'anonymous@example.com',
          rating: overallRating,
          comment: overallComment
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchPickupReviews();
      }
    } catch (e) {
      console.error('Error submitting pickup review:', e);
    }
  };

  const submitProductReview = async (productId: string, rating: number, comment: string) => {
    try {
      const res = await fetch('/api/reviews/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerName: currentUser?.name || 'Anonymous Customer',
          customerEmail: currentUser?.email || 'anonymous@example.com',
          rating,
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProductReviews();
      }
    } catch (e) {
      console.error('Error submitting product review:', e);
    }
  };

  const handleFullReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewOrderId) return;

    // Submit overall pickup review
    await submitPickupReview(activeReviewOrderId);

    // Submit product reviews for rated products
    const promises = Object.keys(productRatings).map(prodId => {
      const pr = productRatings[prodId];
      if (pr.comment || pr.rating > 0) {
        return submitProductReview(prodId, pr.rating || 5, pr.comment || 'Great quality.');
      }
      return Promise.resolve();
    });

    await Promise.all(promises);

    setIsReviewFormOpen(false);
    setActiveReviewOrderId(null);
    setOverallComment('');
    setOverallRating(5);
    setProductRatings({});
    addAlert("Review Lodged Successfully", "Your overall rating and product reviews have been stored live on the shop counter.", "success");
  };

  const triggerDemoLogin = async (email: string, role: 'customer' | 'shopkeeper') => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();
      setCurrentUser(data);
      if (data.role === 'customer') {
        setUserEmail(data.email);
        setUserNameInput(data.name);
        setUserPhoneInput(data.phone);
      }
      addAlert(`Welcome Back, ${data.name}!`, `Logged in as ${data.role === 'customer' ? 'Customer Profile' : 'Shop Manager Agent'}.`, 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, name: userNameInput, phone: userPhoneInput })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsUpdatingProfile(false);
        addAlert("Profile Updated", "Your pre-order contact points were synchronized successfully.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI-Powered cross-sell recommendation fetcher
  const fetchAIRecommendations = async () => {
    if (cart.length === 0) {
      setAiRecommendations([]);
      setAiRecExplanation('');
      setAiRecOffer('');
      return;
    }
    setIsLoadingRecs(true);
    try {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart })
      });
      const data: AIRecommendationResponse = await res.json();
      setAiRecommendations(data.recommendations || []);
      setAiRecExplanation(data.aiExplanation || '');
      setAiRecOffer(data.offer || '');
    } catch (e) {
      console.error("AI recommendations error:", e);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Process voice/NLP shopping sentence
  const handleVoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery.trim()) return;
    setIsVoiceProcessing(true);
    setVoiceBanner(null);

    try {
      const res = await fetch('/api/ai/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: voiceQuery })
      });
      const data = await res.json();
      
      if (data.matchedItems && data.matchedItems.length > 0) {
        // Add items to existing cart
        const updatedCart = [...cart];
        for (const item of data.matchedItems) {
          const idx = updatedCart.findIndex(c => c.productId === item.product.id);
          if (idx > -1) {
            updatedCart[idx].quantity += item.quantity;
          } else {
            updatedCart.push({ productId: item.product.id, quantity: item.quantity });
          }
        }
        setCart(updatedCart);
        setVoiceBanner(`AI Added: ${data.matchedItems.map((m: any) => `${m.quantity}x ${m.product.name}`).join(', ')}`);
        addAlert("Voice Cart Sync", `Parsed input: "${voiceQuery}"`, "success");
      } else {
        setVoiceBanner("Found 0 product matches in current inventory. Please try another phrasing.");
      }
    } catch (err) {
      console.error(err);
      setVoiceBanner("Syntax error processing custom query.");
    } finally {
      setIsVoiceProcessing(false);
      setVoiceQuery('');
    }
  };

  // AI Predict Commute & Packing Time
  const predictPickupTime = async () => {
    setIsPredicting(true);
    try {
      const itemCount = cart.reduce((acc, c) => acc + c.quantity, 0);
      const res = await fetch('/api/ai/predict-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemsCount: itemCount || 3,
          scheduledTime,
          trafficLevel,
          distanceKm: commuteDistance
        })
      });
      const data = await res.json();
      setAiPrediction(data);
      addAlert("AI Prediction Active", "Estimated travel and preparation timeline adjusted.", "info");
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  // Add Item to Shopping Cart
  const addToCart = (productId: string) => {
    const copy = [...cart];
    const idx = copy.findIndex(item => item.productId === productId);
    if (idx > -1) {
      copy[idx].quantity += 1;
    } else {
      copy.push({ productId, quantity: 1 });
    }
    setCart(copy);
    addAlert("Added to Cart", `Product added to your QuickPack basket.`, 'info');
  };

  // Adjust item quantities
  const updateCartQuantity = (productId: string, delta: number) => {
    const copy = [...cart];
    const idx = copy.findIndex(item => item.productId === productId);
    if (idx === -1) return;

    const newQty = copy[idx].quantity + delta;
    if (newQty <= 0) {
      copy.splice(idx, 1);
    } else {
      copy[idx].quantity = newQty;
    }
    setCart(copy);
  };

  // Place pre-order
  const handlePreOrderPlacement = async () => {
    if (cart.length === 0) return;
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStoreId,
          customerName: currentUser?.name || 'Guest User',
          customerEmail: currentUser?.email || 'john@example.com',
          customerPhone: currentUser?.phone || '+1 555-0100',
          items: itemsPayload,
          paymentMethod: paymentOption,
          scheduledPickupTime: scheduledTime,
          notes: specialNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setCart([]);
        setSpecialNotes('');
        setAiPrediction(null);
        fetchOrders();
        fetchProducts(); // Refresh stocks
        fetchAnalytics();
        
        // Refresh User points dynamically
        if (currentUser) {
          triggerDemoLogin(currentUser.email, 'customer');
        }

        addAlert(
          "Pre-Order Placed!",
          `Order ID ${data.order.id} transmitted to staff. Your unique token is ${data.order.pickupToken}. Ready in ~${data.order.estimatedPackingMinutes}m!`,
          'success'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger past order Re-Order
  const handlePastReorder = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (data.success && data.items) {
        // Merge into current active cart
        const updatedCart = [...cart];
        for (const item of data.items) {
          const idx = updatedCart.findIndex(c => c.productId === item.productId);
          if (idx > -1) {
            updatedCart[idx].quantity += item.quantity;
          } else {
            updatedCart.push({ productId: item.productId, quantity: item.quantity });
          }
        }
        setCart(updatedCart);
        addAlert("Quick Re-order Added", "Items from your past transaction have been loaded into your active basket.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Shopkeeper Status Toggles (Live Feed Pipeline)
  const updateOrderStatus = async (orderId: string, nextStatus: 'pending' | 'packing' | 'ready' | 'picked_up' | 'cancelled') => {
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        fetchAnalytics();
        addAlert("Status Transformed", `Order ${orderId} updated to state: ${nextStatus.toUpperCase()}`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Staff Assignment Shopkeeper
  const assignStaffToOrder = async (orderId: string, staffName: string) => {
    try {
      const res = await fetch('/api/orders/assign-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, staffName })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        addAlert("Staff Assigned", `Packer ${staffName} assigned to pre-order ${orderId}`, "info");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Product (Create or Update)
  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock) return;

    try {
      const isEdit = !!isEditingProduct;
      const url = isEdit ? '/api/products/update' : '/api/products/add';
      const payload = {
        id: isEdit ? isEditingProduct.id : undefined,
        name: newProdName,
        category: newProdCategory,
        price: parseFloat(newProdPrice),
        stock: parseInt(newProdStock),
        lowStockThreshold: parseInt(newProdThreshold),
        unit: newProdUnit,
        description: newProdDesc,
        image: newProdImage || undefined
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        fetchAnalytics();
        setIsAddingProduct(false);
        setIsEditingProduct(null);
        resetProductForm();
        addAlert(
          isEdit ? "Product Information Saved" : "Catalog Extended",
          `Success saving ${newProdName} to store database shelves.`,
          "success"
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Product
  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}" from store catalogs?`)) return;
    try {
      const res = await fetch('/api/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        fetchAnalytics();
        addAlert("Product Discarded", `Deleted ${name} from our digital systems.`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyQRForm = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenClean = qrToVerify.trim().toUpperCase();
    const found = orders.find(o => o.pickupToken.toUpperCase() === tokenClean || o.id.toUpperCase() === tokenClean);
    
    if (found) {
      setQrVerificationResult({
        foundOrder: found,
        message: `MATCH CONFIRMED! Pre-ordered by ${found.customerName}. Mode: ${found.paymentMethod} ($${found.totalAmount}). Status: ${found.status.toUpperCase()}`
      });
    } else {
      setQrVerificationResult({
        message: "TOKEN VALIDATION FAILURE: Code is either forged, expired or from a external store branch."
      });
    }
  };

  const triggerQRScanVerifyDemo = (token: string) => {
    setQrToVerify(token);
    const found = orders.find(o => o.pickupToken === token);
    if (found) {
      setQrVerificationResult({
        foundOrder: found,
        message: `MATCH CONFIRMED. Customer ${found.customerName} verified at the counter layout.`
      });
    }
  };

  const resetProductForm = () => {
    setNewProdName('');
    setNewProdCategory('Fruits & Vegetables');
    setNewProdPrice('');
    setNewProdStock('');
    setNewProdThreshold('5');
    setNewProdUnit('pack');
    setNewProdDesc('');
    setNewProdImage('');
  };

  const openEditProductModal = (prod: Product) => {
    setIsEditingProduct(prod);
    setNewProdName(prod.name);
    setNewProdCategory(prod.category);
    setNewProdPrice(prod.price.toString());
    setNewProdStock(prod.stock.toString());
    setNewProdThreshold(prod.lowStockThreshold.toString());
    setNewProdUnit(prod.unit);
    setNewProdDesc(prod.description);
    setNewProdImage(prod.image);
    setIsAddingProduct(true); // Share form view
  };

  // Helper getters
  const activeCustomerOrders = orders.filter(
    o => o.customerEmail === currentUser?.email && o.status !== 'picked_up' && o.status !== 'cancelled'
  );
  const historicCustomerOrders = orders.filter(
    o => o.customerEmail === currentUser?.email && (o.status === 'picked_up' || o.status === 'cancelled')
  );

  const filteredProducts = products.filter(p => {
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const getStoreName = (id: string) => {
    return STORES.find(s => s.id === id)?.name || "Downtown Shop";
  };

  // Compute Basket metrics
  const cartSubtotal = cart.reduce((acc, item) => {
    const prod = products.find(p => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const appliedLoyaltyDiscount = (currentUser?.loyaltyPoints || 0) > 100 ? 2.50 : 0.00;
  const deliveryTaxFee = cart.length > 0 ? 0.85 : 0;
  const cartTotal = Math.max(0, cartSubtotal - appliedLoyaltyDiscount + deliveryTaxFee);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans antialiased overflow-x-hidden flex flex-col selection:bg-white selection:text-black">
      
      {/* Dynamic Push/SMS Alerts Area */}
      <div id="alerts-container" className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
        {alerts.map(a => (
          <div 
            key={a.id} 
            className={`p-4 border-2 rounded-none shadow-[4px_4px_0px_#000] transition-all bg-black transform translate-y-0 ${
              a.type === 'success' ? 'border-emerald-500 text-emerald-400' : 'border-blue-500 text-blue-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 shrink-0" />
                <span className="font-mono text-xs uppercase tracking-widest font-black">QuickPack SMS Alert</span>
              </div>
              <button onClick={() => setAlerts(prev => prev.filter(x => x.id !== a.id))} className="text-white/40 hover:text-white font-mono text-xs">✕</button>
            </div>
            <h4 className="font-bold text-sm text-white mt-1 uppercase tracking-tight">{a.title}</h4>
            <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>

      {/* Top Utility Bar Navigation */}
      <header className="border-b border-white/10 bg-[#0F0F0F] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="text-2xl font-black italic tracking-tighter bg-white text-black px-3 py-1 scale-105 shadow-[3px_3px_0px_#2563EB]">
              QUICKPACK.
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 border border-white/10 px-2 py-0.5 rounded-xs hidden md:inline">
              Smart Pre-Order Ecosystem
            </span>
          </div>

          {/* Mode switch, Language & User simulation */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Regional Translation switch */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-white/60" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as any)}
                className="bg-transparent text-white focus:outline-none font-bold text-xs uppercase cursor-pointer"
              >
                <option className="bg-black" value="en">English (EN)</option>
                <option className="bg-black" value="hi">हिन्दी (IN)</option>
                <option className="bg-black" value="es">Español (ES)</option>
              </select>
            </div>

            {/* Profile trigger */}
            {currentRole === 'customer' && currentUser && (
              <button 
                onClick={() => setIsUpdatingProfile(!isUpdatingProfile)}
                className="flex items-center gap-2 bg-[#1A1A1A] border border-white/15 px-3 py-1.5 text-xs hover:border-white/40"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center font-black text-[9px] uppercase">
                  {currentUser.name.slice(0, 2)}
                </div>
                <div className="text-left">
                  <p className="font-bold text-[10px] leading-tight">{currentUser.name}</p>
                  <p className="text-[9px] text-yellow-400 font-mono tracking-tighter">★ {currentUser.loyaltyPoints} PTS ({currentUser.memberTier})</p>
                </div>
              </button>
            )}

            {/* Main Role Toggle */}
            <div className="flex items-center border-2 border-white/20 p-0.5 bg-black">
              <button 
                onClick={() => { setCurrentRole('customer'); triggerDemoLogin('john@example.com', 'customer'); }}
                className={`px-4 py-1.5 font-black uppercase text-xs transition-colors ${
                  currentRole === 'customer' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Customer Mode
              </button>
              <button 
                onClick={() => { setCurrentRole('shopkeeper'); triggerDemoLogin('alice@quickpack.com', 'shopkeeper'); }}
                className={`px-4 py-1.5 font-black uppercase text-xs transition-colors ${
                  currentRole === 'shopkeeper' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Shop Staff Mode
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Profile Edit Pop-down Drawer */}
      {isUpdatingProfile && currentRole === 'customer' && (
        <div className="bg-[#141414] border-b-2 border-blue-600 py-6 px-4">
          <div className="max-w-xl mx-auto bg-black border border-white/15 p-6 shadow-[5px_5px_0px_rgba(255,255,255,0.05)]">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Update Contact Points & Membership</h3>
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={userNameInput} 
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 px-3 py-2 text-sm focus:border-white focus:outline-none font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Mobile Phone for SMS Alerts</label>
                <input 
                  type="text" 
                  value={userPhoneInput} 
                  onChange={(e) => setUserPhoneInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 px-3 py-2 text-sm focus:border-white focus:outline-none font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Switch Mock User Profile</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button 
                    type="button" 
                    onClick={() => { triggerDemoLogin('john@example.com', 'customer'); }}
                    className="p-2 border border-white/10 text-xs font-mono hover:bg-white/5 text-left"
                  >
                    John Doe (Silver Member)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { triggerDemoLogin('sarah@example.com', 'customer'); }}
                    className="p-2 border border-white/10 text-xs font-mono hover:bg-white/5 text-left"
                  >
                    Sarah Jenkins (New)
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsUpdatingProfile(false)}
                  className="px-4 py-2 border border-white/20 text-xs font-black uppercase hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-black uppercase shadow-[2px_2px_0px_#000]"
                >
                  Save Sync Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* main content wrappers */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">

        {/* CUSTOMER MODE */}
        {currentRole === 'customer' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* HERO PROMOTION BAR BANNER */}
            <div className="relative bg-teal-950/20 border-2 border-white/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden">
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1 bg-blue-600 px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold text-white">
                  <Sparkle className="w-3 h-3 animate-spin" /> Bypass Queue
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none text-white">
                  {text.heroTitle}
                </h2>
                <p className="max-w-2xl text-xs md:text-sm text-white/60 font-medium">
                  {text.heroSubtitle}
                </p>
              </div>

              {/* Multi-Store Branch Selector */}
              <div className="shrink-0 w-full md:w-auto bg-[#111] p-4 border border-white/15 space-y-2">
                <div className="flex items-center gap-1 bg-emerald-950/50 text-emerald-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                  <MapPin className="w-3 h-3 shrink-0" /> Local Branch Integrated GPS
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-black text-white/40">Select Store Nearest to You</span>
                  <select 
                    value={selectedStoreId} 
                    onChange={(e) => {
                      setSelectedStoreId(e.target.value);
                      addAlert("Store Switched", `Connected to ${getStoreName(e.target.value)} catalog inventory and live staff.`, "info");
                    }}
                    className="bg-[#1E1E1E] border border-white/20 p-2 text-xs font-bold text-white w-full md:w-64 focus:outline-none"
                  >
                    {STORES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (~{s.id === 'store-1' ? '1.2' : s.id === 'store-2' ? '3.5' : '5.1'} km)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-white/40 italic text-right">
                  📍 {STORES.find(s => s.id === selectedStoreId)?.address}
                </p>
              </div>
            </div>

            {/* TWO COLUMN SHOPPING SPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: PRODUCTS CATALOG & CATEGORIES & SEARCH */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Search Bar and Smart Voice Search */}
                <div className="bg-[#111] border border-white/10 p-4 space-y-3">
                  <div className="flex items-center gap-3 bg-[#181818] border border-white/10 px-3 py-1.5 focus-within:border-white transition-colors">
                    <Search className="w-4 h-4 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Search for apples, dairy, milk, bread..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none text-sm text-white focus:outline-none w-full font-bold"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white text-xs font-mono">CLEAR</button>
                    )}
                  </div>

                  {/* AI Smart Input Text Helper */}
                  <form onSubmit={handleVoiceSubmit} className="space-y-1.5 border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black tracking-wider text-teal-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-teal-400" /> AI Natural Voice & Command Parser
                      </span>
                      <span className="text-[9px] text-white/30 font-mono">BETA</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          placeholder={text.voicePlaceholder}
                          value={voiceQuery}
                          onChange={(e) => setVoiceQuery(e.target.value)}
                          className="w-full bg-[#181818] border border-white/15 px-3 py-2 text-xs focus:outline-none text-white italic"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setVoiceQuery("Please add 2 Fresh Whole Milk and 3 Red Gala Apples for our breakfast");
                            addAlert("Sample Voice Script Loaded", "Click 'Process' to invoke AI NLP parser.", "info");
                          }}
                          className="absolute right-2 top-2 text-[9px] font-mono tracking-tighter bg-white/10 hover:bg-white/20 px-1.5 py-0.5"
                        >
                          Fill Sample
                        </button>
                      </div>
                      <button 
                        type="submit"
                        disabled={isVoiceProcessing}
                        className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-4 py-2 font-black uppercase text-xs shrink-0 flex items-center gap-1"
                      >
                        {isVoiceProcessing ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            Process
                          </>
                        )}
                      </button>
                    </div>
                    {voiceBanner && (
                      <div className="p-2.5 bg-teal-950/20 border border-teal-800/40 text-teal-300 font-mono text-[11px] flex justify-between">
                        <span>💡 {voiceBanner}</span>
                        <button type="button" onClick={() => setVoiceBanner(null)} className="text-white hover:text-white/60">✕</button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Categories Scroll layout */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 font-black uppercase text-xs select-none tracking-tight shrink-0 ${
                        selectedCategory === cat 
                          ? 'bg-white text-black font-extrabold' 
                          : 'border border-white/10 hover:border-white text-white/70 hover:text-white'
                      }`}
                    >
                      {cat === 'All' ? text.categoryAll : cat}
                    </button>
                  ))}
                </div>

                {/* PRODUCT LIST GRID */}
                <div>
                  <div className="flex justify-between items-baseline mb-4 border-b border-white/10 pb-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      Available Stock Feed ({filteredProducts.length} Items)
                    </h3>
                    <p className="text-xs text-white/40">Category: <span className="font-bold text-white">{selectedCategory}</span></p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredProducts.map(prod => {
                      const isLowStock = prod.stock <= prod.lowStockThreshold;
                      const isOutOfStock = prod.stock === 0;

                      return (
                        <div 
                          key={prod.id} 
                          className="bg-[#111] border border-white/15 flex flex-col justify-between hover:border-white/30 transition-all group p-4 relative"
                        >
                          {/* Stock status indicator tag */}
                          <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                            {isOutOfStock ? (
                              <span className="bg-red-600 text-white font-mono text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="bg-yellow-500 text-black font-mono text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 animate-pulse">
                                Low Stock: {prod.stock}
                              </span>
                            ) : (
                              <span className="bg-emerald-950/60 text-emerald-400 font-mono text-[9px] tracking-tight px-1.5 py-0.5 border border-emerald-800/50">
                                {prod.stock} Left
                              </span>
                            )}
                            
                            {prod.isPopular && (
                              <span className="bg-blue-600 text-white font-mono text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                                Popular
                              </span>
                            )}
                          </div>

                          {/* Image & Main Body */}
                          <div className="space-y-3">
                            <div className="relative aspect-square w-full bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                              <img 
                                src={prod.image} 
                                alt={prod.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400">
                                  {prod.category}
                                </span>
                                {/* Customer average rating displays */}
                                {(() => {
                                  const prodReviewsList = productReviews.filter(r => r.productId === prod.id);
                                  const totalRatingStars = prodReviewsList.reduce((sum, r) => sum + r.rating, 0);
                                  const avgRating = prodReviewsList.length > 0 ? (totalRatingStars / prodReviewsList.length).toFixed(1) : null;

                                  return avgRating ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedProductForReviews(prod);
                                        setIsReviewsModalOpen(true);
                                      }}
                                      className="flex items-center gap-1 text-[11px] font-bold text-yellow-400 bg-yellow-950/20 hover:bg-yellow-950/40 px-1.5 py-0.5 border border-yellow-800/30 transition-colors"
                                      title="Click to view all reviews"
                                      id={`view-reviews-${prod.id}`}
                                    >
                                      <span>★</span>
                                      <span className="text-white hover:text-yellow-300 font-mono text-[10px]">{avgRating} ({prodReviewsList.length})</span>
                                    </button>
                                  ) : (
                                    <span className="text-[9px] text-white/30 italic">No reviews</span>
                                  );
                                })()}
                              </div>
                              <h4 className="font-bold text-md text-white line-clamp-2 uppercase tracking-tight mt-1">
                                {prod.name}
                              </h4>
                              <p className="text-xs text-white/55 line-clamp-2 mt-1 min-h-[2rem]">
                                {prod.description || "Fresh premium quality item selected specially for your quick retail pickup."}
                              </p>
                            </div>
                          </div>

                          {/* Price & Add to Cart button */}
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-white/40 uppercase font-mono">Price</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black">${prod.price.toFixed(2)}</span>
                                <span className="text-xs text-white/40 font-mono">/ {prod.unit}</span>
                              </div>
                            </div>

                            {isOutOfStock ? (
                              <button 
                                disabled
                                className="bg-white/5 border border-white/10 text-white/30 px-3 py-2 text-xs font-black uppercase cursor-not-allowed"
                              >
                                Out
                              </button>
                            ) : (
                              <button 
                                onClick={() => addToCart(prod.id)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-black uppercase tracking-tight transition-colors flex items-center gap-1 shadow-[2px_2px_0px_#000]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Pre-order
                              </button>
                            )}
                          </div>

                          {/* Emergency Out of stock alternative indicator mock */}
                          {isOutOfStock && (
                            <div className="mt-2 bg-red-950/20 border border-red-800/40 p-2 text-[10px] text-red-300">
                              ⚠️ Out of Stock Alternative Option: Ask assistant inside note to substitute with general equivalent brand.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SMART AI COMPANION / LIVE PRE-ORDER RECOMMENDATIONS */}
                {cart.length > 0 && (
                  <div className="bg-[#111] border-2 border-dashed border-teal-500/40 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-teal-400 animate-bounce" />
                        <h4 className="text-lg font-black uppercase tracking-tight text-teal-400">
                          AI Smart Companion Cross-Sells & Deals
                        </h4>
                      </div>
                      <span className="font-mono text-xs text-teal-400 font-bold bg-teal-950/50 px-2 py-0.5 border border-teal-900">
                        {isLoadingRecs ? "Thinking..." : "Gemini Recommended"}
                      </span>
                    </div>

                    {isLoadingRecs ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-white/90 italic bg-white/5 p-3 border-l-4 border-l-teal-500 leading-relaxed">
                          "{aiRecExplanation || 'Add fresh bananas or artisanal sourdough to automatically unlock specific basket recommendations matching your lifestyle.'}"
                        </p>

                        {aiRecOffer && (
                          <div className="font-mono text-xs font-black uppercase tracking-wider text-teal-400 bg-teal-950/30 p-2 border border-teal-900/60 flex items-center justify-between">
                            <span>🎁 Promo Code Unlocked:</span>
                            <span className="bg-teal-500 text-black px-2 py-0.5">{aiRecOffer}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                          {aiRecommendations.map(prod => (
                            <div key={prod.id} className="bg-black border border-white/10 p-3 flex items-center justify-between gap-3 group">
                              <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover border border-white/5" />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-xs text-white truncate uppercase">{prod.name}</h5>
                                <p className="text-[10px] text-teal-400 font-mono font-bold">${prod.price.toFixed(2)}</p>
                              </div>
                              <button 
                                onClick={() => addToCart(prod.id)}
                                className="bg-white text-black p-1.5 hover:bg-teal-400 transition-colors shrink-0"
                                title="Add Recommended Item"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT: SMART PRE-ORDER CART, COMMUTE OPTIMIZER AND PLACEMENT */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. SHOPPING BASKET CONTAINER */}
                <div className="bg-[#111] border-2 border-white p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-blue-500" />
                      <h3 className="font-black uppercase tracking-tight text-xl">
                        {text.cartTitle}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-black bg-white text-black px-2.5 py-0.5">
                      {cart.reduce((ac, x) => ac + x.quantity, 0)} Items
                    </span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-white/30 space-y-3">
                      <ShoppingBag className="w-10 h-10 mx-auto opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Your Pre-Order Basket is empty</p>
                      <p className="text-[10px] text-white/40 italic">Explore item listings & click 'Pre-order' to initialize dynamic timelines.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Items list */}
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {cart.map(item => {
                          const prod = products.find(p => p.id === item.productId);
                          if (!prod) return null;

                          return (
                            <div key={item.productId} className="flex items-center justify-between gap-3 bg-black border border-white/10 p-3">
                              <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover border border-white/5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-white uppercase truncate">{prod.name}</h4>
                                <p className="text-xs text-white/40 font-mono font-bold">${prod.price.toFixed(2)} / {prod.unit}</p>
                              </div>

                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-1 py-0.5">
                                <button 
                                  onClick={() => updateCartQuantity(item.productId, -1)}
                                  className="text-white/60 hover:text-white px-1.5 font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="font-mono text-xs font-black px-1 text-white">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.productId, 1)}
                                  className="text-white/60 hover:text-white px-1.5 font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Loyalty status and discount banner */}
                      <div className="bg-blue-600/10 border border-blue-500/20 p-3 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkle className="w-3 h-3 text-yellow-400 animate-spin" /> Loyalty Member Discount
                          </span>
                          <span className="font-mono text-[10px] text-yellow-400 font-bold uppercase">{currentUser?.memberTier} Level</span>
                        </div>
                        <p className="text-[10px] text-white/55 leading-snug">
                          {(currentUser?.loyaltyPoints || 0) > 100 
                            ? "Over 100 pts! Silver reward applied automatically ($2.50 discount on total pre-order)."
                            : "Earn 10 loyalty points for every $1 spent. Collect 100 points for absolute discounts."
                          }
                        </p>
                      </div>

                      {/* 2. LIVE COMMUTE & PREPARATION DELAY PREDICTOR */}
                      <div className="border border-white/10 p-4 space-y-3 bg-black">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black tracking-widest text-teal-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {text.commutePlanner}
                          </span>
                          <span className="text-[9px] bg-teal-500 text-black font-black uppercase px-1.5 py-0.2">AI PREDICT</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="block text-[9px] uppercase tracking-wider text-white/40 mb-1">Your Commute Distance ({commuteDistance} km)</label>
                            <input 
                              type="range" 
                              min="0.5" 
                              max="12" 
                              step="0.5"
                              value={commuteDistance}
                              onChange={(e) => setCommuteDistance(parseFloat(e.target.value))}
                              className="w-full h-1 bg-white/20 accent-teal-400 appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] text-white/30 mt-1 font-mono">
                              <span>0.5 km (Near Shop)</span>
                              <span>12 km (City Borders)</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider text-white/40 mb-1">Current Traffic</label>
                              <select 
                                value={trafficLevel} 
                                onChange={(e) => setTrafficLevel(e.target.value as any)}
                                className="bg-[#1E1E1E] border border-white/20 p-1 bg-black text-[11px] text-white w-full font-bold uppercase"
                              >
                                <option value="light">Light traffic (🏎️)</option>
                                <option value="moderate">Moderate conditions</option>
                                <option value="heavy">Heavy standstill (🛑)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider text-white/40 mb-1">Target Pickup Time</label>
                              <input 
                                type="text" 
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="bg-[#1E1E1E] border border-white/20 p-1 text-[11px] text-white w-full font-mono font-bold"
                              />
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={predictPickupTime}
                            disabled={isPredicting}
                            className="bg-white/10 hover:bg-white/15 px-3 py-1.5 w-full text-center text-xs font-black uppercase tracking-wider text-teal-300 border border-teal-500/30"
                          >
                            {isPredicting ? "Analyzing Staff Pack Queue..." : "Analyze Prep Timeline"}
                          </button>

                          {aiPrediction && (
                            <div className="p-3 bg-teal-950/20 border-l-[3px] border-teal-500 text-teal-100 space-y-1.5">
                              <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[10px] text-emerald-400">⚡ PREDICTED RESULTS</span>
                                <span className="font-mono text-[9px] text-white/40">Ready in ~{aiPrediction.totalMinutesToReady} mins</span>
                              </div>
                              <p className="text-[11px] leading-tight text-white/90">
                                {aiPrediction.arrivalStatus}
                              </p>
                              <p className="text-[10px] text-teal-300 italic leading-snug">
                                Recommended Action: {aiPrediction.aiRecommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Option */}
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-white/40">Payment Option</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['UPI', 'Card', 'Cash'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPaymentOption(opt as any)}
                              className={`p-2 border font-bold text-xs uppercase text-center transition-colors ${
                                paymentOption === opt 
                                  ? 'border-blue-500 bg-blue-950/45 text-white font-extrabold' 
                                  : 'border-white/10 hover:border-white/30 text-white/60 hover:text-white'
                              }`}
                            >
                              {opt === 'UPI' ? 'UPI (Instant)' : opt === 'Card' ? 'Card / Wallet' : 'Pay at Counter'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special instructions */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Add Note for Packers / Alternatives</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Please choose green bananas, or substitute with brand B. Bag beautifully."
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          className="w-full bg-[#181818] border border-white/10 px-3 py-2 text-xs focus:outline-none focus:border-white italic text-white"
                        />
                      </div>

                      {/* Price breakdown and checkout */}
                      <div className="border-t border-white/15 pt-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/50">Items subtotal</span>
                          <span className="font-mono text-white">${cartSubtotal.toFixed(2)}</span>
                        </div>
                        {appliedLoyaltyDiscount > 0 && (
                          <div className="flex justify-between text-yellow-400">
                            <span>Membership loyal deduction</span>
                            <span className="font-mono">-${appliedLoyaltyDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-white/50">Micropacking fees & taxes</span>
                          <span className="font-mono text-white">${deliveryTaxFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold">
                          <span className="uppercase font-black text-white">Estimated Total</span>
                          <span className="font-mono text-white text-lg font-black">${cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={handlePreOrderPlacement}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm py-3 tracking-widest shadow-[3px_3px_0px_#2563EB] transition-transform active:translate-y-0.5"
                      >
                        {text.placeOrder} (${cartTotal.toFixed(2)})
                      </button>
                    </div>
                  )}
                </div>

                {/* HELP CARD FAQ */}
                <div className="p-4 bg-[#111] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    How express pickup works:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-white/60 text-[11px]">
                    <li>Select category & pre-order products</li>
                    <li>Simulate travel arrival parameters</li>
                    <li>Staff pack immediately with real assignment tracking</li>
                    <li>Walk in and show the QR token. Done in 30 seconds!</li>
                  </ol>
                </div>

              </div>

            </div>

            {/* DYNAMIC TRACKERS & ORDERS HISTORY IN CONTINUOUS SHEET VIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-white/15 pt-8">
              
              {/* LARGE QUEUE PREPARATION AND DIGITAL PICKUP TICKETS */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{text.activeTracker}</h3>
                  <p className="text-xs text-white/40">Watch packing workers pick and process your groceries in real time dashboard pipeline.</p>
                </div>

                {activeCustomerOrders.length === 0 ? (
                  <div className="py-12 bg-[#111] border border-white/15 text-center text-white/30 space-y-2">
                    <Clock className="w-8 h-8 mx-auto opacity-20 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest">No active pre-order tickets at present</p>
                    <p className="text-[10px] text-white/40">Launch your express grocery pickup pre-order to view live progression trackers & QR code.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeCustomerOrders.map(ord => {
                      const progressPercentage = 
                        ord.status === 'pending' ? 15 :
                        ord.status === 'packing' ? 55 :
                        ord.status === 'ready' ? 100 : 0;

                      return (
                        <div key={ord.id} className="bg-[#111] border border-white/15 p-6 space-y-6">
                          
                          {/* Ticket Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-black uppercase tracking-tight text-white">Pre-Order #{ord.id}</span>
                                <span className={`px-2.5 py-0.5 text-[9px] uppercase font-black font-mono tracking-wider ${
                                  ord.status === 'ready' ? 'bg-emerald-500 text-black animate-pulse' :
                                  ord.status === 'packing' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                                }`}>
                                  {ord.status.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[11px] text-white/50 font-mono mt-1">
                                Store: {getStoreName(ord.storeId)} • Placed: {new Date(ord.createdAt).toLocaleTimeString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] text-white/40 uppercase font-mono mb-1">Assigned Staff</p>
                              <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 text-xs">
                                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                                <span className="font-bold text-white text-[11px]">
                                  {ord.assignedStaff || "Waiting for staff queue..."}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Split layout: tracking line & invoice + QR */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            
                            {/* Tracking left */}
                            <div className="md:col-span-12 lg:col-span-8 space-y-4">
                              
                              {/* Visual Progress bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-mono tracking-tight text-white/50">
                                  <span>1. Ordered</span>
                                  <span className={ord.status === 'packing' || ord.status === 'ready' ? 'text-blue-400 font-bold' : ''}>2. Packing Stream</span>
                                  <span className={ord.status === 'ready' ? 'text-emerald-400 font-extrabold' : ''}>3. Ready at Gate</span>
                                </div>
                                <div className="h-3.5 bg-white/5 border border-white/15 p-0.5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-1000" 
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Alert simulation box */}
                              <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                                <p className="text-xs font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                                  <Smartphone className="w-4 h-4 text-emerald-400" /> Live Simulated Notifications
                                </p>
                                <p className="text-[11px] text-white/75 leading-relaxed font-mono">
                                  {ord.status === 'pending' && `📱 "QuickPack Alert: Pre-order ${ord.id} received. Staff preparing. Estimated packing time: ~${ord.estimatedPackingMinutes} minutes."`}
                                  {ord.status === 'packing' && `📱 "QuickPack Alert: ${ord.assignedStaff || 'Staff'} has collected your ticket basket and is picking fresh products from shelves."`}
                                  {ord.status === 'ready' && `📱 "QuickPack Alert: PACKED & SEALED! Your express order of ${ord.items.length} items is loaded in locker block B. Walk in, scan the QR code to pick up instantaneously."`}
                                </p>
                              </div>

                              {/* Invoice details list */}
                              <div className="space-y-2 text-xs border border-white/10 p-3 bg-black">
                                <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Invoice Summary</p>
                                <div className="divide-y divide-white/5 space-y-1 max-h-40 overflow-y-auto">
                                  {ord.items.map((item, id) => (
                                    <div key={id} className="flex justify-between py-1 text-white/80">
                                      <span>{item.quantity}x {item.productName}</span>
                                      <span className="font-mono text-white/60">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline font-bold">
                                  <span>{ord.paymentMethod} • {ord.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Arrive'}</span>
                                  <span className="text-md text-white font-black">${ord.totalAmount.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Digital Ticket QR Card Right */}
                            <div className="md:col-span-12 lg:col-span-4 flex flex-col items-center justify-center p-2 bg-[#1A1A1A] border-2 border-white/15">
                              <p className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-2 text-center">Express Counter Pass</p>
                              <QRCodeDisplay token={ord.pickupToken} />
                              <p className="text-[9px] text-white/40 italic mt-2 text-center">Counter staff can verify instantly using pickup logs</p>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PAST ORDERS ARCHIVE */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight">Order History</h3>
                <p className="text-xs text-white/40">Re-order high-frequency groceries instantly with 1-Click mapping.</p>

                {historicCustomerOrders.length === 0 ? (
                  <p className="text-xs text-white/30 italic">No past pre-orders completed yet. Start shopping downtown!</p>
                ) : (
                  <div className="space-y-4">
                    {historicCustomerOrders.map(ord => (
                      <div key={ord.id} className="bg-[#111] border border-white/10 p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-xs text-white uppercase">#{ord.id}</span>
                            <p className="text-[10px] text-white/40 font-mono">{new Date(ord.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${ord.status === 'picked_up' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-red-950/65 text-red-400'}`}>
                            {ord.status}
                          </span>
                        </div>

                        <div className="text-xs text-white/70 max-h-16 overflow-y-auto font-mono">
                          {ord.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-white/10">
                          <span className="text-xs font-black text-white">${ord.totalAmount.toFixed(2)}</span>
                          <div className="flex gap-1.5">
                            {ord.status === 'picked_up' && (() => {
                              const existingReview = pickupReviews.find(r => r.orderId === ord.id);
                              
                              if (existingReview) {
                                return (
                                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-900/10 px-2 py-1 border border-emerald-800/40 flex items-center gap-0.5" id={`rated-badge-${ord.id}`}>
                                    ★ {existingReview.rating} Rated
                                  </span>
                                );
                              }

                              return (
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setActiveReviewOrderId(ord.id);
                                    setOverallRating(5);
                                    setOverallComment('');
                                    const initialRatings: typeof productRatings = {};
                                    ord.items.forEach(it => {
                                      initialRatings[it.productId] = { rating: 5, comment: '' };
                                    });
                                    setProductRatings(initialRatings);
                                    setIsReviewFormOpen(true);
                                  }}
                                  className="bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 flex items-center gap-0.5"
                                  id={`rate-button-${ord.id}`}
                                >
                                  ★ Rate Experience
                                </button>
                              );
                            })()}
                            <button 
                              type="button" 
                              onClick={() => handlePastReorder(ord.id)}
                              className="bg-white hover:bg-neutral-200 text-black text-[10px] font-black uppercase tracking-wider px-2 py-1 flex items-center gap-1"
                              id={`reorder-button-${ord.id}`}
                            >
                              <RotateCcw className="w-3 h-3" /> Quick Reorder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* SHOPKEEPER / STAFF DASHBOARD */}
        {currentRole === 'shopkeeper' && (
          <div className="space-y-8 animate-fade-in text-[#F5F5F5]">

            {/* DASHBOARD HEADER */}
            <div className="p-8 border-2 border-emerald-500 bg-[#111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter">
                  {text.shopkeeperDashboard}
                </h1>
                <p className="text-teal-400 font-mono text-xs uppercase tracking-widest mt-1">
                  OFFICIAL TERMINAL CLIENT • LOC: DOWNTOWN STATION 04
                </p>
              </div>

              {/* STATS QUICK OVERVIEW */}
              <div className="flex gap-4 flex-wrap">
                <div className="text-right border-l-2 border-emerald-500 pl-4">
                  <p className="text-4xl font-black text-white">${storeAnalytics.revenue || 0}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{text.revenueToday}</p>
                </div>
                <div className="text-right border-l-2 border-white/20 pl-4">
                  <p className="text-4xl font-black text-white">{orders.filter(o => o.status === 'pending' || o.status === 'packing').length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{text.activeOrdersLabel}</p>
                </div>
                <div className="text-right border-l-2 border-emerald-500 pl-4">
                  <p className="text-4xl font-black text-emerald-400">{orders.filter(o => o.status === 'ready').length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{text.readyPickupLabel}</p>
                </div>
              </div>
            </div>

            {/* LIVE PACKING QUEUE & QR COUNTER VERIFIER */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT: THE LIVE ORDER STREAM */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{text.incomingQueue}</h2>
                  <div className="flex gap-2 text-[10px] font-bold uppercase">
                    <span className="px-2 py-0.5 bg-white text-black">Newest Incoming</span>
                    <button onClick={fetchOrders} className="px-2 py-0.5 border border-white/10 text-white hover:bg-white/5 font-mono flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Sync Feed
                    </button>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-white/30 italic py-12 text-center bg-[#111] border border-white/10">No orders received in database history yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map(ord => {
                      const isReady = ord.status === 'ready';
                      const isPickedUp = ord.status === 'picked_up';
                      const isPending = ord.status === 'pending';
                      const isPacking = ord.status === 'packing';
                      const isCancelled = ord.status === 'cancelled';

                      return (
                        <div 
                          key={ord.id} 
                          className={`border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors ${
                            isReady ? 'bg-emerald-900/10 border-l-4 border-l-emerald-500 border-white/10' :
                            isPacking ? 'bg-blue-900/10 border-l-4 border-l-blue-500 border-white/10' :
                            isPickedUp ? 'bg-black opacity-60 border-white/5' :
                            isCancelled ? 'bg-red-950/10 border-red-900/30 text-white/40' :
                            'bg-white/5 border-white/15 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex-1 min-w-0 space-y-3">
                            {/* Header details */}
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-black opacity-40">#{ord.id}</span>
                              <h3 className="text-xl font-bold text-white truncate uppercase">{ord.customerName}</h3>
                              <span className="text-xs text-white/40 font-mono">({ord.customerPhone})</span>
                            </div>

                            {/* Ordered items listing */}
                            <div className="bg-black/60 p-3 border border-white/5 rounded-xs space-y-1">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">Packaging Packing List</span>
                              <div className="text-xs font-mono text-white/80 space-y-0.5">
                                {ord.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>• {it.quantity}x {it.productName}</span>
                                    <span className="text-white/40">${(it.price * it.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Metadata and instructions */}
                            <div className="text-xs space-y-1">
                              <p className="text-white/60">
                                <span className="font-bold text-white uppercase font-mono">Scheduled:</span> {ord.scheduledPickupTime} • Estimated Packing Duration: <span className="text-teal-400 font-bold">{ord.estimatedPackingMinutes} mins</span>
                              </p>
                              {ord.notes && (
                                <p className="text-yellow-400 italic bg-yellow-950/10 p-2 border border-yellow-900/30 text-[11px]">
                                  ✍️ Instructions: "{ord.notes}"
                                </p>
                              )}
                            </div>

                            {/* Staff Assignment widget */}
                            {!isPickedUp && !isCancelled && (
                              <div className="flex items-center gap-3 pt-2">
                                <span className="text-[10px] uppercase tracking-wider text-white/40">Assign Packing Staff:</span>
                                <div className="flex items-center gap-2">
                                  <select 
                                    value={ord.assignedStaff || ''} 
                                    onChange={(e) => assignStaffToOrder(ord.id, e.target.value)}
                                    className="bg-[#222] border border-white/20 p-1 text-xs text-white focus:outline-none"
                                  >
                                    <option value="">-- Assign Packer --</option>
                                    {staffMembers.map(st => (
                                      <option key={st} value={st}>{st}</option>
                                    ))}
                                  </select>
                                  {ord.assignedStaff && (
                                    <span className="bg-blue-600/20 text-blue-400 border border-blue-800 px-2 py-0.5 text-[10px] uppercase font-bold font-mono">
                                      Active Staff
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Control actions */}
                          <div className="shrink-0 flex flex-col md:items-end justify-center gap-3">
                            <div className="text-left md:text-right">
                              <p className="text-xl font-mono font-black">${ord.totalAmount.toFixed(2)}</p>
                              <span className={`text-[10px] uppercase font-black px-1.5 py-0.2 select-none ${
                                ord.paymentStatus === 'paid' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-red-950/40 text-red-400 border border-red-900'
                              }`}>
                                {ord.paymentStatus === 'paid' ? 'Paid (Online)' : 'Cash on Pickup'}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              {isPending && (
                                <button 
                                  onClick={() => updateOrderStatus(ord.id, 'packing')}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider px-4 py-2 shadow-[2px_2px_0px_#000]"
                                >
                                  Take order & Start Packing
                                </button>
                              )}
                              {isPacking && (
                                <button 
                                  onClick={() => updateOrderStatus(ord.id, 'ready')}
                                  className="bg-white text-black hover:bg-neutral-200 font-black uppercase text-xs tracking-wider px-4 py-2"
                                >
                                  Mark Packaged & Sealed
                                </button>
                              )}
                              {isReady && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => triggerQRScanVerifyDemo(ord.pickupToken)}
                                    className="border border-white/40 hover:border-white text-white px-3 py-2 text-xs font-black uppercase tracking-tight"
                                  >
                                    Autofill QR Verify
                                  </button>
                                  <button 
                                    onClick={() => updateOrderStatus(ord.id, 'picked_up')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider px-4 py-2 shadow-[2px_2px_0px_#000]"
                                  >
                                    Handover Complete
                                  </button>
                                </div>
                              )}
                              
                              {!isPickedUp && !isCancelled && (
                                <button 
                                  onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                                  className="text-red-400 hover:text-red-300 text-[10px] uppercase text-right hover:underline"
                                >
                                  Cancel / Reject Pre-order
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: MANUAL COUNTER INVOICE & QR PICKUP SCANNER SIMULATOR */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* QR Code and Token Scanner verification block */}
                <div className="bg-[#111] border-2 border-white p-6 space-y-4">
                  <h3 className="font-black uppercase tracking-tight text-xl flex items-center gap-1.5">
                    <QrCode className="w-5 h-5 text-emerald-400" /> Counter Verification
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-mono">
                    When the pickup customer steps to the desk, verify their digital token or pre-order ID below.
                  </p>

                  <form onSubmit={handleVerifyQRForm} className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Enter Pickup QR Token or Order ID</label>
                      <input 
                        type="text" 
                        value={qrToVerify}
                        onChange={(e) => setQrToVerify(e.target.value)}
                        placeholder="e.g. QP-2311-ORD-101"
                        className="w-full bg-[#1A1A1A] border-2 border-white/20 p-2 text-center text-sm font-mono font-bold tracking-wider text-white uppercase focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white w-full py-2 text-xs font-black uppercase tracking-wider"
                    >
                      Authenticate Token Code
                    </button>
                  </form>

                  {qrVerificationResult && (
                    <div className="p-4 bg-black border border-white/10 text-xs shadow-inner space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest font-mono">Scan Authentication Log</span>
                        <p className={`mt-1 font-mono font-bold ${
                          qrVerificationResult.foundOrder ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {qrVerificationResult.message}
                        </p>
                      </div>

                      {qrVerificationResult.foundOrder && (
                        <div className="space-y-2 border-t border-white/10 pt-2 font-mono">
                          <p className="text-white/80">
                            Customer: <span className="font-extrabold text-white">{qrVerificationResult.foundOrder.customerName}</span>
                          </p>
                          <p className="text-[11px] text-white/60">
                            Instructions received: "{qrVerificationResult.foundOrder.notes || 'None'}"
                          </p>
                          <button 
                            type="button" 
                            onClick={() => { 
                              updateOrderStatus(qrVerificationResult.foundOrder!.id, 'picked_up');
                              setQrVerificationResult(null);
                              setQrToVerify('');
                            }}
                            className="bg-white text-black px-3 py-1.5 text-[10px] font-black uppercase w-full mt-2"
                          >
                            Mark Picked Up & Close Invoice
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* AI Demand Forecasting Insights Alert */}
                <div className="p-6 bg-blue-600/10 border border-blue-500/20 space-y-2 text-xs">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 animate-spin text-blue-400" /> {text.predictedSurge}
                  </p>
                  <p className="italic font-medium leading-relaxed">
                    "Weekly analytics indicate high demand for local organic farm items during noon commutes. Sourdough stocks are pre-booked up to 80%."
                  </p>
                </div>

                {/* Customer CRM quick register simulator */}
                <div className="border border-white/10 p-4 space-y-3 bg-black">
                  <span className="text-[10px] uppercase font-black text-white/40 tracking-wider block">Staff Quick CRM Logs</span>
                  <div className="space-y-2 text-xs">
                    <p className="text-white/60">Manage counter records of active customers in the rewards directory.</p>
                    <div className="divide-y divide-white/5 space-y-1 border-t border-white/10 pt-2">
                      <div className="flex justify-between text-white py-1">
                        <span>John Doe</span>
                        <span className="font-mono text-yellow-400 font-bold">★ 340 PTS (Silver)</span>
                      </div>
                      <div className="flex justify-between text-white py-1">
                        <span>Sarah Jenkins</span>
                        <span className="font-mono text-white/40 font-bold">★ 50 PTS (Regular)</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </section>

            {/* REAL-TIME CUSTOMER REVIEWS & FEEDBACK HUB */}
            <section className="bg-[#111] p-8 border-2 border-amber-600 space-y-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <span className="text-amber-500">★</span> Customer Reviews & Feedback Hub
                  </h2>
                  <p className="text-xs text-white/40">Read live reports on order pickup staff performance and product freshness rating diagnostics.</p>
                </div>
                
                {/* Aggregate metrics */}
                <div className="flex gap-4 flex-wrap">
                  {(() => {
                    const avgPickup = pickupReviews.length > 0 
                      ? (pickupReviews.reduce((s, r) => s + r.rating, 0) / pickupReviews.length).toFixed(1) 
                      : '0.0';
                    const avgProduct = productReviews.length > 0
                      ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
                      : '0.0';
                    return (
                      <>
                        <div className="bg-white/5 border border-white/10 px-4 py-2 text-center" id="stat-pickup-rating">
                          <p className="text-2xl font-mono font-black text-amber-400">★ {avgPickup} / 5.0</p>
                          <p className="text-[9px] uppercase tracking-wider text-white/40">Pickup Rating ({pickupReviews.length})</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 py-2 text-center" id="stat-product-rating">
                          <p className="text-2xl font-mono font-black text-yellow-400">★ {avgProduct} / 5.0</p>
                          <p className="text-[9px] uppercase tracking-wider text-white/40">Product Quality ({productReviews.length})</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
                
                {/* LEFT: Overall Pickup Experience Reviews */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs uppercase font-black text-amber-500 border-b border-amber-500/20 pb-1.5 block tracking-wide font-mono">
                    Pickup Experience Reviews ({pickupReviews.length})
                  </span>
                  
                  {pickupReviews.length === 0 ? (
                    <div className="p-8 border border-white/5 text-center text-white/30 italic font-mono bg-black/40">
                      No overall pickup experience checks received.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
                      {pickupReviews.map(r => (
                        <div key={r.id} className="bg-black/60 border border-white/10 p-3.5 space-y-2 hover:border-white/20 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white uppercase text-xs">{r.customerName}</p>
                              <p className="text-[10px] text-white/40 font-mono">Order: <span className="text-amber-400 font-extrabold uppercase">#{r.orderId}</span> • {new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex text-amber-400 font-mono bg-amber-950/20 border border-amber-800/40 px-1.5 py-0.5 rounded text-[10px]">
                              {Array.from({ length: r.rating }).map((_, i) => "★")}
                            </div>
                          </div>
                          <p className="text-white/80 leading-relaxed italic bg-white/5 p-2 font-mono border-l-2 border-amber-500">
                            "{r.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Individual Product Food Items reviews */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs uppercase font-black text-yellow-500 border-b border-yellow-500/20 pb-1.5 block tracking-wide font-mono">
                    Product Store Reviews ({productReviews.length})
                  </span>

                  {productReviews.length === 0 ? (
                    <div className="p-8 border border-white/5 text-center text-white/30 italic font-mono bg-black/40">
                      No specific store products rated yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
                      {productReviews.map(r => {
                        const matchingItem = products.find(p => p.id === r.productId);
                        return (
                          <div key={r.id} className="bg-black/60 border border-white/10 p-3.5 space-y-2.5 hover:border-white/20 transition-all">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-2">
                                {matchingItem && (
                                  <img 
                                    src={matchingItem.image} 
                                    alt={matchingItem.name} 
                                    className="w-8 h-8 object-cover border border-white/15" 
                                  />
                                )}
                                <div>
                                  <span className="font-black text-white text-[11px] uppercase truncate max-w-[170px] sm:max-w-xs block">{matchingItem ? matchingItem.name : "Unknown Item"}</span>
                                  <span className="text-[10px] text-white/40 block">{r.customerName} • {new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex text-yellow-400 font-mono bg-yellow-950/20 border border-yellow-800/40 px-1.5 py-0.5 rounded text-[10px]">
                                {Array.from({ length: r.rating }).map((_, i) => "★")}
                              </div>
                            </div>
                            <p className="text-white/80 leading-relaxed font-mono">
                              "{r.comment}"
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </section>

            {/* PRODUCT CATALOG INVENTORY MANAGEMENT */}
            <section className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-4">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{text.inventoryManager}</h2>
                  <p className="text-xs text-white/40">Keep prices accurate, check low stock alarms, and edit catalog products instantly.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => { resetProductForm(); setIsEditingProduct(null); setIsAddingProduct(!isAddingProduct); }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider px-4 py-2 shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Product to Catalog
                  </button>
                </div>
              </div>

              {/* Add / Edit product inline drawer */}
              {isAddingProduct && (
                <div className="bg-[#111] border-2 border-[#2563EB] p-6 max-w-2xl mx-auto">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4">
                    {isEditingProduct ? `Edit ${isEditingProduct.name}` : "Create New Catalog Entry"}
                  </h3>
                  
                  <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Product Title / Brand Name</label>
                      <input 
                        type="text" 
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Premium Avocado Sack"
                        className="w-full bg-black border border-white/20 p-2 text-sm focus:border-white focus:outline-none text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Category</label>
                      <select 
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full bg-black border border-white/20 p-2 text-xs focus:border-white focus:outline-none text-white font-bold"
                      >
                        {categories.filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Price ($ USD)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="e.g. 4.99"
                        className="w-full bg-black border border-white/20 p-2 text-sm focus:border-white focus:outline-none text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Quantity Stock Value</label>
                      <input 
                        type="number" 
                        required
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="e.g. 25"
                        className="w-full bg-black border border-white/20 p-2 text-sm focus:border-white focus:outline-none text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Low Stock Threshold Alerts Trigger</label>
                      <input 
                        type="number" 
                        required
                        value={newProdThreshold}
                        onChange={(e) => setNewProdThreshold(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-black border border-white/20 p-2 text-sm focus:border-white focus:outline-none text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Selling Unit descriptor</label>
                      <input 
                        type="text" 
                        required
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                        placeholder="e.g. loaf, bunch, 1kg pack"
                        className="w-full bg-black border border-white/20 p-2 text-sm focus:border-white focus:outline-none text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Image URL</label>
                      <input 
                        type="text" 
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        placeholder="Unsplash image URL or leave blank for groceries placeholder"
                        className="w-full bg-black border border-white/20 p-2 text-xs focus:border-white focus:outline-none text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Item Description Summary</label>
                      <textarea 
                        value={newProdDesc}
                        onChange={(e) => setNewProdDesc(e.target.value)}
                        placeholder="Describe origin, weight, nutritional metrics if applicable..."
                        className="w-full bg-black border border-white/20 p-2 text-xs focus:border-white focus:outline-none text-white block h-20"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/10">
                      <button 
                        type="button" 
                        onClick={() => { setIsAddingProduct(false); setIsEditingProduct(null); resetProductForm(); }}
                        className="border border-white/20 px-4 py-2 text-xs font-black uppercase hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-[#2563EB] hover:bg-blue-500 text-white px-5 py-2 text-xs font-black uppercase cursor-pointer"
                      >
                        Save product
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* LOW STOCK ALERTS HIGHLIGHT WINDOW */}
              {storeAnalytics.lowStockCount > 0 && (
                <div className="bg-red-500/10 border-l-4 border-l-red-500 border border-white/10 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h4 className="text-lg font-black uppercase tracking-tight">
                      LOW STOCK ALARM STATUS ({storeAnalytics.lowStockCount} Products Flagged)
                    </h4>
                  </div>
                  <p className="text-xs text-white/70">
                    These items are below safety stock thresholds. Click Quick Restock inside table to restore immediate inventory count to 50 items.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {storeAnalytics.lowStockItems.map((itm: any) => (
                      <div key={itm.id} className="bg-black border border-white/10 px-3 py-2 flex items-center gap-3">
                        <div>
                          <p className="font-bold text-xs text-white uppercase">{itm.name}</p>
                          <p className="font-mono text-[10px] text-red-400">Only {itm.stock} left (Safety trigger: {itm.threshold})</p>
                        </div>
                        <button 
                          onClick={async () => {
                            await fetch('/api/products/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: itm.id, stock: 50 })
                            });
                            fetchProducts();
                            fetchAnalytics();
                            addAlert("Stock Restored", `Restocked ${itm.name} to 50 pieces.`, "success");
                          }}
                          className="bg-white hover:bg-neutral-200 text-black px-2 py-1 text-[9px] font-black uppercase"
                        >
                          Restock (50)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PRODUCTS INVENTORY DATABASE TABLE */}
              <div className="bg-[#111] border border-white/10 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/15 bg-black/40 font-mono text-[10px] uppercase tracking-widest text-white/50">
                      <th className="p-4">Item details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock level</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-sans text-xs">
                    {products.map(itm => {
                      const isLow = itm.stock <= itm.lowStockThreshold;

                      return (
                        <tr key={itm.id} className="hover:bg-white/5">
                          <td className="p-4 flex items-center gap-3">
                            <img src={itm.image} alt={itm.name} className="w-10 h-10 object-cover border border-white/5" />
                            <div>
                              <p className="font-bold text-white uppercase">{itm.name}</p>
                              <p className="text-[10px] text-white/40 font-mono">ID: {itm.id} • Unit: {itm.unit}</p>
                            </div>
                          </td>
                          <td className="p-4 uppercase tracking-wider font-semibold text-white/70">
                            {itm.category}
                          </td>
                          <td className="p-4 font-mono font-bold text-white text-sm">
                            ${itm.price.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold text-sm ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                                {itm.stock} units
                              </span>
                              {isLow && (
                                <span className="bg-red-950/40 text-red-500 border border-red-900/60 font-mono text-[8.5px] px-1.5 py-0.2 rounded-xs uppercase">
                                  Alert
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex gap-2">
                              <button 
                                onClick={() => openEditProductModal(itm)}
                                className="p-1.5 border border-white/10 hover:border-white text-white/60 hover:text-white"
                                title="Edit Item details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => deleteProduct(itm.id, itm.name)}
                                className="p-1.5 border border-red-900/30 hover:border-red-600 text-red-400/70 hover:text-red-400"
                                title="Delete Item from shelves"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 mt-auto bg-[#0A0A0A] text-white/40">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-4">
            <h4 className="text-white font-black italic tracking-tighter text-lg uppercase bg-white text-black px-2 py-0.5 inline-block">QUICKPACK.</h4>
            <p className="max-w-sm text-balance">
              Providing modern custom-built pre-order solutions to grocery stores, supermarkets, local chemists, and cafes to keep waiting times down to zero.
            </p>
            <p className="font-mono text-[10px]">CURRENT LOCAL TIME: <span className="text-white">2026-06-11 UTC</span></p>
          </div>

          <div className="space-y-3">
            <h5 className="font-black text-white uppercase tracking-widest text-[11px]">System Architecture</h5>
            <ul className="space-y-1.5 leading-relaxed">
              <li>• Frontend: React & Tailwind CSS</li>
              <li>• Backend REST API Router: Node & Express.js</li>
              <li>• Core Gemini client integrated server-side</li>
              <li>• Autonomous SMS notifications pipeline simulation</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-black text-white uppercase tracking-widest text-[11px]">Features & Compliance</h5>
            <ul className="space-y-1.5 leading-relaxed">
              <li>• Pre-Order placement with traffic commuters delay optimizer</li>
              <li>• Dual Customer / Shopkeeper Dashboard interface</li>
              <li>• Real-time verifiable QR code pickup tokens</li>
              <li>• AI-assisted cross-sell recommendations</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] gap-2">
          <span>© 1999–2026 QuickPack Corp. All global rights reserved.</span>
          <span className="font-mono uppercase text-white/20">STATION_DOWNTOWN // PORT_SERVED_3000</span>
        </div>
      </footer>

      {/* GLOBAL MODAL: PRODUCT SPECIFIC DETAILED REVIEWS */}
      {isReviewsModalOpen && selectedProductForReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in" id="reviews-detail-modal">
          <div className="relative w-full max-w-lg bg-[#111] border-2 border-yellow-500 p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedProductForReviews.image} 
                  alt={selectedProductForReviews.name} 
                  className="w-10 h-10 object-cover border border-white/15" 
                />
                <div>
                  <h3 className="font-black uppercase tracking-tight text-white text-md line-clamp-1">{selectedProductForReviews.name}</h3>
                  <p className="text-[10px] text-white/50 uppercase">{selectedProductForReviews.category}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsReviewsModalOpen(false); setSelectedProductForReviews(null); }}
                className="text-white/60 hover:text-white font-bold p-1 bg-white/5 border border-white/10 hover:bg-white/10"
                id="close-reviews-modal"
              >
                ✕ Close
              </button>
            </div>

            {/* reviews content list */}
            {(() => {
              const matches = productReviews.filter(r => r.productId === selectedProductForReviews.id);
              const avgScore = matches.length > 0 
                ? (matches.reduce((s, r) => s + r.rating, 0) / matches.length).toFixed(1) 
                : '0.0';

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-black/50 border border-white/5 p-3 rounded">
                    <span className="text-xs font-bold text-white/60 uppercase">Average Item Rating</span>
                    <div className="flex items-center gap-1.5 font-bold text-yellow-400">
                      <span>★ {avgScore} / 5.0</span>
                      <span className="text-white/40 font-mono text-[11px]">({matches.length} total reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {matches.length === 0 ? (
                      <p className="text-xs text-white/30 italic text-center py-6 font-mono">No customers have reviewed this item yet. Be the first after your next pre-order pickup!</p>
                    ) : (
                      matches.map(r => (
                        <div key={r.id} className="border-b border-white/5 pb-3 last:border-b-0 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{r.customerName}</span>
                            <div className="text-yellow-400 font-mono text-[10px]">
                              {Array.from({ length: r.rating }).map((_, i) => "★")}
                            </div>
                          </div>
                          <p className="text-white/70 italic leading-relaxed font-mono">
                            "{r.comment}"
                          </p>
                          <p className="text-[9px] text-white/30 font-mono text-right">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* GLOBAL MODAL: CUSTOMER ORDER SUBMISSION RATING FORM */}
      {isReviewFormOpen && activeReviewOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" id="submit-review-modal">
          <div className="relative w-full max-w-xl bg-[#111] border-2 border-amber-500 p-6 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin text-xs text-white">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-black uppercase tracking-tight text-white text-lg">Leave Pickup & Product Reviews</h3>
                <p className="text-[10px] text-white/50 font-mono">Your direct feedback builds critical grocery store trust metrics.</p>
              </div>
              <button 
                onClick={() => { setIsReviewFormOpen(false); setActiveReviewOrderId(null); }}
                className="text-white/60 hover:text-white font-bold p-1 bg-white/5 border border-white/10 hover:bg-white/10"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleFullReviewSubmission} className="space-y-6">
              
              {/* STEP 1: Overall experience rating */}
              <div className="bg-black/40 border border-amber-500/20 p-4 space-y-3">
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/40 text-amber-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  Pickup Experience Rating
                </span>
                
                <div>
                  <label className="block text-[11px] font-bold uppercase text-white/70 mb-1.5">How smooth was your express collection counter pickup?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(stars => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setOverallRating(stars)}
                        className={`text-xl transition-transform hover:scale-110 ${stars <= overallRating ? 'text-amber-500' : 'text-white/20'}`}
                        id={`star-overall-${stars}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-white/40 mb-1.5">Written pick up experience comment</label>
                  <textarea
                    required
                    rows={2}
                    value={overallComment}
                    onChange={(e) => setOverallComment(e.target.value)}
                    placeholder="e.g. David Packman packed it in organic boxes, ready in 15 seconds. High efficiency!"
                    className="w-full bg-black border border-white/20 p-2 font-mono text-white text-xs focus:border-amber-500 focus:outline-none"
                    id="overall-comment-input"
                  />
                </div>
              </div>

              {/* STEP 2: Rate products in the order */}
              <div className="space-y-4">
                <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 px-2 py-0.5 rounded font-black uppercase tracking-wider block w-max font-mono">
                  Product Level Star Assessments
                </span>

                {(() => {
                  const targetOrd = orders.find(o => o.id === activeReviewOrderId);
                  if (!targetOrd) return null;

                  return (
                    <div className="space-y-4 divide-y divide-white/10 max-h-60 overflow-y-auto pr-1">
                      {targetOrd.items.map((it, idx) => {
                        const stateItem = productRatings[it.productId] || { rating: 5, comment: '' };
                        return (
                          <div key={it.productId} className={`pt-3 ${idx === 0 ? 'pt-0' : ''} space-y-2`}>
                            <p className="font-extrabold text-white text-[11px] uppercase">{it.productName}</p>
                            
                            <div className="flex gap-4 items-center">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(stars => (
                                  <button
                                    key={stars}
                                    type="button"
                                    onClick={() => {
                                      setProductRatings(prev => ({
                                        ...prev,
                                        [it.productId]: { ...stateItem, rating: stars }
                                      }));
                                    }}
                                    className={`text-lg transition-transform hover:scale-110 ${stars <= stateItem.rating ? 'text-yellow-400' : 'text-white/20'}`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                              
                              <input
                                type="text"
                                value={stateItem.comment}
                                onChange={(e) => {
                                  setProductRatings(prev => ({
                                    ...prev,
                                    [it.productId]: { ...stateItem, comment: e.target.value }
                                  }));
                                }}
                                placeholder="Review product freshness / quality..."
                                className="flex-1 bg-black border border-white/15 p-1.5 font-mono text-white text-xs focus:border-yellow-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsReviewFormOpen(false); setActiveReviewOrderId(null); }}
                  className="border border-white/20 px-4 py-2 hover:bg-white/5 uppercase font-bold text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-wider px-5 py-2 shadow-[2px_2px_0px_#000]"
                >
                  Submit Review Pack
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
