import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus, saveAppointment } from '../utils/storage';
import { AppointmentData } from '../types';
import {
    Calendar, Users, Bell, Search, CheckCircle, Clock,
    XCircle, MoreVertical, LogOut, ChevronLeft, ChevronRight,
    Plus, X, Save, User, Mail, Briefcase, Loader2, Phone, Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Day Detail Modal State
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showDayModal, setShowDayModal] = useState(false);
    const formRef = React.useRef<HTMLDivElement>(null);

    // Manual Scheduling Form State
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // "09:00", "15:00"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newApptData, setNewApptData] = useState<Partial<AppointmentData>>({
        clientName: '',
        email: '',
        organization: '',
        needType: 'Diagnóstico Organizacional HPO',
        topic: '',
        notes: 'Agendado manualmente por Admin'
    });

    useEffect(() => {
        refreshData();

        // 🔄 Sync: Listen for new appointments saved from ConectaAI or other components
        const handleSync = () => {
            console.log("Appointment sync triggered");
            refreshData();
        };

        window.addEventListener('appointment-saved', handleSync);
        return () => window.removeEventListener('appointment-saved', handleSync);
    }, []);

    const refreshData = async () => {
        setLoading(true);
        const data = await getAppointments();
        setAppointments(data);
        setLoading(false);
    };

    const handleStatusChange = async (id: string, status: AppointmentData['status']) => {
        // Optimistic update locally for speed
        const updatedLocal = appointments.map(a => a.id === id ? { ...a, status } : a);
        setAppointments(updatedLocal);

        // Perform actual update
        await updateAppointmentStatus(id, status);
        // Refresh to ensure sync
        refreshData();
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDay || !selectedSlot) return;

        setIsSubmitting(true);

        try {
            // Construct Date String matches the storage format style
            const year = currentMonth.getFullYear();
            const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDay).padStart(2, '0');
            const dateTimeString = `${year}-${month}-${day} ${selectedSlot}`;

            const newAppt: AppointmentData = {
                clientName: newApptData.clientName || 'Cliente Anónimo',
                phone: '',
                email: newApptData.email || '',
                organization: newApptData.organization || '',
                needType: newApptData.needType || 'Consulta General',
                topic: newApptData.topic || 'Sesión Directa',
                preferredDateTime: dateTimeString,
                consultant: 'Asignado Manualmente',
                notes: newApptData.notes || '',
                status: 'scheduled'
            };

            await saveAppointment(newAppt);
            await refreshData();

            setSelectedSlot(null); // Close form
            setNewApptData({
                clientName: '',
                email: '',
                organization: '',
                needType: 'Diagnóstico Organizacional HPO',
                topic: '',
                notes: 'Agendado manualmente por Admin'
            });
        } catch (error) {
            console.error("Error al agendar:", error);
            alert("Error al guardar la cita. Por favor, intenta de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calendar Logic
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

    // Time Slots Logic
    const morningSlots = ["09:00", "10:00", "11:00", "12:00"];
    const afternoonSlots = ["14:00", "15:00", "16:00", "17:00", "18:00"];

    const getApptForSlot = (day: number, time: string) => {
        const targetYear = currentMonth.getFullYear();
        const targetMonth = currentMonth.getMonth(); // 0-indexed
        const targetHour = parseInt(time.split(':')[0], 10);

        return appointments.find(a => {
            if (a.status === 'closed') return false;

            // Robust Date Parsing
            const apptDate = new Date(a.preferredDateTime);

            if (!isNaN(apptDate.getTime())) {
                const sameDay =
                    apptDate.getFullYear() === targetYear &&
                    apptDate.getMonth() === targetMonth &&
                    apptDate.getDate() === day;

                // Hour comparison (checking for the specific slot)
                const apptHour = apptDate.getHours();
                return sameDay && apptHour === targetHour;
            }

            // Fallback: String matching (e.g., "2026-02-10")
            const monthStr = String(targetMonth + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateKey = `${targetYear}-${monthStr}-${dayStr}`;

            return a.preferredDateTime.includes(dateKey) && a.preferredDateTime.includes(time);
        });
    };

    // Helper to count appointments for a day
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

    // Render Slot Helper
    const renderSlot = (time: string) => {
        const appt = selectedDay ? getApptForSlot(selectedDay, time) : undefined;

        return (
            <div key={time} className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center text-sm font-bold text-gray-400 bg-gray-100 rounded-l-lg border-y border-l border-gray-200">
                    {time}
                </div>
                <div className={`ml-16 p-3 rounded-r-lg border border-gray-200 min-h-[60px] flex items-center ${appt ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                    {appt ? (
                        <div className="w-full relative group/tooltip cursor-help">
                            <div className="font-bold text-primary text-sm truncate">{appt.clientName}</div>
                            <div className="text-xs font-semibold text-gray-600 truncate">{appt.organization}</div>
                            <div className="text-xs text-accent font-bold truncate">📌 {appt.topic}</div>
                            <div className="text-xs text-gray-400 truncate">{appt.needType}</div>

                            {/* Detail Tooltip */}
                            <div className="absolute left-0 top-full mt-2 z-50 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-xl w-64 hidden group-hover/tooltip:block">
                                <div className="mb-2 pb-1 border-b border-gray-600 font-bold text-accent">Detalles de Contacto</div>
                                <div className="grid grid-cols-[20px_1fr] gap-1">
                                    <span>📧</span> <span className="truncate">{appt.email || 'No registrado'}</span>
                                    <span>📞</span> <span className="truncate">{appt.phone || 'No registrado'}</span>
                                    <span>🏢</span> <span className="truncate">{appt.organization}</span>
                                    <span>🕒</span> <span>{appt.preferredDateTime}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        selectedSlot === time ? (
                            <span className="text-sm font-bold text-secondary">Agendando...</span>
                        ) : (
                            <button
                                onClick={() => setSelectedSlot(time)}
                                className="w-full h-full flex items-center text-gray-400 hover:text-secondary text-sm font-medium transition-colors"
                            >
                                <Plus size={16} className="mr-1" /> Disponible
                            </button>
                        ))
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-dark flex font-display text-white overflow-hidden relative">
            {/* Background decorations */}
            <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-72 glass-dark flex-shrink-0 hidden md:flex flex-col border-r border-white/5 z-20">
                <div className="p-10 border-b border-white/5 flex flex-col items-center">
                    <div className="mb-6 p-4 glass rounded-[1.5rem] shadow-premium ring-1 ring-white/10">
                        <img src="/conecta-logo.png" alt="Conecta" className="h-10 brightness-0 invert" />
                    </div>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Command Center</span>
                </div>

                <nav className="p-6 space-y-3 flex-1">
                    <button
                        onClick={() => setView('calendar')}
                        className={`w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-300 group ${view === 'calendar' ? 'bg-primary text-white shadow-xl shadow-primary/20 italic font-black' : 'text-white/40 hover:bg-white/5 hover:text-white font-bold'}`}
                    >
                        <Calendar size={20} className={`mr-4 ${view === 'calendar' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                        Calendario
                        {view === 'calendar' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]" />}
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`w-full flex items-center px-6 py-4 rounded-2xl transition-all duration-300 group ${view === 'list' ? 'bg-primary text-white shadow-xl shadow-primary/20 italic font-black' : 'text-white/40 hover:bg-white/5 hover:text-white font-bold'}`}
                    >
                        <Users size={20} className={`mr-4 ${view === 'list' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                        Leads de Impacto
                        {view === 'list' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]" />}
                    </button>
                </nav>

                <div className="p-8 border-t border-white/5">
                    <button onClick={onLogout} className="flex items-center text-white/20 hover:text-red-400 transition-all w-full font-black uppercase tracking-widest text-[10px] group">
                        <div className="mr-4 p-2 bg-white/5 rounded-lg group-hover:bg-red-500/10 transition-colors">
                            <LogOut size={16} />
                        </div>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-hidden flex flex-col relative z-10">
                {/* Header */}
                <header className="px-12 py-8 flex justify-between items-center border-b border-white/5 bg-dark/40 backdrop-blur-xl">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                            {view === 'list' ? 'Gestión de Leads' : 'Agenda Estratégica'}
                        </h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                            Conecta Consultores • 2026 Edition
                        </p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4 p-2 pl-6 pr-3 glass rounded-full border border-white/10 shadow-premium">
                            <div className="text-right">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Admin Global</p>
                                <p className="text-[10px] text-accent font-bold">online</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-white shadow-xl border-2 border-white/20">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-12 scrollbar-none">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center animate-float">
                                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            </div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] animate-pulse">Sincronizando Datos...</p>
                        </div>
                    ) : view === 'list' ? (
                        // CRM LIST VIEW
                        <div className="glass-dark rounded-[2.5rem] shadow-premium border border-white/5 overflow-hidden animate-zoom-in">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-white/30 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                        <tr>
                                            <th className="px-10 py-6">Estructura del Lead</th>
                                            <th className="px-10 py-6">Foco de Intervención</th>
                                            <th className="px-10 py-6">Cronograma</th>
                                            <th className="px-10 py-6">Estado</th>
                                            <th className="px-10 py-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {appointments.map((appt) => (
                                            <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="font-black text-white text-lg tracking-tight group-hover:text-accent transition-colors italic">{appt.clientName}</div>
                                                    <div className="text-sm text-white/40 font-bold mb-3">{appt.organization}</div>
                                                    <div className="flex gap-4">
                                                        <div className="flex items-center text-[10px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                                            <Mail size={10} className="mr-2" /> {appt.email}
                                                        </div>
                                                        {appt.phone && (
                                                            <div className="flex items-center text-[10px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                                                <Phone size={10} className="mr-2" /> {appt.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-block bg-primary/20 text-accent px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-accent/20 italic shadow-inner-premium whitespace-nowrap w-fit">
                                                            {appt.needType}
                                                        </span>
                                                        <span className="text-xs font-bold text-white/50 pl-2">
                                                            {appt.topic}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 group-hover:bg-white/10">
                                                            <Clock size={16} className="text-accent" />
                                                        </div>
                                                        {appt.preferredDateTime}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${appt.status === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                        appt.status === 'scheduled' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                                            'bg-white/5 text-white/30 border border-white/10'
                                                        }`}>
                                                        {appt.status || 'NEW'}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        <button onClick={() => handleStatusChange(appt.id!, 'scheduled')} className="w-12 h-12 bg-white/5 text-secondary rounded-2xl hover:bg-secondary hover:text-white transition-all flex items-center justify-center shadow-premium"><CheckCircle size={20} /></button>
                                                        <button onClick={() => handleStatusChange(appt.id!, 'closed')} className="w-12 h-12 bg-white/5 text-white/20 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center shadow-premium"><XCircle size={20} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        // CALENDAR VIEW
                        <div className="glass-dark rounded-[3.5rem] shadow-premium border border-white/5 p-12 min-h-[700px] animate-zoom-in">
                            <div className="flex justify-between items-center mb-16 px-4">
                                <div className="flex flex-col">
                                    <h2 className="text-5xl font-black capitalize text-white tracking-tighter italic">
                                        {currentMonth.toLocaleString('es-ES', { month: 'long' })}
                                        <span className="text-accent ml-4 not-italic font-black opacity-30 tracking-[0.2em]">{currentMonth.getFullYear()}</span>
                                    </h2>
                                </div>
                                <div className="flex items-center p-2 bg-white/5 rounded-3xl border border-white/10">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white group"><ChevronLeft className="group-hover:-translate-x-1 transition-transform" /></button>
                                    <div className="w-px h-10 bg-white/5 mx-2" />
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-4 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white group"><ChevronRight className="group-hover:translate-x-1 transition-transform" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-6 mb-8 text-center text-white/20 text-[11px] font-black uppercase tracking-[0.4em] italic px-4">
                                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                            </div>

                            <div className="grid grid-cols-7 gap-6">
                                {generateCalendarDays().map((day, idx) => {
                                    if (!day) return <div key={idx} className="h-44 bg-white/[0.01] rounded-[2.5rem] border border-dashed border-white/5"></div>;

                                    const dayCount = getDayCount(day);
                                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => { setSelectedDay(day); setShowDayModal(true); }}
                                            className={`h-44 rounded-[2.5rem] p-6 transition-all duration-500 cursor-pointer group relative overflow-hidden border ${isToday ? 'border-accent/40 bg-accent/5' : 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] hover:scale-[1.05] hover:shadow-2xl'
                                                }`}
                                        >
                                            <span className={`text-4xl font-black block mb-4 italic tracking-tighter ${isToday ? 'text-accent' : (dayCount > 0 ? 'text-white' : 'text-white/20 group-hover:text-white/60')
                                                }`}>
                                                {day}
                                                {isToday && <span className="block text-[8px] uppercase tracking-[0.2em] font-black not-italic opacity-60">Hoy</span>}
                                            </span>

                                            {dayCount > 0 && (
                                                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(34,153,84,1)]" />
                                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{dayCount} Sesiones</span>
                                                </div>
                                            )}

                                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-accent">
                                                    <Plus size={18} />
                                                </div>
                                            </div>

                                            {/* Abstract background for active days */}
                                            {dayCount > 0 && <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/10 blur-2xl rounded-full" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* DAY DETAIL MODAL */}
                {showDayModal && selectedDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/95 backdrop-blur-xl p-8 animate-in fade-in duration-500">
                        <div className="bg-white/5 border border-white/10 rounded-[4rem] shadow-premium w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
                            {/* Modal Header */}
                            <div className="p-12 pb-6 flex justify-between items-center group shrink-0">
                                <div className="flex gap-8 items-center">
                                    <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center text-5xl font-black italic shadow-premium group-hover:rotate-6 transition-transform">
                                        {selectedDay}
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Planificación Mensual</h3>
                                        <p className="text-accent text-sm font-black uppercase tracking-[0.3em] mt-2 opacity-60">
                                            {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { setShowDayModal(false); setSelectedSlot(null); }} className="w-20 h-20 glass rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 transition-all hover:rotate-90">
                                    <X size={32} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-12 pt-6 scrollbar-none">

                                {/* Split View */}
                                <div className="grid md:grid-cols-2 gap-12">

                                    {/* Morning Column */}
                                    <div className="space-y-6">
                                        <h4 className="flex items-center text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-8 pb-4 border-b border-white/5 italic">
                                            <span className="mr-4 text-2xl not-italic">☀️</span> Franja Matutina
                                        </h4>
                                        <div className="space-y-4">
                                            {morningSlots.map(time => {
                                                const appt = getApptForSlot(selectedDay, time);
                                                return (
                                                    <div key={time} className="group relative">
                                                        <div className={`p-6 rounded-[2rem] border min-h-[90px] flex items-center transition-all ${appt ? 'bg-primary/20 border-primary/30 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                                            }`}>
                                                            <div className="w-20 h-full flex flex-col items-center justify-center border-r border-white/10 mr-6 font-black text-white/40 group-hover:text-white transition-colors">
                                                                <span className="text-lg italic tracking-tight">{time}</span>
                                                            </div>

                                                            {appt ? (
                                                                <div className="flex-1 flex justify-between items-center">
                                                                    <div>
                                                                        <div className="font-black text-white text-lg italic tracking-tight mb-1">{appt.clientName}</div>
                                                                        <div className="flex gap-2 items-center">
                                                                            <div className="text-[10px] font-black text-accent uppercase tracking-widest">{appt.organization}</div>
                                                                            <span className="text-white/20 text-[10px]">•</span>
                                                                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">{appt.topic}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40">
                                                                        <MoreVertical size={16} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedSlot(time);
                                                                        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                                                                    }}
                                                                    className={`flex-1 flex items-center font-black uppercase tracking-widest text-[10px] transition-all group/btn ${selectedSlot === time ? 'text-accent' : 'text-white/20 hover:text-accent'}`}
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 group-hover/btn:bg-accent group-hover/btn:text-white transition-all">
                                                                        <Plus size={16} />
                                                                    </div>
                                                                    {selectedSlot === time ? 'Revisar Formulario ↓' : 'Disponible para agenda'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Afternoon Column */}
                                    <div className="space-y-6">
                                        <h4 className="flex items-center text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-8 pb-4 border-b border-white/5 italic">
                                            <span className="mr-4 text-2xl not-italic">🌤️</span> Franja Vespertina
                                        </h4>
                                        <div className="space-y-4">
                                            {afternoonSlots.map(time => {
                                                const appt = getApptForSlot(selectedDay, time);
                                                return (
                                                    <div key={time} className="group relative">
                                                        <div className={`p-6 rounded-[2rem] border min-h-[90px] flex items-center transition-all ${appt ? 'bg-primary/20 border-primary/30 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                                            }`}>
                                                            <div className="w-20 h-full flex flex-col items-center justify-center border-r border-white/10 mr-6 font-black text-white/40 group-hover:text-white transition-colors">
                                                                <span className="text-lg italic tracking-tight">{time}</span>
                                                            </div>

                                                            {appt ? (
                                                                <div className="flex-1 flex justify-between items-center">
                                                                    <div>
                                                                        <div className="font-black text-white text-lg italic tracking-tight mb-1">{appt.clientName}</div>
                                                                        <div className="flex gap-2 items-center">
                                                                            <div className="text-[10px] font-black text-accent uppercase tracking-widest">{appt.organization}</div>
                                                                            <span className="text-white/20 text-[10px]">•</span>
                                                                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">{appt.topic}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40">
                                                                        <MoreVertical size={16} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setSelectedSlot(time)}
                                                                    className="flex-1 flex items-center text-white/20 hover:text-accent font-black uppercase tracking-widest text-[10px] transition-all group/btn"
                                                                >
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 group-hover/btn:bg-accent group-hover/btn:text-white transition-all">
                                                                        <Plus size={16} />
                                                                    </div>
                                                                    Disponible para agenda
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Form Area (appears when slot is selected) */}
                                {selectedSlot && (
                                    <div ref={formRef} className="mt-16 glass-dark rounded-[3.5rem] p-12 border border-accent/30 shadow-premium animate-fade-in relative overflow-hidden group/form">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Save size={120} className="text-accent" />
                                        </div>
                                        <div className="flex justify-between items-center mb-10 relative z-10">
                                            <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                                                Manual Entry <span className="text-accent not-italic font-black mx-2 opacity-30 shadow-text-premium">{selectedSlot}</span>
                                            </h4>
                                            <button onClick={() => setSelectedSlot(null)} className="flex items-center gap-2 text-[10px] font-black text-white/20 hover:text-red-400 uppercase tracking-widest group/close transition-all">
                                                <div className="w-8 h-8 glass rounded-full flex items-center justify-center group-hover/close:bg-red-500/10"><X size={14} /></div>
                                                Descartar
                                            </button>
                                        </div>
                                        <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-8 relative z-10">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Identidad del Lead</label>
                                                <div className="relative group">
                                                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
                                                        placeholder="Nombre Completo"
                                                        value={newApptData.clientName}
                                                        onChange={e => setNewApptData({ ...newApptData, clientName: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Canal Digital</label>
                                                <div className="relative group">
                                                    <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                                                    <input
                                                        type="email"
                                                        className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
                                                        placeholder="email@institucion.org"
                                                        value={newApptData.email}
                                                        onChange={e => setNewApptData({ ...newApptData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Organización</label>
                                                <div className="relative group">
                                                    <Briefcase size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                                                    <input
                                                        type="text"
                                                        className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
                                                        placeholder="Entidad / ONG / Empresa"
                                                        value={newApptData.organization}
                                                        onChange={e => setNewApptData({ ...newApptData, organization: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Categoría de Servicio</label>
                                                <select
                                                    className="w-full h-16 px-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium appearance-none italic"
                                                    value={newApptData.needType}
                                                    onChange={e => setNewApptData({ ...newApptData, needType: e.target.value })}
                                                >
                                                    <option className="bg-dark">Diagnóstico HPO</option>
                                                    <option className="bg-dark">Evaluación de Impacto</option>
                                                    <option className="bg-dark">Diseño de Proyectos</option>
                                                    <option className="bg-dark">Otro</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-4">Tema de la Sesión</label>
                                                <div className="relative group">
                                                    <Sparkles size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" />
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 ring-accent/20 transition-all shadow-inner-premium placeholder:text-white/10"
                                                        placeholder="Ej: Fortalecimiento de Liderazgo Comunitario"
                                                        value={newApptData.topic}
                                                        onChange={e => setNewApptData({ ...newApptData, topic: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full h-20 bg-accent text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-accent/20 text-lg italic flex items-center justify-center disabled:opacity-50"
                                                >
                                                    {isSubmitting ? (
                                                        <Loader2 className="animate-spin mr-4" size={24} />
                                                    ) : (
                                                        <Save size={24} className="mr-4" />
                                                    )}
                                                    {isSubmitting ? 'Encriptando Datos...' : 'Registrar Intervención'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;