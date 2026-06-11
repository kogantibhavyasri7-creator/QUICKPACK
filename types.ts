export interface Store {
  id: string;
  name: string;
  address: string;
  gps: { lat: number; lng: number };
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  unit: string;
  stock: number;
  lowStockThreshold: number;
  description: string;
  isPopular?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'packing' | 'ready' | 'picked_up' | 'cancelled';
  paymentMethod: 'UPI' | 'Card' | 'Cash';
  paymentStatus: 'pending' | 'paid';
  scheduledPickupTime: string;
  pickupToken: string;
  assignedStaff?: string;
  estimatedPackingMinutes: number;
  createdAt: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'shopkeeper';
  loyaltyPoints: number;
  memberTier: 'Regular' | 'Silver' | 'Gold' | 'Platinum';
  avatar?: string;
}

export interface AIPickupPrediction {
  totalMinutesToReady: number;
  travelMins: number;
  arrivalStatus: string;
  aiRecommendation: string;
}

export interface AIRecommendationResponse {
  recommendations: Product[];
  aiExplanation: string;
  offer: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PickupReview {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

