import React, { useState } from 'react';
import { X, Plus, Search, Sparkles, CheckCircle2, Mail, Phone } from 'lucide-react';
import { AppointmentData } from '../../types';

interface DayModalProps {
    day: number;
    month: Date;
    appointments: AppointmentData[];
    onClose: () => void;
    onViewLead: (appt: AppointmentData) => void;
    onSaveAppointment: (appt: AppointmentData) => Promise<void>;
}

const DayModal: React.FC<DayModalProps> = ({ day, month, appointments, onClose, onViewLead, onSaveAppointment }) => {
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<AppointmentData>>({
        clientName: '',
        email: '',
        phone: '',
        organization: '',
        needType: 'Diagnóstico Organizacional HPO',
        topic: '',
        notes: 'Agendado manualmente por Admin'
    });

    const morningSlots = ["09:00", "10:00", "11:00", "12:00"];
    const afternoonSlots = ["14:00", "15:00", "16:00", "17:00", "18:00"];

    // Búsqueda Ultra-Robusta de Citas
    const getApptForSlot = (time: string) => {
        const targetYear = month.getFullYear();
        const targetMonth = month.getMonth();
        const targetDay = day;
        const [targetH] = time.split(':').map(n => parseInt(n, 10));

        return appointments.find(a => {
            if (a.status === 'closed' || !a.preferredDateTime) return false;

            const d = new Date(a.preferredDateTime);
            if (isNaN(d.getTime())) return false;

            // Comparar en tiempo local del navegador para que coincida con lo que el admin ve
            const isMatch = d.getFullYear() === targetYear &&
                d.getMonth() === targetMonth &&
                d.getDate() === targetDay &&
                d.getHours() === targetH;

            return isMatch;
        });
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;
        setIsSubmitting(true);
        try {
            // Formato normalizado: YYYY-MM-DDTHH:mm:ss para parseo robusto
            const monthStr = String(month.getMonth() + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateTimeString = `${month.getFullYear()}-${monthStr}-${dayStr}T${selectedSlot}:00`;

            const success = await onSaveAppointment({
                ...formData as AppointmentData,
                preferredDateTime: dateTimeString,
                phone: formData.phone || '',
                consultant: 'Admin Manual',
                status: 'scheduled'
            });

            if (success) {
                setSelectedSlot(null);
                setFormData({
                    clientName: '',
                    email: '',
                    phone: '',
                    organization: '',
                    needType: 'Diagnóstico Organizacional HPO',
                    topic: '',
                    notes: 'Agendado manualmente por Admin'
                });
            }
        } catch (error) {
            alert("Error al agendar. Verifique su conexión.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSlot = (time: string) => {
        const appt = getApptForSlot(time);
        const isSelected = selectedSlot === time;

        return (
            <div key={time} className="space-y-2">
                <div
                    onClick={() => !appt && setSelectedSlot(isSelected ? null : time)}
                    className={`p-2 rounded-xl border min-h-[50px] flex items-center transition-all cursor-pointer group ${appt ? 'bg-primary/10 border-primary/20' :
                        isSelected ? 'bg-accent/20 border-accent/30' :
                            'bg-white/5 border-white/5 hover:bg-white/[0.08]'
                        }`}
                >
                    <div className="w-12 flex items-center justify-center border-r border-white/10 mr-3 font-black text-white/20 text-[9px] italic leading-none shrink-0">{time}</div>

                    {appt ? (
                        <div className="flex-1 flex justify-between items-center overflow-hidden min-w-0">
                            <div className="overflow-hidden">
                                <div className="font-bold text-white text-[11px] italic leading-tight truncate">{appt.clientName}</div>
                                <div className="flex gap-1.5 items-center text-[7px] font-bold uppercase tracking-wider text-white/30 truncate mt-0.5">
                                    <span className="text-secondary truncate">{appt.organization || 'ORG'}</span>
                                    <span>•</span>
                                    <span className="truncate">{appt.topic || 'Sin tema'}</span>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onViewLead(appt); }} className="w-6 h-6 glass rounded-lg flex items-center justify-center text-accent ml-2 shrink-0 hover:bg-accent hover:text-dark transition-colors">
                                <Search size={10} />
                            </button>
                        </div>
                    ) : (
                        <div className={`flex-1 flex items-center font-black uppercase text-[8px] tracking-widest transition-all ${isSelected ? 'text-accent' : 'text-white/10 group-hover:text-white/30'}`}>
                            {isSelected ? 'Registrar Cita' : 'Disponible'}
                        </div>
                    )}
                </div>

                {isSelected && (
                    <div className="p-4 bg-white/5 rounded-xl border border-accent/20 animate-in slide-in-from-top-2 duration-300">
                        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-3">
                            <input
                                required
                                className="w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-medium outline-none focus:border-accent/40"
                                placeholder="Nombre Cliente"
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                            />
                            <input
                                className="w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-medium outline-none focus:border-accent/40"
                                placeholder="Organización"
                                value={formData.organization}
                                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                            />
                            <input
                                required
                                className="col-span-2 w-full h-8 px-3 bg-white/5 border border-accent/20 rounded-lg text-white text-[10px] font-medium outline-none focus:border-accent"
                                placeholder="Tema / Requerimiento"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            />
                            <input
                                required
                                type="email"
                                className="w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-medium outline-none focus:border-accent/40"
                                placeholder="Email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                required
                                className="w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-medium outline-none focus:border-accent/40"
                                placeholder="Teléfono"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="col-span-2 h-9 bg-accent text-dark font-black uppercase tracking-widest rounded-lg text-[9px] italic hover:scale-[1.01] active:scale-95 transition-all"
                            >
                                {isSubmitting ? 'REGISTRANDO...' : 'CONFIRMAR CITA'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-dark/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
                <div className="p-4 md:p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                    <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 bg-accent text-dark rounded-xl flex items-center justify-center font-black text-base italic">{day}</div>
                        <div>
                            <h3 className="text-sm md:text-base font-black text-white italic tracking-tighter uppercase leading-tight">
                                {month.toLocaleString('es-ES', { month: 'long' })} {month.getFullYear()}
                            </h3>
                            <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Gestión de Agenda</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-none">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-start">
                        <div className="space-y-3">
                            <h4 className="text-[7px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-1.5 flex items-center gap-2">☀️ MAÑANA</h4>
                            <div className="space-y-2">{morningSlots.map(renderSlot)}</div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[7px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-1.5 flex items-center gap-2">🌤️ TARDE</h4>
                            <div className="space-y-2">{afternoonSlots.map(renderSlot)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayModal;
