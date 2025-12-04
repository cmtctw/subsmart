export enum BillingCycle {
  MONTHLY = '每月',
  YEARLY = '每年',
  WEEKLY = '每週'
}

export enum Category {
  ENTERTAINMENT = '娛樂',
  SOFTWARE = '軟體',
  UTILITIES = '生活公用',
  INSURANCE = '保險',
  OTHER = '其他'
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  firstBillDate: string; // ISO Date string
  category: Category;
  description?: string;
  active: boolean;
  websiteUrl?: string;
}

export interface SpendingData {
  name: string;
  value: number;
  color: string;
}

export interface NotificationSettings {
  enabled: boolean;
  daysBefore: number;
}