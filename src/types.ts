export type CategoryType = string;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  sku: string;
  pricePKR: number;
  compareAtPricePKR?: number;
  stock: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  description: string;
  fabricSpecs: string[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isComingSoon?: boolean;
  createdAt: string;
}

export interface CartItem {
  cartItemId: string; // unique combo of productId-size-color
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered';

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  pricePKR: number;
  category: string;
}

export interface StatusLog {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string; // e.g. KHJ-8421
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  deliveryNotes?: string;
  paymentMethod: 'Cash on Delivery (COD)' | 'Online Bank Transfer / Raast' | 'Debit / Credit Card';
  items: OrderItem[];
  subtotalPKR: number;
  shippingFeePKR: number;
  totalPKR: number;
  status: OrderStatus;
  courier?: string;
  trackingNumber?: string;
  statusHistory: StatusLog[];
  adminEmailRecipient: string; // musemusical61@gmail.com
}
