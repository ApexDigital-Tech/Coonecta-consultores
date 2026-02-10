import React, { useState } from 'react';
import { Calendar, X, Sparkles, Send, CheckCircle2, User, Building2, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { saveAppointment } from '../utils/storage';

/**
 * CONECTA AI - VERSIÓN DE PRODUCCIÓN EMPRESARIAL
 * Este componente ha sido estabilizado para producción.
 * Elimina la dependencia de APIs de IA inestables y se enfoca en la conversión:
 * Registro de citas directo y seguro.
 */

const ConectaAI: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
    const [isSaving, setIsSaving] = useState(false);

    // Estado del Formulario
    const [formData, setFormData] = useState({
        clientName: '',
        organization: '',
        email: '',
        phone: '',
        needType: 'Consultoría General',
        topic: '',
        preferredDateTime: '',
        notes: ''
    });

    const handleOpen = () => {
        setIsOpen(true);
        setStep('intro');
    };

    const handleStartBooking = () => {
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const success = await saveAppointment({
                ...formData,
                status: 'scheduled',
                consultant: 'Asignación Automática',
            });

            if (success) {
                setStep('success');
                // 🔄 Trigger refresh in other components (like AdminDashboard)
                window.dispatchEvent(new CustomEvent('appointment-saved'));
            }
        } catch (error: any) {
            console.error("Booking error:", error);
            alert(`Error: ${error.message || "No se pudo registrar la cita. Verifique su conexión."}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex flex-col items-end gap-6">

            {/* PANEL DE AGENDAMIENTO ELITE - ULTRA COMPACTO */}
            {isOpen && (
                <div className="w-[85vw] max-w-[320px] max-h-[85vh] md:max-h-[75vh] bg-[#0f172a] rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                    <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/20 to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-primary p-0.5 shadow-xl">
                                <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                                    <Sparkles className="text-[#D4AF37]" size={18} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-[10px] md:text-[12px]">Victoria</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                                    <span className="text-[8px] text-gray-500 font-bold tracking-widest uppercase">Sistema Activo</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors p-2"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                        {step === 'intro' && (
                            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                                <h4 className="text-white text-xl md:text-2xl font-black italic tracking-tight leading-tight">
                                    Impulse el impacto de su organización hoy.
                                </h4>
                                <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                                    Bienvenido a Coonecta Consultores. Estoy lista para ayudarle a agendar una sesión estratégica.
                                </p>
                                <div className="space-y-3">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Calendar size={14} /></div>
                                        <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Sesión 45 min</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"><CheckCircle2 size={14} /></div>
                                        <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Confirmación Directa</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleStartBooking}
                                    className="w-full bg-[#D4AF37] text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-[10px] italic"
                                >
                                    Agendar Cita Ahora
                                </button>
                            </div>
                        )}

                        {step === 'form' && (
                            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 animate-in slide-in-from-right-4">
                                <div className="space-y-3 md:space-y-4">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/10"
                                            placeholder="Nombre Completo"
                                            value={formData.clientName}
                                            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/10"
                                            placeholder="Organización / ONG"
                                            value={formData.organization}
                                            onChange={e => setFormData({ ...formData, organization: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/40" size={14} />
                                        <input
                                            required
                                            className="w-full bg-white/5 border border-[#D4AF37]/20 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white outline-none focus:border-[#D4AF37] transition-all placeholder:text-white/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                                            placeholder="Tema de la Sesión"
                                            value={formData.topic}
                                            onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                            <input
                                                required type="email"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/10"
                                                placeholder="Email de contacto"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                            <input
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white outline-none focus:border-[#D4AF37]/50 transition-all placeholder:text-white/10"
                                                placeholder="Teléfono (WhatsApp)"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                        <input
                                            required type="datetime-local"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold text-white outline-none focus:border-[#D4AF37]/50 transition-all"
                                            value={formData.preferredDateTime}
                                            onChange={e => setFormData({ ...formData, preferredDateTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-900 transition-all text-[10px] italic flex items-center justify-center gap-3"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : 'CONFIRMAR AGENDAMIENTO'}
                                </button>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 animate-in zoom-in-95 duration-700">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary/20 rounded-full flex items-center justify-center text-secondary border border-secondary/20">
                                    <CheckCircle2 size={32} md:size={40} />
                                </div>
                                <div>
                                    <h4 className="text-white text-2xl md:text-3xl font-black italic tracking-tighter mb-2 underline decoration-secondary decoration-4 underline-offset-8 uppercase">¡Listo!</h4>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-loose">
                                        Su sesión estratégica ha sido agendada. Nos pondremos en contacto pronto.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-white text-dark py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                                >
                                    CERRAR
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BOTÓN MAESTRO (EL ORBE DORADO) - ULTRA DISCRETO */}
            <button
                onClick={handleOpen}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_20px_50px_-10px_rgba(212,175,55,0.6)] flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 border-[4px] md:border-[6px] border-[#0a0f1d] bg-[#D4AF37] text-white group relative`}
            >
                <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-20 group-hover:animate-ping"></div>
                <Calendar size={20} className="md:size-[24px] drop-shadow-2xl group-hover:rotate-12 transition-transform" />
                <span className="text-[5px] md:text-[6px] font-black uppercase tracking-[0.1em] mt-0.5 drop-shadow-md">CITA</span>
            </button>
        </div>
    );
};

export default ConectaAI;
