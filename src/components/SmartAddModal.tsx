import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
import { parseSubscriptionInput } from '../services/geminiService';
import { Subscription } from '../types';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataParsed: (data: Partial<Subscription>) => void;
}

export const SmartAddModal: React.FC<SmartAddModalProps> = ({ isOpen, onClose, onDataParsed }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError('');
    
    try {
      const parsedData = await parseSubscriptionInput(input);
      onDataParsed(parsedData);
      setInput('');
      onClose();
    } catch (err) {
      setError('分析失敗。請確認您已設定 API Key，或嘗試提供更具體的資訊。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-3xl w-full max-w-lg shadow-2xl p-8 relative overflow-hidden ring-1 ring-black/5">
        
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <Sparkles size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">AI 智慧新增</h2>
              <p className="text-xs text-indigo-600 font-bold tracking-wide uppercase">Gemini Powered</p>
          </div>
        </div>

        <div className="relative z-10">
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            請自然地描述您的訂閱內容，AI 將自動為您填寫表單。<br/>
            </p>

            <div className="relative group">
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="範例：我訂閱了 Spotify Premium 每月 149 台幣，從今天開始。"
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[140px] mb-4 transition-all resize-none shadow-inner text-base"
                />
                <div className="absolute top-2 right-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <Sparkles className="text-indigo-400 w-4 h-4 animate-pulse" />
                </div>
            </div>

            {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
            </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
            <button 
                onClick={onClose}
                className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors font-bold"
            >
                取消
            </button>
            <button 
                onClick={handleAnalyze}
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isLoading ? '分析中...' : '一鍵生成'}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};