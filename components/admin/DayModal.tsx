import React, { useState } from 'react';
import { X, Plus, Search, Sparkles } from 'lucide-react';
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

    const getApptForSlot = (time: string) => {
        const targetYear = month.getFullYear();
        const targetMonth = month.getMonth();
        const targetHour = parseInt(time.split(':')[0], 10);

        return appointments.find(a => {
            if (a.status === 'closed') return false;
            const apptDate = new Date(a.preferredDateTime);
            if (!isNaN(apptDate.getTime())) {
                return apptDate.getFullYear() === targetYear &&
                    apptDate.getMonth() === targetMonth &&
                    apptDate.getDate() === day &&
                    apptDate.getHours() === targetHour;
            }
            return a.preferredDateTime.includes(`${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) &&
                a.preferredDateTime.includes(time);
        });
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;
        setIsSubmitting(true);
        try {
            const dateTimeString = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${selectedSlot}`;
            await onSaveAppointment({
                ...formData as AppointmentData,
                preferredDateTime: dateTimeString,
                phone: '',
                consultant: 'Asignado Manualmente',
                status: 'scheduled'
            });
            setSelectedSlot(null);
        } catch (error) {
            alert("Error al agendar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSlot = (time: string) => {
        const appt = getApptForSlot(time);
        return (
            <div key={time} className={`p-4 rounded-xl border min-h-[70px] flex items-center transition-all ${appt ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'}`}>
                <div className="w-16 flex items-center justify-center border-r border-white/10 mr-4 font-black text-white/40 text-sm italic">{time}</div>
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
                        <button onClick={() => onViewLead(appt)} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-accent ml-2 shrink-0"><Search size={14} /></button>
                    </div>
                ) : (
                    <button onClick={() => setSelectedSlot(time)} className="flex-1 flex items-center text-white/20 hover:text-accent font-black uppercase text-[9px] tracking-widest transition-all">
                        <Plus size={12} className="mr-2" /> Disponible
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/95 backdrop-blur-xl p-4 lg:p-12 animate-in fade-in duration-500">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] shadow-premium w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                    <div className="flex gap-6 items-center">
                        <div className="w-14 h-14 bg-accent text-dark rounded-2xl flex items-center justify-center font-black text-2xl italic">{day}</div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                {month.toLocaleString('es-ES', { month: 'long' })} {month.getFullYear()}
                            </h3>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Planificación Diaria</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-none">
                    <div className="grid lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">☀️ Mañana</h4>
                            <div className="space-y-2.5">{morningSlots.map(renderSlot)}</div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-4">🌤️ Tarde</h4>
                            <div className="space-y-2.5">{afternoonSlots.map(renderSlot)}</div>
                        </div>
                    </div>
                    {selectedSlot && (
                        <div className="mt-10 glass-dark rounded-[2rem] p-8 border border-accent/20 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black text-white italic tracking-tighter uppercase">Nuevo Registro <span className="text-accent opacity-50">@{selectedSlot}</span></h4>
                                <button onClick={() => setSelectedSlot(null)} className="text-[9px] font-black text-white/20 hover:text-red-400 flex items-center gap-1"><X size={12} /> Descartar</button>
                            </div>
                            <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-4">
                                <input required className="w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-accent/30" placeholder="Nombre Lead" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                                <input className="w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-accent/30" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <input required className="md:col-span-2 w-full h-12 px-6 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-accent/30" placeholder="Tema de la Sesión" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} />
                                <button type="submit" disabled={isSubmitting} className="md:col-span-2 h-14 bg-accent text-dark font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all shadow-lg text-xs italic">{isSubmitting ? 'Registrando...' : 'Confirmar Cita'}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayModal;
