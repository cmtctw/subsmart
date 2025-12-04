import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard } from 'lucide-react';
import { BillingCycle, Category, Subscription } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sub: Subscription) => void;
  initialData?: Partial<Subscription>;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ 
  isOpen, onClose, onSubmit, initialData 
}) => {
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: '',
    price: 0,
    currency: 'TWD',
    billingCycle: BillingCycle.MONTHLY,
    firstBillDate: new Date().toISOString().split('T')[0],
    category: Category.OTHER,
    description: '',
    active: true,
    websiteUrl: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
        setFormData({
            name: '',
            price: 0,
            currency: 'TWD',
            billingCycle: BillingCycle.MONTHLY,
            firstBillDate: new Date().toISOString().split('T')[0],
            category: Category.OTHER,
            description: '',
            active: true,
            websiteUrl: ''
        });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub: Subscription = {
      id: formData.id || uuidv4(),
      name: formData.name || '未命名訂閱',
      price: Number(formData.price) || 0,
      currency: formData.currency || 'TWD',
      billingCycle: formData.billingCycle || BillingCycle.MONTHLY,
      firstBillDate: formData.firstBillDate || new Date().toISOString(),
      category: formData.category || Category.OTHER,
      description: formData.description || '',
      active: formData.active ?? true,
      websiteUrl: formData.websiteUrl || ''
    };
    onSubmit(sub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-6">
          {formData.id ? '編輯訂閱' : '新增訂閱'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">服務名稱</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
                placeholder="例如：Netflix"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">價格</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CreditCard size={16} />
                </div>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">幣別</label>
              <select
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="TWD">TWD (NT$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">計費週期</label>
              <select
                value={formData.billingCycle}
                onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
              >
                {Object.values(BillingCycle).map(cycle => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">首次扣款日期</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={16} />
                </div>
                <input
                  required
                  type="date"
                  value={formData.firstBillDate?.split('T')[0]} 
                  onChange={e => setFormData({...formData, firstBillDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="col-span-2">
               <label className="block text-sm font-medium text-slate-600 mb-1">類別</label>
               <div className="flex flex-wrap gap-2">
                 {Object.values(Category).map(cat => (
                   <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.category === cat 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">描述 (選填)</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              儲存訂閱
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};