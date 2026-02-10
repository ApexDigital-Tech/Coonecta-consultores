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

    // Detail Modal State
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showDayModal, setShowDayModal] = useState(false);
    const [viewingAppt, setViewingAppt] = useState<AppointmentData | null>(null);
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
        try {
            const data = await getAppointments();
            console.log(`📊 Dashboard Sync: ${data.length} registros cargados desde Supabase.`);
            setAppointments(data);
        } catch (error) {
            console.error("❌ Error en refreshData:", error);
        } finally {
            setLoading(false);
        }
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

                            {/* Detail Tooltip or Click to View */}
                            <div
                                onClick={(e) => { e.stopPropagation(); setViewingAppt(appt); }}
                                className="absolute inset-0 z-10 cursor-pointer"
                            />
                            <div className="absolute left-0 top-full mt-2 z-50 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-xl w-72 hidden group-hover/tooltip:block border border-white/10 backdrop-blur-md">
                                <div className="mb-2 pb-1 border-b border-gray-600 font-bold text-accent flex justify-between items-center">
                                    <span>Ficha Técnica Lead</span>
                                    <Sparkles size={10} />
                                </div>
                                <div className="grid grid-cols-[20px_1fr] gap-2">
                                    <span className="opacity-50">📧</span> <span className="truncate font-medium">{appt.email || 'No registrado'}</span>
                                    <span className="opacity-50">📞</span> <span className="truncate font-medium">{appt.phone || 'No registrado'}</span>
                                    <span className="opacity-50">🏢</span> <span className="truncate font-medium">{appt.organization}</span>
                                    <span className="opacity-50">🕒</span> <span className="font-medium">{appt.preferredDateTime}</span>
                                    <span className="opacity-50">📝</span> <span className="line-clamp-2 italic">{appt.notes || 'Sin notas adicionales'}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-600 text-[9px] font-black uppercase tracking-widest text-center text-accent/60">Clic para ver expediente completo</div>
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
            <aside className="w-64 glass-dark flex-shrink-0 hidden lg:flex flex-col border-r border-white/5 z-20">
                <div className="p-8 border-b border-white/5 flex flex-col items-center">
                    <div className="mb-4 p-3 glass rounded-2xl shadow-premium ring-1 ring-white/10">
                        {/* Placeholder or Logo fix */}
                        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-dark italic text-xl">C</div>
                    </div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Control Panel</span>
                </div>

                <nav className="p-4 space-y-2 flex-1">
                    <button
                        onClick={() => setView('calendar')}
                        className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-300 group ${view === 'calendar' ? 'bg-primary/40 text-white shadow-lg shadow-primary/10 border border-primary/20 italic font-black' : 'text-white/30 hover:bg-white/5 hover:text-white font-bold'}`}
                    >
                        <Calendar size={18} className={`mr-3 ${view === 'calendar' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                        <span className="text-sm">Calendario</span>
                        {view === 'calendar' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-300 group ${view === 'list' ? 'bg-primary/40 text-white shadow-lg shadow-primary/10 border border-primary/20 italic font-black' : 'text-white/30 hover:bg-white/5 hover:text-white font-bold'}`}
                    >
                        <Users size={18} className={`mr-3 ${view === 'list' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                        <span className="text-sm">Leads de Impacto</span>
                        {view === 'list' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                    </button>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button onClick={onLogout} className="flex items-center text-white/20 hover:text-red-400 transition-all w-full font-black uppercase tracking-widest text-[9px] group px-4">
                        <LogOut size={14} className="mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-hidden flex flex-col relative z-10">
                {/* Header */}
                <header className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-dark/40 backdrop-blur-xl">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black italic tracking-tighter text-white">Dashboard <span className="text-accent">Victoria</span></h1>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Lead Management</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="hidden xl:flex items-center gap-6 pl-8 border-l border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total</span>
                                <span className="text-lg font-black text-white italic leading-tight">{appointments.length}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-6">
                                <span className="text-[9px] font-black text-blue-400/40 uppercase tracking-widest">Nuevos</span>
                                <span className="text-lg font-black text-blue-400 italic leading-tight">{appointments.filter(a => a.status === 'new' || !a.status).length}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-6">
                                <span className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">Agendados</span>
                                <span className="text-lg font-black text-secondary italic leading-tight">{appointments.filter(a => a.status === 'scheduled').length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={refreshData}
                            className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-accent hover:bg-white/10 transition-all group"
                            title="Sincronizar Datos"
                        >
                            <Loader2 size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        </button>

                        <div className="relative group">
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-dark flex items-center justify-center text-[7px] font-black text-dark">
                                {appointments.filter(a => a.status === 'new' || !a.status).length}
                            </div>
                            <button className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <Bell size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 pl-4 border-l border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-primary p-0.5 shadow-lg">
                                <div className="w-full h-full bg-dark rounded-[9px] flex items-center justify-center font-black text-accent italic text-xs">AD</div>
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
                                                        <button onClick={() => setViewingAppt(appt)} className="w-12 h-12 bg-white/5 text-accent rounded-2xl hover:bg-accent hover:text-dark transition-all flex items-center justify-center shadow-premium" title="Expediente Completo"><Search size={20} /></button>
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
                        <div className="glass-dark rounded-[2.5rem] shadow-premium border border-white/5 p-8 min-h-[600px] animate-zoom-in">
                            <div className="flex justify-between items-center mb-10 px-4">
                                <div className="flex flex-col">
                                    <h2 className="text-3xl font-black capitalize text-white tracking-tighter italic">
                                        {currentMonth.toLocaleString('es-ES', { month: 'long' })}
                                        <span className="text-accent ml-3 not-italic font-black opacity-30 tracking-[0.2em]">{currentMonth.getFullYear()}</span>
                                    </h2>
                                </div>
                                <div className="flex items-center p-1.5 bg-white/5 rounded-2xl border border-white/10">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white group"><ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /></button>
                                    <div className="w-px h-6 bg-white/5 mx-2" />
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white group"><ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>
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
                                            onClick={() => { setSelectedDay(day); setShowDayModal(true); }}
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
                    )}
                </div>

                {/* DAY DETAIL MODAL */}
                {showDayModal && selectedDay && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/95 backdrop-blur-xl p-4 lg:p-12 animate-in fade-in duration-500">
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] shadow-premium w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                                <div className="flex gap-6 items-center">
                                    <div className="w-14 h-14 bg-accent text-dark rounded-2xl flex items-center justify-center font-black text-2xl italic">
                                        {selectedDay}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                            {currentMonth.toLocaleString('es-ES', { month: 'long' })} {currentMonth.getFullYear()}
                                        </h3>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Planificación Diaria • Command Center</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowDayModal(false); setSelectedSlot(null); }}
                                    className="w-12 h-12 glass rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-none">
                                <div className="grid lg:grid-cols-2 gap-10">
                                    {/* Morning */}
                                    <div className="space-y-6">
                                        <h4 className="flex items-center text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">
                                            <span className="mr-3 text-xl not-italic">☀️</span> Mañana
                                        </h4>
                                        <div className="space-y-2.5">
                                            {morningSlots.map(time => {
                                                const appt = getApptForSlot(selectedDay, time);
                                                return (
                                                    <div key={time} className="group relative">
                                                        <div className={`p-4 rounded-xl border min-h-[70px] flex items-center transition-all ${appt ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                                            }`}>
                                                            <div className="w-16 flex items-center justify-center border-r border-white/10 mr-4 font-black text-white/40 text-sm italic">
                                                                {time}
                                                            </div>
                                                            {appt ? (
                                                                <div className="flex-1 flex justify-between items-center overflow-hidden">
                                                                    <div className="overflow-hidden">
                                                                        <div className="font-black text-white text-base italic leading-none mb-1 truncate">{appt.clientName}</div>
                                                                        <div className="flex gap-2 items-center text-[8px] font-bold uppercase tracking-wider text-white/40">
                                                                            <span className="text-accent truncate">{appt.organization}</span>
                                                                            <span>•</span>
                                                                            <span className="truncate">{appt.topic}</span>
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => setViewingAppt(appt)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-accent ml-2 shrink-0"><Search size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setSelectedSlot(time)} className="flex-1 flex items-center text-white/20 hover:text-accent font-black uppercase text-[9px] tracking-widest transition-all">
                                                                    <Plus size={12} className="mr-2" /> Disponible
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Afternoon */}
                                    <div className="space-y-6">
                                        <h4 className="flex items-center text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">
                                            <span className="mr-3 text-xl not-italic">🌤️</span> Tarde
                                        </h4>
                                        <div className="space-y-2.5">
                                            {afternoonSlots.map(time => {
                                                const appt = getApptForSlot(selectedDay, time);
                                                return (
                                                    <div key={time} className="group relative">
                                                        <div className={`p-4 rounded-xl border min-h-[70px] flex items-center transition-all ${appt ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                                                            }`}>
                                                            <div className="w-16 flex items-center justify-center border-r border-white/10 mr-4 font-black text-white/40 text-sm italic">
                                                                {time}
                                                            </div>
                                                            {appt ? (
                                                                <div className="flex-1 flex justify-between items-center overflow-hidden">
                                                                    <div className="overflow-hidden">
                                                                        <div className="font-black text-white text-base italic leading-none mb-1 truncate">{appt.clientName}</div>
                                                                        <div className="flex gap-2 items-center text-[8px] font-bold uppercase tracking-wider text-white/40">
                                                                            <span className="text-accent truncate">{appt.organization}</span>
                                                                            <span>•</span>
                                                                            <span className="truncate">{appt.topic}</span>
                                                                        </div>
                                                                    </div>
                                                                    <button onClick={() => setViewingAppt(appt)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-accent ml-2 shrink-0"><Search size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => setSelectedSlot(time)} className="flex-1 flex items-center text-white/20 hover:text-accent font-black uppercase text-[9px] tracking-widest transition-all">
                                                                    <Plus size={12} className="mr-2" /> Disponible
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                {selectedSlot && (
                                    <div ref={formRef} className="mt-10 glass-dark rounded-[2rem] p-8 border border-accent/20 animate-fade-in">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Nuevo Registro <span className="text-accent opacity-50">@{selectedSlot}</span></h4>
                                            <button onClick={() => setSelectedSlot(null)} className="text-[9px] font-black text-white/20 hover:text-red-400 uppercase flex items-center gap-1"><X size={12} /> Descartar</button>
                                        </div>
                                        <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-4">
                                            <input required className="w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-accent/30" placeholder="Nombre Lead" value={newApptData.clientName} onChange={e => setNewApptData({ ...newApptData, clientName: e.target.value })} />
                                            <input className="w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-accent/30" placeholder="Email" value={newApptData.email} onChange={e => setNewApptData({ ...newApptData, email: e.target.value })} />
                                            <input required className="md:col-span-2 w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-accent/30" placeholder="Tema de la Sesión" value={newApptData.topic} onChange={e => setNewApptData({ ...newApptData, topic: e.target.value })} />
                                            <button type="submit" disabled={isSubmitting} className="md:col-span-2 h-14 bg-accent text-dark font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all shadow-lg text-xs italic">{isSubmitting ? 'Registrando...' : 'Confirmar Cita'}</button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* APPOINTMENT DETAIL MODAL (LEAD EXPEDIENTE) */}
                {viewingAppt && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dark/98 backdrop-blur-2xl p-4 lg:p-12 animate-in fade-in duration-500">
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
                            {/* Modal Header */}
                            <div className="p-10 border-b border-white/5 bg-white/[0.02] flex justify-between items-center shrink-0">
                                <div className="flex gap-6 items-center">
                                    <div className="w-20 h-20 glass rounded-[1.8rem] flex items-center justify-center text-accent shadow-premium">
                                        <User size={40} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-accent/20">Expediente Lead</span>
                                            {viewingAppt.status === 'new' && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                                        </div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none truncate max-w-md">
                                            {viewingAppt.clientName}
                                        </h3>
                                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                            <Briefcase size={12} className="text-accent" />
                                            {viewingAppt.organization}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingAppt(null)} className="w-14 h-14 glass rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all hover:rotate-90">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-12 relative z-10 grid md:grid-cols-2 gap-12 max-h-[60vh] overflow-y-auto scrollbar-none">
                                {/* Contact Info */}
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-4 italic">Información de Enlace</h4>
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-6 group">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner-premium border border-white/5">
                                                    <Mail size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Canal de Comunicación</p>
                                                    <p className="text-lg font-bold text-white group-hover:text-accent transition-colors">{viewingAppt.email || 'No registrado'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 group">
                                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-inner-premium border border-white/5">
                                                    <Phone size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Contacto Directo</p>
                                                    <p className="text-lg font-bold text-white group-hover:text-secondary transition-colors">{viewingAppt.phone || 'No registrado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-4 italic">Agenda Estratégica</h4>
                                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar size={60} className="text-accent" /></div>
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Fecha y Hora Propuesta</p>
                                                <p className="text-xl font-black text-accent italic">{viewingAppt.preferredDateTime}</p>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Consultor Asignado:</span>
                                                    <span className="text-[11px] font-bold text-white/60 italic">{viewingAppt.consultant}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Context */}
                                <div className="space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-4 italic">Eje Temático</h4>
                                        <div className="bg-primary/20 rounded-3xl p-8 border border-primary/30 shadow-inner-premium relative overflow-hidden group/topic">
                                            <Sparkles size={120} className="absolute -bottom-10 -right-10 text-accent opacity-5 group-hover/topic:opacity-10 transition-opacity" />
                                            <div className="relative z-10">
                                                <div className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-accent/20 mb-4">{viewingAppt.needType}</div>
                                                <h5 className="text-2xl font-black text-white italic tracking-tighter leading-tight mb-4">{viewingAppt.topic}</h5>
                                                <div className="w-12 h-1 bg-accent/30 rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-4 italic">Notas de Diagnóstico Inicial</h4>
                                        <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 min-h-[140px]">
                                            <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                                                {viewingAppt.notes || "El lead no ha dejado comentarios adicionales. Se requiere auditoría en la primera sesión."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer (Actions) */}
                            <div className="p-12 relative z-10 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                                <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic ${viewingAppt.status === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    viewingAppt.status === 'scheduled' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                        'bg-white/5 text-white/30 border border-white/10'
                                    }`}>
                                    Estado: {viewingAppt.status || 'NEW'}
                                </span>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { handleStatusChange(viewingAppt.id!, 'scheduled'); setViewingAppt(null); }}
                                        className="h-16 px-8 bg-secondary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/20 italic flex items-center gap-3"
                                    >
                                        <CheckCircle size={18} /> Validar y Agendar
                                    </button>
                                    <button
                                        onClick={() => { handleStatusChange(viewingAppt.id!, 'closed'); setViewingAppt(null); }}
                                        className="h-16 px-8 bg-white/5 text-white/40 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all border border-white/10"
                                    >
                                        Archivar Lead
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;