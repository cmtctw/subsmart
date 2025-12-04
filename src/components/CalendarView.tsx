import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, subMonths, addMonths } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Subscription } from '../types';
import { getBillDatesInMonth } from '../utils';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  subscriptions: Subscription[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, onDateChange, subscriptions }) => {
  
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const subsByDate: Record<string, Subscription[]> = {};
    
    subscriptions.forEach(sub => {
      const dates = getBillDatesInMonth(sub, currentDate);
      dates.forEach(date => {
        const key = format(date, 'yyyy-MM-dd');
        if (!subsByDate[key]) subsByDate[key] = [];
        subsByDate[key].push(sub);
      });
    });

    return { days, subsByDate };
  }, [currentDate, subscriptions]);

  const handlePrevMonth = () => onDateChange(subMonths(currentDate, 1));
  const handleNextMonth = () => onDateChange(addMonths(currentDate, 1));

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">
          {format(currentDate, 'yyyy 年 M 月', { locale: zhTW })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px border-b border-slate-200">
        {calendarData.days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const subs = calendarData.subsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div 
              key={day.toString()} 
              className={`min-h-[100px] bg-white p-2 transition-colors hover:bg-slate-50 flex flex-col gap-1
                ${!isCurrentMonth ? 'bg-slate-50/50' : ''}
              `}
            >
              <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isDayToday 
                  ? 'bg-indigo-600 text-white' 
                  : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
              `}>
                {format(day, 'd')}
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {subs.map(sub => (
                  <div 
                    key={`${dateKey}-${sub.id}`}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 truncate select-none"
                    title={`${sub.name} - ${sub.currency} ${sub.price}`}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};