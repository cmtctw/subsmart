import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { AlertCircle, DollarSign, TrendingUp, ExternalLink, Trash2, Edit2, CheckCircle, ArrowUpRight, Bell, Calendar as CalendarIcon, List as ListIcon, Copy, Mail, MessageCircle, PieChart as PieChartIcon, Sparkles } from 'lucide-react';
import { BillingCycle, Subscription } from '../types';
import { format } from 'date-fns';
import { getNextBillingDate, getDaysRemaining, generateReminderMessage } from '../utils';
import { CalendarView } from './CalendarView';

interface DashboardProps {
  subscriptions: Subscription[];
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  aiInsights: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ subscriptions, onEdit, onDelete, aiInsights }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Notification Modal State
  const [notifySub, setNotifySub] = useState<Subscription | null>(null);

  // Memoized stats
  const stats = useMemo(() => {
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    const categorySpend: Record<string, number> = {};

    subscriptions.forEach(sub => {
      if (!sub.active) return;
      
      // Normalize to monthly cost for chart
      let monthlyCost = sub.price;
      if (sub.billingCycle === BillingCycle.YEARLY) monthlyCost = sub.price / 12;
      else if (sub.billingCycle === BillingCycle.WEEKLY) monthlyCost = sub.price * 4.33;

      monthlyTotal += monthlyCost;
      yearlyTotal += (monthlyCost * 12);

      const cat = sub.category;
      categorySpend[cat] = (categorySpend[cat] || 0) + monthlyCost;
    });

    const pieData = Object.keys(categorySpend).map(key => ({
      name: key,
      value: parseFloat(categorySpend[key].toFixed(2))
    }));

    return { monthlyTotal, yearlyTotal, pieData };
  }, [subscriptions]);

  // Enhanced subscription list with calculated fields
  const processedSubs = useMemo(() => {
    return subscriptions.map(sub => {
      const nextDate = getNextBillingDate(sub);
      const daysLeft = getDaysRemaining(nextDate);
      return { ...sub, nextDate, daysLeft };
    }).sort((a, b) => a.daysLeft - b.daysLeft); // Sort by soonest expiring
  }, [subscriptions]);

  const handleNotify = (sub: Subscription) => {
    setNotifySub(sub);
  };

  const sendLine = (sub: Subscription) => {
      const daysLeft = getDaysRemaining(getNextBillingDate(sub));
      const msg = generateReminderMessage(sub, daysLeft);
      window.open(`https://line.me/R/msg/text/?${encodeURIComponent(msg)}`, '_blank');
      setNotifySub(null);
  };

  const sendEmail = (sub: Subscription) => {
      const daysLeft = getDaysRemaining(getNextBillingDate(sub));
      const msg = generateReminderMessage(sub, daysLeft);
      window.open(`mailto:?subject=SubSmart 續訂提醒&body=${encodeURIComponent(msg)}`, '_blank');
      setNotifySub(null);
  };

  const copyText = (sub: Subscription) => {
      const daysLeft = getDaysRemaining(getNextBillingDate(sub));
      const msg = generateReminderMessage(sub, daysLeft);
      navigator.clipboard.writeText(msg);
      alert('提醒訊息已複製！');
      setNotifySub(null);
  };

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, gradientClass }: any) => (
      <div className={`relative overflow-hidden p-6 rounded-2xl border border-white/60 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/70 backdrop-blur-md group`}>
          {/* Subtle Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-current opacity-5 rounded-full blur-3xl group-hover:scale-110 transition-transform text-slate-400"></div>

          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${colorClass} shadow-sm`}>
                      <Icon size={22} />
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold tracking-wide uppercase">{title}</h3>
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                  {subtext}
              </p>
          </div>
      </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="每月花費" 
            value={`$${stats.monthlyTotal.toFixed(2)}`} 
            subtext="依據週期估算總額"
            icon={DollarSign}
            colorClass="bg-indigo-100 text-indigo-600"
            gradientClass="from-indigo-500 to-violet-500"
        />
        <StatCard 
            title="年度預估" 
            value={`$${stats.yearlyTotal.toFixed(2)}`} 
            subtext="全年總支出預測"
            icon={TrendingUp}
            colorClass="bg-fuchsia-100 text-fuchsia-600"
            gradientClass="from-fuchsia-500 to-pink-500"
        />
        <StatCard 
            title="啟用中訂閱" 
            value={subscriptions.filter(s => s.active).length} 
            subtext={`${subscriptions.length - subscriptions.filter(s => s.active).length} 項非啟用中`}
            icon={CheckCircle}
            colorClass="bg-emerald-100 text-emerald-600"
            gradientClass="from-emerald-500 to-teal-500"
        />
      </div>

      {/* AI Insights Banner */}
      {aiInsights && (
        <div className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-indigo-100/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-500"></div>
             <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0 shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
                <h4 className="text-indigo-900 font-bold text-base mb-1 flex items-center gap-2">
                    AI 財務分析
                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">GEMINI</span>
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed">{aiInsights}</p>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List / Calendar */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">您的訂閱列表</h2>
            
            <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 shadow-inner">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                    <ListIcon size={16} /> 列表
                </button>
                <button 
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                >
                    <CalendarIcon size={16} /> 日曆
                </button>
            </div>
          </div>
          
          {viewMode === 'list' ? (
              <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200/60 bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <th className="p-5 pl-8">服務名稱</th>
                                <th className="p-5">金額</th>
                                <th className="p-5">週期</th>
                                <th className="p-5">類別</th>
                                <th className="p-5">下次扣款</th>
                                <th className="p-5 pr-8 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {processedSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                <ListIcon size={32} className="opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-slate-600">目前沒有訂閱項目</p>
                                                <p className="text-sm">點擊上方的「新增項目」來開始記帳吧！</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processedSubs.map((sub) => (
                                <tr key={sub.id} className={`group hover:bg-indigo-50/30 transition-colors duration-200 ${!sub.active ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 ${
                                                sub.active 
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200' 
                                                : 'bg-slate-200 text-slate-400'
                                            }`}>
                                                {sub.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-slate-800 text-base ${!sub.active && 'line-through decoration-slate-400'}`}>{sub.name}</span>
                                                    {sub.daysLeft <= 3 && sub.daysLeft >= 0 && sub.active && (
                                                        <span className="flex h-2.5 w-2.5 relative" title="即將到期">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                {sub.websiteUrl && (
                                                    <a href={sub.websiteUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-400 hover:text-indigo-600 flex items-center gap-1 mt-0.5 transition-colors">
                                                        前往網站 <ArrowUpRight size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-mono text-slate-700 font-bold text-base bg-slate-100 px-2 py-1 rounded-lg">
                                            {sub.currency} {sub.price.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm whitespace-nowrap">
                                            {sub.billingCycle}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">{sub.category}</span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold whitespace-nowrap ${
                                                sub.daysLeft === 0 ? 'text-red-600' :
                                                sub.daysLeft <= 3 && sub.active ? 'text-red-500' : 
                                                sub.daysLeft <= 7 ? 'text-orange-500' : 'text-slate-800'
                                            }`}>
                                                {sub.daysLeft === 0 ? '今天' : (sub.daysLeft < 0 ? '已過期' : `還有 ${sub.daysLeft} 天`)}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap mt-0.5">
                                                {format(sub.nextDate, 'yyyy/MM/dd')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button 
                                                onClick={() => handleNotify(sub)} 
                                                className="p-2 text-slate-400 hover:text-white hover:bg-indigo-500 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                                                title="傳送提醒"
                                            >
                                                <Bell size={18} />
                                            </button>
                                            <button 
                                                onClick={() => onEdit(sub)} 
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                                                title="編輯"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(sub.id)} 
                                                className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
                                                title="刪除"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
          ) : (
              <CalendarView 
                currentDate={calendarDate}
                onDateChange={setCalendarDate}
                subscriptions={subscriptions}
              />
          )}
        </div>

        {/* Charts Side */}
        <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
                <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                        <PieChartIcon size={18}/>
                    </div>
                    各類別花費佔比
                </h3>
                <div className="h-[250px] w-full relative">
                    {stats.pieData.length === 0 && (
                         <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-medium z-10">
                            尚無數據
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {stats.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm stroke-white stroke-2" />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'transparent', color: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                itemStyle={{ color: '#334155', fontWeight: 600 }}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:translate-x-1/3 transition-transform"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">為什麼要追蹤訂閱？</h3>
                <p className="text-indigo-100 text-sm mb-4 leading-relaxed relative z-10">
                    小額的定期扣款一年下來可能累積成一筆大數目。SubSmart 幫助您找出那些不再使用的「殭屍訂閱」，最高可節省 30% 支出。
                </p>
                <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors relative z-10">
                    閱讀省錢秘訣 <ExternalLink size={14}/>
                </a>
            </div>
        </div>
      </div>

      {/* Notification Modal */}
      {notifySub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-0 relative shadow-2xl overflow-hidden ring-1 ring-black/5 transform transition-all scale-100">
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Bell size={20} className="text-indigo-200" />
                        傳送續訂提醒
                    </h3>
                    <button 
                      onClick={() => setNotifySub(null)}
                      className="text-white/60 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                      <Trash2 size={20} className="rotate-45" />
                    </button>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        準備發送關於 <span className="font-bold text-slate-800">「{notifySub.name}」</span> 的提醒通知。
                        <br/>請選擇您偏好的方式：
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={() => sendLine(notifySub)}
                            className="w-full flex items-center gap-3 p-3.5 bg-[#06C755] text-white hover:bg-[#05b34c] shadow-md shadow-green-500/20 rounded-xl transition-all font-bold hover:-translate-y-0.5"
                        >
                            <MessageCircle size={20} /> LINE 訊息
                        </button>
                        <button 
                            onClick={() => sendEmail(notifySub)}
                            className="w-full flex items-center gap-3 p-3.5 bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 rounded-xl transition-all font-bold hover:-translate-y-0.5"
                        >
                            <Mail size={20} /> Email 郵件
                        </button>
                        <button 
                            onClick={() => copyText(notifySub)}
                            className="w-full flex items-center gap-3 p-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all font-bold"
                        >
                            <Copy size={20} /> 複製文字
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};