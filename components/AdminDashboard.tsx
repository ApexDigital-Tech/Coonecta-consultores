import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus, saveAppointment } from '../utils/storage';
import { AppointmentData } from '../types';
import { 
  Calendar, Users, Bell, Search, CheckCircle, Clock, 
  XCircle, MoreVertical, LogOut, ChevronLeft, ChevronRight,
  Plus, X, Save, User, Mail, Briefcase, Loader2
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
  
  // Manual Scheduling Form State
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // "09:00", "15:00"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newApptData, setNewApptData] = useState<Partial<AppointmentData>>({
    clientName: '',
    email: '',
    organization: '',
    needType: 'Diagnóstico Organizacional HPO',
    notes: 'Agendado manualmente por Admin'
  });

  useEffect(() => {
    refreshData();
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
        preferredDateTime: dateTimeString,
        consultant: 'Asignado Manualmente',
        notes: newApptData.notes || '',
        status: 'scheduled'
    };

    await saveAppointment(newAppt);
    await refreshData();
    
    setIsSubmitting(false);
    setSelectedSlot(null); // Close form
    setNewApptData({
        clientName: '',
        email: '',
        organization: '',
        needType: 'Diagnóstico Organizacional HPO',
        notes: 'Agendado manualmente por Admin'
    });
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
              return (
                  apptDate.getFullYear() === targetYear &&
                  apptDate.getMonth() === targetMonth &&
                  apptDate.getDate() === day &&
                  apptDate.getHours() === targetHour
              );
          }

          // Fallback: String matching
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
                    )
                )}
            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center">
            <img src="/conecta-logo.png" alt="Conecta" className="h-8 brightness-0 invert opacity-90 mr-3" />
            <span className="font-bold tracking-wide">ADMIN</span>
        </div>
        <nav className="p-4 space-y-2 flex-1">
            <button 
                onClick={() => setView('calendar')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}
            >
                <Calendar size={20} className="mr-3" />
                Calendario
            </button>
            <button 
                onClick={() => setView('list')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}`}
            >
                <Users size={20} className="mr-3" />
                Lista de Leads
            </button>
        </nav>
        <div className="p-4 border-t border-white/10">
            <button onClick={onLogout} className="flex items-center text-gray-300 hover:text-white transition-colors w-full">
                <LogOut size={20} className="mr-3" />
                Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm z-20 px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
                {view === 'list' ? 'Gestión de Leads' : 'Agenda de Consultas'}
            </h1>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow">
                        A
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-gray-800">Admin</p>
                        <p className="text-xs text-gray-500">Conecta Consultores</p>
                    </div>
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : view === 'list' ? (
                // CRM LIST VIEW
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Cliente / Org</th>
                                <th className="px-6 py-4">Necesidad</th>
                                <th className="px-6 py-4">Fecha Preferida</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointments.map((appt) => (
                                <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{appt.clientName}</div>
                                        <div className="text-sm text-gray-500">{appt.organization}</div>
                                        <div className="text-xs text-gray-400 mt-1">{appt.email}</div>
                                        {appt.phone && <div className="text-xs text-gray-400">{appt.phone}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-pale text-primary px-2 py-1 rounded text-xs font-semibold border border-blue-100">
                                            {appt.needType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <Clock size={14} className="mr-2 text-gray-400" />
                                            {appt.preferredDateTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                            appt.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                            appt.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {appt.status || 'NEW'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleStatusChange(appt.id!, 'scheduled')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"><CheckCircle size={18} /></button>
                                        <button onClick={() => handleStatusChange(appt.id!, 'closed')} className="p-2 bg-gray-50 text-gray-400 rounded hover:bg-gray-100"><XCircle size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // CALENDAR VIEW
                <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[600px]">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
                            <h2 className="text-2xl font-bold capitalize text-dark">
                                {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4 mb-4 text-center text-gray-400 text-sm font-semibold uppercase">
                        <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-4">
                        {generateCalendarDays().map((day, idx) => {
                            if (!day) return <div key={idx} className="h-32 bg-gray-50/30 rounded-lg"></div>;
                            
                            const dayCount = getDayCount(day);

                            return (
                                <div 
                                    key={idx} 
                                    onClick={() => { setSelectedDay(day); setShowDayModal(true); }}
                                    className={`h-32 border rounded-xl p-3 transition-all cursor-pointer group relative ${dayCount > 0 ? 'bg-blue-50/50 border-blue-200' : 'bg-white hover:border-primary hover:shadow-md'}`}
                                >
                                    <span className={`text-lg font-bold block mb-2 ${dayCount > 0 ? 'text-primary' : 'text-gray-700'}`}>{day}</span>
                                    
                                    {dayCount > 0 && (
                                        <div className="absolute bottom-3 right-3 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                            {dayCount} Citas
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">Ver Agenda</span>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                    {/* Modal Header */}
                    <div className="bg-primary p-6 flex justify-between items-center text-white shrink-0">
                        <div>
                            <h3 className="text-2xl font-bold">Agenda del Día</h3>
                            <p className="text-blue-200">
                                {selectedDay} de {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <button onClick={() => { setShowDayModal(false); setSelectedSlot(null); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        
                        {/* Split View */}
                        <div className="grid md:grid-cols-2 gap-8">
                            
                            {/* Morning Column */}
                            <div>
                                <h4 className="flex items-center text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                                    <span className="mr-2">☀️</span> Mañana
                                </h4>
                                <div className="space-y-3">
                                    {morningSlots.map(time => renderSlot(time))}
                                </div>
                            </div>

                            {/* Afternoon Column */}
                            <div>
                                <h4 className="flex items-center text-lg font-bold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                                    <span className="mr-2">🌤️</span> Tarde
                                </h4>
                                <div className="space-y-3">
                                    {afternoonSlots.map(time => renderSlot(time))}
                                </div>
                            </div>
                        </div>

                        {/* Manual Form Area (appears when slot is selected) */}
                        {selectedSlot && (
                            <div className="mt-8 bg-white border-2 border-secondary/20 rounded-xl p-6 shadow-lg animate-fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-bold text-secondary flex items-center">
                                        <Clock className="mr-2" size={20}/>
                                        Agendar para las {selectedSlot}
                                    </h4>
                                    <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-red-500">
                                        Cancelar
                                    </button>
                                </div>
                                <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                                                placeholder="Nombre del cliente"
                                                value={newApptData.clientName}
                                                onChange={e => setNewApptData({...newApptData, clientName: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input 
                                                type="email" 
                                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                                                placeholder="correo@ejemplo.com"
                                                value={newApptData.email}
                                                onChange={e => setNewApptData({...newApptData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Organización</label>
                                        <div className="relative">
                                            <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                                            <input 
                                                type="text" 
                                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                                                placeholder="ONG / Empresa"
                                                value={newApptData.organization}
                                                onChange={e => setNewApptData({...newApptData, organization: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Necesidad</label>
                                        <select 
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-white"
                                            value={newApptData.needType}
                                            onChange={e => setNewApptData({...newApptData, needType: e.target.value})}
                                        >
                                            <option>Diagnóstico Organizacional HPO</option>
                                            <option>Evaluación de Impacto</option>
                                            <option>Diseño de Proyectos</option>
                                            <option>Otro</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="animate-spin mr-2" size={18} />
                                            ) : (
                                                <Save size={18} className="mr-2" />
                                            )}
                                            {isSubmitting ? 'Guardando...' : 'Confirmar Cita'}
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