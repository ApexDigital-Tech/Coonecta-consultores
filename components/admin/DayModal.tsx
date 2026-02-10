import React, { useState } from 'react';
import { X, Plus, Search, Sparkles, CheckCircle2 } from 'lucide-react';
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
        const targetHour = parseInt(time.split(':')[0], 10);

        return appointments.find(a => {
            if (a.status === 'closed' || !a.preferredDateTime) return false;

            // Caso 1: Match por String (Chatbot Victoria e ISO)
            // Victoria guarda: 2026-02-11T09:00
            // Manual guarda: 2026-02-11 09:00
            const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
            const timeStr = time; // "09:00"
            const norm = a.preferredDateTime.replace('T', ' ');

            if (norm.includes(dateStr) && norm.includes(timeStr)) return true;

            // Caso 2: Match por Objeto Date
            const d = new Date(a.preferredDateTime);
            if (!isNaN(d.getTime())) {
                const sameDay = d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === targetDay;
                if (sameDay && d.getHours() === targetHour) return true;
            }

            return false;
        });
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;
        setIsSubmitting(true);
        try {
            // Formato normalizado: YYYY-MM-DD HH:mm
            const dateTimeString = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${selectedSlot}`;

            await onSaveAppointment({
                ...formData as AppointmentData,
                preferredDateTime: dateTimeString,
                phone: formData.phone || '',
                consultant: 'Admin Manual',
                status: 'scheduled'
            });

            setSelectedSlot(null);
            setFormData({
                clientName: '',
                email: '',
                organization: '',
                needType: 'Diagnóstico Organizacional HPO',
                topic: '',
                notes: 'Agendado manualmente por Admin'
            });
        } catch (error) {
            alert("Error al agendar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSlot = (time: string) => {
        const appt = getApptForSlot(time);
        const isSelected = selectedSlot === time;

        return (
            <div key={time} className="space-y-3">
                <div
                    onClick={() => !appt && setSelectedSlot(isSelected ? null : time)}
                    className={`p-3 rounded-xl border min-h-[60px] flex items-center transition-all cursor-pointer ${appt ? 'bg-primary/20 border-primary/30' :
                            isSelected ? 'bg-accent/30 border-accent/60 shadow-[0_0_20px_rgba(212,175,55,0.2)]' :
                                'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                        }`}
                >
                    <div className="w-14 flex items-center justify-center border-r border-white/10 mr-4 font-black text-white/30 text-xs italic leading-none">{time}</div>

                    {appt ? (
                        <div className="flex-1 flex justify-between items-center overflow-hidden">
                            <div className="overflow-hidden">
                                <div className="font-black text-white text-sm italic leading-tight truncate">{appt.clientName}</div>
                                <div className="flex gap-2 items-center text-[7px] font-bold uppercase tracking-wider text-white/30 mt-0.5">
                                    <span className="text-accent truncate">{appt.organization || 'ORG'}</span>
                                    <span>•</span>
                                    <span className="truncate">{appt.topic || 'Sin tema'}</span>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onViewLead(appt); }} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-accent ml-2 shrink-0 hover:bg-accent hover:text-dark transition-colors"><Search size={12} /></button>
                        </div>
                    ) : (
                        <div className={`flex-1 flex items-center font-black uppercase text-[8px] tracking-[0.2em] transition-all ${isSelected ? 'text-accent' : 'text-white/10 group-hover:text-accent/60'}`}>
                            {isSelected ? (
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={12} className="text-accent animate-pulse" />
                                    <span>Completar Registro</span>
                                </div>
                            ) : (
                                <>
                                    <Plus size={10} className="mr-2" /> Disponible
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* FORMULARIO INLINE */}
                {isSelected && (
                    <div className="p-5 glass-dark rounded-xl border border-accent/30 animate-in slide-in-from-top-2 duration-300">
                        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-3">
                            <input
                                required
                                className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-bold outline-none focus:border-accent/40"
                                placeholder="Nombre Cliente"
                                value={formData.clientName}
                                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                            />
                            <input
                                className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-bold outline-none focus:border-accent/40"
                                placeholder="Organización"
                                value={formData.organization}
                                onChange={e => setFormData({ ...formData, organization: e.target.value })}
                            />
                            <input
                                required
                                className="col-span-2 w-full h-10 px-4 bg-white/5 border border-accent/20 rounded-lg text-white text-xs font-bold outline-none focus:border-accent"
                                placeholder="Tema / Requerimiento"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="col-span-2 h-10 bg-accent text-dark font-black uppercase tracking-widest rounded-lg text-[9px] italic hover:scale-[1.02] transition-all"
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-dark/95 backdrop-blur-xl p-4 animate-in fade-in duration-500">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] shadow-premium w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-zoom-in">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-accent text-dark rounded-xl flex items-center justify-center font-black text-xl italic">{day}</div>
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                {month.toLocaleString('es-ES', { month: 'long' })} {month.getFullYear()}
                            </h3>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Planificación Diaria</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-none">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-3">☀️ Mañana</h4>
                            <div className="space-y-3">{morningSlots.map(renderSlot)}</div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-3">🌤️ Tarde</h4>
                            <div className="space-y-3">{afternoonSlots.map(renderSlot)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayModal;
