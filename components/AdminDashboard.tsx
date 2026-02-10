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
                <header className="px-8 py-6 flex justify-between items-center border-b border-white/5 bg-dark/40 backdrop-blur-xl">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black italic tracking-tighter text-white">Dashboard <span className="text-accent">Victoria</span></h1>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Lead Management</p>
                        </div>
                        <StatsSummary appointments={appointments} />
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={refreshData} className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-accent transition-all group">
                            <Loader2 size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        </button>

                        <div className="relative">
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-dark flex items-center justify-center text-[7px] font-black text-dark">
                                {appointments.filter(a => a.status === 'new' || !a.status).length}
                            </div>
                            <button className="w-10 h-10 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all">
                                <Bell size={18} />
                            </button>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-primary p-0.5 shadow-lg ml-4">
                            <div className="w-full h-full bg-dark rounded-[9px] flex items-center justify-center font-black text-accent italic text-xs">AD</div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 scrollbar-none">
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