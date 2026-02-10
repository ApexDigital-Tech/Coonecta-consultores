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
            if (a.status === 'closed' || !a.preferredDateTime) return false;
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
            <div key={time} className={`p-3 rounded-xl border min-h-[60px] flex items-center transition-all ${appt ? 'bg-primary/20 border-primary/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'}`}>
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
                        <button onClick={() => onViewLead(appt)} className="w-7 h-7 glass rounded-lg flex items-center justify-center text-accent ml-2 shrink-0 hover:bg-accent hover:text-dark transition-colors"><Search size={12} /></button>
                    </div>
                ) : (
                    <button onClick={() => setSelectedSlot(time)} className="flex-1 flex items-center text-white/10 hover:text-accent font-black uppercase text-[8px] tracking-[0.2em] transition-all">
                        <Plus size={10} className="mr-2" /> Disponible
                    </button>
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
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-3">☀️ Mañana</h4>
                            <div className="space-y-2">{morningSlots.map(renderSlot)}</div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic border-b border-white/5 pb-3">🌤️ Tarde</h4>
                            <div className="space-y-2">{afternoonSlots.map(renderSlot)}</div>
                        </div>
                    </div>
                    {selectedSlot && (
                        <div className="mt-8 glass-dark rounded-[1.5rem] p-6 border border-accent/20 animate-fade-in">
                            <div className="flex justify-between items-center mb-5">
                                <h4 className="text-base font-black text-white italic tracking-tighter uppercase">Nuevo Registro <span className="text-accent opacity-50">@{selectedSlot}</span></h4>
                                <button onClick={() => setSelectedSlot(null)} className="text-[8px] font-black text-white/20 hover:text-red-400 flex items-center gap-1"><X size={10} /> Descartar</button>
                            </div>
                            <form onSubmit={handleManualSubmit} className="grid md:grid-cols-2 gap-3">
                                <input required className="w-full h-10 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold outline-none focus:border-accent/30" placeholder="Nombre Lead" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                                <input className="w-full h-10 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold outline-none focus:border-accent/30" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <input required className="md:col-span-2 w-full h-10 px-5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold outline-none focus:border-accent/30" placeholder="Tema de la Sesión" value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} />
                                <button type="submit" disabled={isSubmitting} className="md:col-span-2 h-12 bg-accent text-dark font-black uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all shadow-lg text-[10px] italic">{isSubmitting ? 'Registrando...' : 'Confirmar Cita'}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayModal;
