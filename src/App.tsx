import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutDashboard, Plus, Sparkles, Bell } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SmartAddModal } from './components/SmartAddModal';
import { Subscription } from './types';
import { getSpendingInsights } from './services/geminiService';
import { getNextBillingDate, getDaysRemaining } from './utils';

const LOCAL_STORAGE_KEY = 'subsmart_data';

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Partial<Subscription> | undefined>(undefined);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const upcomingSubs = useMemo(() => {
    return subscriptions
      .filter(sub => sub.active)
      .map(sub => ({
        ...sub,
        daysLeft: getDaysRemaining(getNextBillingDate(sub))
      }))
      .filter(sub => sub.daysLeft >= 0 && sub.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
          Notification.requestPermission().catch(err => console.log("Notification permission request failed", err));
      }
      
      if (Notification.permission === 'granted' && upcomingSubs.length > 0) {
          const first = upcomingSubs[0];
          if (first.daysLeft <= 3) {
              try {
                new Notification(`SubSmart 提醒: ${first.name}`, {
                    body: `${first.name} 將在 ${first.daysLeft === 0 ? '今天' : first.daysLeft + ' 天後'} 扣款。`,
                });
              } catch (e) {
                console.error("Failed to send notification", e);
              }
          }
      }
    }
  }, [upcomingSubs.length]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      getSpendingInsights(subscriptions)
        .then(setAiInsights)
        .catch(err => console.error("Failed to get insights", err));
    } else {
      setAiInsights('');
    }
  }, [subscriptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (navRef.current && !navRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveSubscription = (sub: Subscription) => {
    if (editingSub && editingSub.id) {
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? sub : s));
    } else {
      setSubscriptions(prev => [...prev, sub]);
    }
    setEditingSub(undefined);
  };

  const handleDeleteSubscription = (id: string) => {
    if (window.confirm('確定要刪除此訂閱嗎？')) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEditSubscription = (sub: Subscription) => {
    setEditingSub(sub);
    setIsFormOpen(true);
  };

  const handleSmartDataParsed = (data: Partial<Subscription>) => {
    setEditingSub(data);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Navbar with Glassmorphism */}
      <nav ref={navRef} className="border-b border-white/20 bg-white/70 backdrop-blur-xl sticky top-0 z-30 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-gradient-to-br from-red-500 to-red-700 p-2.5 rounded-xl shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
              <LayoutDashboard size={26} className="text-white" />
            </div>
            <span className="text-2xl md:text-3xl font-black text-red-600 tracking-wide drop-shadow-sm">
              訂閱服務與管理
            </span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
             {/* Notification Bell */}
             <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2.5 rounded-xl transition-all relative border ${
                        showNotifications 
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-inner' 
                        : 'bg-white/50 text-slate-500 border-transparent hover:bg-white hover:shadow-md hover:text-indigo-600'
                    }`}
                    title="通知"
                >
                    <Bell size={20} />
                    {upcomingSubs.length > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white shadow-sm"></span>
                    )}
                </button>

                {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up origin-top-right ring-1 ring-black/5">
                        <div className="p-4 border-b border-slate-100/50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800">近期扣款提醒</h3>
                            <span className="text-xs font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{upcomingSubs.length}</span>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                            {upcomingSubs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                                    <Bell size={32} className="opacity-20" />
                                    <span>目前沒有 7 天內到期的訂閱</span>
                                </div>
                            ) : (
                                upcomingSubs.map(sub => (
                                    <div key={sub.id} className="p-3 border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{sub.name}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ${
                                                sub.daysLeft <= 3 
                                                ? 'bg-red-50 text-red-600 border border-red-100' 
                                                : 'bg-orange-50 text-orange-600 border border-orange-100'
                                            }`}>
                                                {sub.daysLeft === 0 ? '今天' : `${sub.daysLeft} 天後`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 flex justify-between items-center mt-1">
                                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{sub.currency} {sub.price}</span>
                                            <span className="text-slate-400">{sub.billingCycle}</span>
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
             </div>

             <button 
              onClick={() => setIsSmartModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white text-slate-700 rounded-xl text-sm font-bold transition-all border border-slate-200/60 shadow-sm hover:shadow-lg hover:text-indigo-600 hover:-translate-y-0.5"
            >
              <Sparkles size={18} className="text-indigo-500" />
              AI 智慧匯入
            </button>
            <button 
              onClick={() => {
                setEditingSub(undefined);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新增訂閱</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Dashboard 
          subscriptions={subscriptions}
          onEdit={handleEditSubscription}
          onDelete={handleDeleteSubscription}
          aiInsights={aiInsights}
        />
      </main>

      <SubscriptionForm 
        isOpen={isFormOpen}
        onClose={() => {
            setIsFormOpen(false);
            setEditingSub(undefined);
        }}
        onSubmit={handleSaveSubscription}
        initialData={editingSub}
      />

      <SmartAddModal 
        isOpen={isSmartModalOpen} 
        onClose={() => setIsSmartModalOpen(false)}
        onDataParsed={handleSmartDataParsed}
      />
    </div>
  );
};

export default App;