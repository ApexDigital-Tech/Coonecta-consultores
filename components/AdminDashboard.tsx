import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus, saveAppointment } from '../utils/storage';
import { AppointmentData } from '../types';
import { Bell, Loader2, Sparkles } from 'lucide-react';

// Modulares del Admin
import Sidebar from './admin/Sidebar';
import StatsSummary from './admin/StatsSummary';
import ListView from './admin/ListView';
import CalendarView from './admin/CalendarView';
import LeadModal from './admin/LeadModal';
import DayModal from './admin/DayModal';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Modales
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [viewingLead, setViewingLead] = useState<AppointmentData | null>(null);

    useEffect(() => {
        refreshData();
        const handleSync = () => refreshData();
        window.addEventListener('appointment-saved', handleSync);
        return () => window.removeEventListener('appointment-saved', handleSync);
    }, []);

    const refreshData = async () => {
        setLoading(true);
        try {
            const data = await getAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Error en refreshData:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: AppointmentData['status']) => {
        const success = await updateAppointmentStatus(id, status);
        if (success) refreshData();
    };

    const handleManualSave = async (appt: AppointmentData) => {
        const success = await saveAppointment(appt);
        if (success) {
            await refreshData();
            return true;
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-dark flex font-display text-white overflow-hidden relative">
            <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />

            <Sidebar currentView={view} setView={setView} onLogout={onLogout} />

            <main className="flex-1 h-screen overflow-hidden flex flex-col relative z-10">
                <header className="px-5 py-4 md:px-8 md:py-5 flex flex-col md:flex-row justify-between items-center bg-dark/40 backdrop-blur-xl border-b border-white/5 gap-4">
                    <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto">
                        <div className="flex flex-col">
                            <h1 className="text-base md:text-lg font-black italic tracking-tighter text-white">Dashboard <span className="text-accent">Victoria</span></h1>
                            <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] -mt-0.5">Control de Gestión</p>
                        </div>
                        <div className="flex-1 md:flex-none">
                            <StatsSummary appointments={appointments} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <button onClick={refreshData} className="p-2.5 bg-white/5 rounded-lg text-white/40 hover:text-accent transition-all group">
                            <Loader2 size={16} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        </button>

                        <div className="relative">
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-dark flex items-center justify-center text-[6px] font-black text-dark">
                                {appointments.filter(a => a.status === 'new' || !a.status).length}
                            </div>
                            <button className="w-9 h-9 glass rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <Bell size={16} />
                            </button>
                        </div>

                        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-accent/50 to-primary/50 p-0.5 ml-2">
                            <div className="w-full h-full bg-dark rounded-[7px] flex items-center justify-center font-black text-accent italic text-[10px]">AD</div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-none">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6">
                            <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center animate-float">
                                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                            </div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Sincronizando...</p>
                        </div>
                    ) : view === 'list' ? (
                        <ListView
                            appointments={appointments}
                            onViewDetail={setViewingLead}
                            onStatusChange={handleStatusUpdate}
                        />
                    ) : (
                        <CalendarView
                            currentMonth={currentMonth}
                            appointments={appointments}
                            onNextMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            onPrevMonth={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            onSelectDay={setSelectedDay}
                        />
                    )}
                </div>

                {/* Modales */}
                {selectedDay && (
                    <DayModal
                        day={selectedDay}
                        month={currentMonth}
                        appointments={appointments}
                        onClose={() => setSelectedDay(null)}
                        onViewLead={setViewingLead}
                        onSaveAppointment={handleManualSave}
                    />
                )}

                {viewingLead && (
                    <LeadModal
                        lead={viewingLead}
                        onClose={() => setViewingLead(null)}
                        onStatusChange={handleStatusUpdate}
                    />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;