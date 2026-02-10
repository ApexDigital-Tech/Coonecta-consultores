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
            if (a.status === 'closed' || !a.preferredDateTime) return false;

            // Intento de parseo robusto
            const d = new Date(a.preferredDateTime);
            if (!isNaN(d.getTime())) {
                return d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === day;
            }

            // Fallback
            const mStr = String(targetMonth + 1).padStart(2, '0');
            const dStr = String(day).padStart(2, '0');
            return a.preferredDateTime.includes(`${targetYear}-${mStr}-${dStr}`);
        }).length;
    };

    return (
        <div className="glass-dark rounded-[2rem] shadow-premium border border-white/5 p-6 min-h-[500px] animate-zoom-in">
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex flex-col">
                    <h2 className="text-xl font-black capitalize text-white tracking-tighter italic">
                        {currentMonth.toLocaleString('es-ES', { month: 'long' })}
                        <span className="text-accent ml-2 not-italic font-black opacity-30 tracking-[0.1em]">{currentMonth.getFullYear()}</span>
                    </h2>
                </div>
                <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
                    <button onClick={onPrevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white group"><ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /></button>
                    <div className="w-px h-4 bg-white/5 mx-1" />
                    <button onClick={onNextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white group"><ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4 text-center text-white/20 text-[8px] font-black uppercase tracking-[0.3em] italic px-1">
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
            </div>

            <div className="grid grid-cols-7 gap-3">
                {generateCalendarDays().map((day, idx) => {
                    if (!day) return <div key={idx} className="h-24 bg-white/[0.01] rounded-[1rem] border border-dashed border-white/5"></div>;

                    const dayCount = getDayCount(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

                    return (
                        <div
                            key={idx}
                            onClick={() => onSelectDay(day)}
                            className={`h-24 rounded-[1.2rem] p-3 transition-all duration-300 cursor-pointer group relative overflow-hidden border ${isToday ? 'border-accent/40 bg-accent/5' : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                }`}
                        >
                            <span className={`text-lg font-black block mb-1 italic tracking-tighter ${isToday ? 'text-accent' : (dayCount > 0 ? 'text-white' : 'text-white/20 group-hover:text-white/60')
                                }`}>
                                {day}
                                {isToday && <span className="block text-[6px] uppercase tracking-[0.1em] font-black not-italic opacity-60">Hoy</span>}
                            </span>

                            {dayCount > 0 && (
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                                    <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">{dayCount} {dayCount === 1 ? 'Cita' : 'Citas'}</span>
                                </div>
                            )}

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus size={12} className="text-accent" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
