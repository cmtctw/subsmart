import { BillingCycle, Subscription } from './types';
import { 
  addMonths, 
  addYears, 
  addWeeks, 
  isBefore, 
  differenceInCalendarDays,
  endOfMonth,
  isSameMonth
} from 'date-fns';

// Helper to replace date-fns parseISO
const parseISO = (str: string) => new Date(str);

// Helper to replace date-fns startOfToday
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to replace date-fns startOfMonth
const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getNextBillingDate = (sub: Subscription): Date => {
  if (!sub.firstBillDate) return new Date();

  const start = parseISO(sub.firstBillDate);
  const today = startOfToday();
  let nextDate = start;
  let iterations = 0;
  
  // Only advance the date if it is strictly BEFORE today.
  while (isBefore(nextDate, today) && iterations < 1000) {
    if (sub.billingCycle === BillingCycle.MONTHLY) nextDate = addMonths(nextDate, 1);
    else if (sub.billingCycle === BillingCycle.YEARLY) nextDate = addYears(nextDate, 1);
    else if (sub.billingCycle === BillingCycle.WEEKLY) nextDate = addWeeks(nextDate, 1);
    
    iterations++;
  }
  
  if (iterations >= 1000) return today;
  return nextDate;
};

export const getDaysRemaining = (date: Date) => {
  return differenceInCalendarDays(date, startOfToday());
};

export const generateReminderMessage = (sub: Subscription, daysLeft: number) => {
  const nextDate = getNextBillingDate(sub);
  const dateStr = nextDate ? nextDate.toLocaleDateString('zh-TW') : '';
  const dueText = daysLeft === 0 ? '今天' : (daysLeft < 0 ? '已過期' : `${daysLeft} 天後`);
  
  return `【SubSmart 續訂提醒】\n您的訂閱服務「${sub.name}」即將在 ${dueText} (${dateStr}) 扣款。\n金額：${sub.currency} ${sub.price}\n請確認是否需要續訂或取消。`;
};

// Calculate all billing occurrences for a specific month
export const getBillDatesInMonth = (sub: Subscription, currentMonth: Date): Date[] => {
    if (!sub.active || !sub.firstBillDate) return [];

    const start = parseISO(sub.firstBillDate);
    const monthEnd = endOfMonth(currentMonth);
    const dates: Date[] = [];

    if (sub.billingCycle === BillingCycle.MONTHLY) {
        let date = start;
        // Manual setYear
        if (date.getFullYear() < currentMonth.getFullYear()) {
             date = new Date(date);
             date.setFullYear(currentMonth.getFullYear());
        }
        // Manual setMonth
        date = new Date(date);
        date.setMonth(currentMonth.getMonth() - 1);
        
        if (isBefore(date, start)) date = start;

        let iterations = 0;
        while (isBefore(date, addMonths(monthEnd, 1)) && iterations < 24) {
            if (isSameMonth(date, currentMonth) && !isBefore(date, start)) {
                dates.push(date);
            }
            date = addMonths(date, 1);
            iterations++;
        }
    } 
    else if (sub.billingCycle === BillingCycle.YEARLY) {
        let date = start;
        while (isBefore(date, addYears(monthEnd, 1))) {
             if (isSameMonth(date, currentMonth) && !isBefore(date, start)) {
                dates.push(date);
            }
            date = addYears(date, 1);
        }
    } 
    else if (sub.billingCycle === BillingCycle.WEEKLY) {
        let date = start;
        while (date.getFullYear() < currentMonth.getFullYear() - 1) {
            date = addYears(date, 1);
        }
        
        let iterations = 0;
        while (isBefore(date, addWeeks(monthEnd, 1)) && iterations < 10000) {
            if (isSameMonth(date, currentMonth) && !isBefore(date, start)) {
                dates.push(date);
            }
            date = addWeeks(date, 1);
            iterations++;
        }
    }

    return dates;
};