/**
 * Currency and localization utilities for Pakistani Rupee (PKR).
 */

export const STANDARD_DELIVERY_FEE = 350;
export const FREE_DELIVERY_THRESHOLD = 15000;

/**
 * Formats a number into PKR standard representation (e.g. PKR 18,500)
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'PKR 0';
  const formatted = Math.round(amount).toLocaleString('en-PK');
  return `PKR ${formatted}`;
}

/**
 * Calculates delivery fee based on subtotal. Free shipping above PKR 15,000.
 */
export function calculateDeliveryFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
}

/**
 * Returns remaining amount needed for complimentary delivery.
 */
export function getRemainingForFreeDelivery(subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return FREE_DELIVERY_THRESHOLD - subtotal;
}

/**
 * Generate unique order ID
 */
export function generateOrderId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `KHJ-${randomNum}`;
}

/**
 * Generate tracking number
 */
export function generateTrackingNumber(courier: string = 'TCS'): string {
  const prefix = courier.includes('TCS') ? 'TCS' : courier.includes('Leopards') ? 'LCS' : 'TRX';
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}-${randomNum}`;
}
