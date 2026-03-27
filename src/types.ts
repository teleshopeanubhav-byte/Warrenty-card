export interface Warranty {
  id?: string;
  customerName: string;
  address: string;
  phoneNumber: string;
  product: string;
  price: number;
  brand: string;
  serialNumber: string;
  warrantyPeriod: string;
  purchaseDate: string;
  expiryDate: string;
  note?: string;
  createdAt: number;
}

export interface AdminUser {
  uid: string;
  email: string | null;
}
