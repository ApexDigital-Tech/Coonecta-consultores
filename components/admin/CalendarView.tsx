import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { AppointmentData } from '../../types';

interface CalendarViewProps {
    currentMonth: Date;
    appointments: AppointmentData[];
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onSelectDay: (day: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    currentMonth,
    appointments,
    onPrevMonth,
    onNextMonth,
    onSelectDay
}) => {

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const generateCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentMonth);
        const startDay = firstDayOfMonth(currentMonth);
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(i);
        return days;
    };

    const getDayCount = (day: number) => {
        const targetYear = currentMonth.getFullYear();
        const targetMonth = currentMonth.getMonth();

        return appointments.filter(a => {
            if (a.status === 'closed') return false;
            const d = new Date(a.preferredDateTime);
            if (!isNaN(d.getTime())) {
                return d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === day;
            }
            const mStr = String(targetMonth + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            return a.preferredDateTime.includes(`${targetYear}-${mStr}-${dStr}`);
        }).length;
    };

    return (
        <div className="glass-dark rounded-[2.5rem] shadow-premium border border-white/5 p-8 min-h-[600px] animate-zoom-in">
            <div className="flex justify-between items-center mb-10 px-4">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black capitalize text-white tracking-tighter italic">
                        {currentMonth.toLocaleString('es-ES', { month: 'long' })}
                        <span className="text-accent ml-3 not-italic font-black opacity-30 tracking-[0.2em]">{currentMonth.getFullYear()}</span>
                    </h2>
                </div>
                <div className="flex items-center p-1.5 bg-white/5 rounded-2xl border border-white/10">
                    <button onClick={onPrevMonth} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white group"><ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /></button>
                    <div className="w-px h-6 bg-white/5 mx-2" />
                    <button onClick={onNextMonth} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white group"><ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-6 text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] italic px-2">
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {generateCalendarDays().map((day, idx) => {
                    if (!day) return <div key={idx} className="h-32 bg-white/[0.01] rounded-[1.5rem] border border-dashed border-white/5"></div>;

                    const dayCount = getDayCount(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

                    return (
                        <div
                            key={idx}
                            onClick={() => onSelectDay(day)}
                            className={`h-32 rounded-[1.5rem] p-4 transition-all duration-300 cursor-pointer group relative overflow-hidden border ${isToday ? 'border-accent/40 bg-accent/5' : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] hover:shadow-xl'
                                }`}
                        >
                            <span className={`text-2xl font-black block mb-2 italic tracking-tighter ${isToday ? 'text-accent' : (dayCount > 0 ? 'text-white' : 'text-white/20 group-hover:text-white/60')
                                }`}>
                                {day}
                                {isToday && <span className="block text-[7px] uppercase tracking-[0.1em] font-black not-italic opacity-60">Hoy</span>}
                            </span>

                            {dayCount > 0 && (
                                <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{dayCount}</span>
                                </div>
                            )}

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-7 h-7 glass rounded-lg flex items-center justify-center text-accent">
                                    <Plus size={14} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
