import React, { useState } from 'react';
import { X, User, Briefcase, Mail, Phone, Calendar, Sparkles, CheckCircle, Save, Loader2 } from 'lucide-react';
import { AppointmentData } from '../../types';
import { supabase } from '../../lib/supabase';

interface LeadModalProps {
    lead: AppointmentData;
    onClose: () => void;
    onStatusChange: (id: string, status: AppointmentData['status']) => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ lead, onClose, onStatusChange }) => {
    const [notes, setNotes] = useState(lead.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ notes })
                .eq('id', lead.id);

            if (error) throw error;
            alert("Notas actualizadas correctamente.");
        } catch (error) {
            console.error("Save notes error:", error);
            alert("Error al guardar notas.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
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
                                {(lead.status === 'new' || !lead.status) && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                            </div>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none truncate max-w-md">
                                {lead.clientName}
                            </h3>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Briefcase size={12} className="text-accent" />
                                {lead.organization}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-14 h-14 glass rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all hover:rotate-90">
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
                                        <p className="text-lg font-bold text-white group-hover:text-accent transition-colors">{lead.email || 'No registrado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-inner-premium border border-white/5">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Contacto Directo</p>
                                        <p className="text-lg font-bold text-white group-hover:text-secondary transition-colors">{lead.phone || 'No registrado'}</p>
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
                                    <p className="text-xl font-black text-accent italic">{lead.preferredDateTime}</p>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Consultor Asignado:</span>
                                        <span className="text-[11px] font-bold text-white/60 italic">{lead.consultant}</span>
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
                                    <div className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-accent/20 mb-4">{lead.needType}</div>
                                    <h5 className="text-2xl font-black text-white italic tracking-tighter leading-tight mb-4">{lead.topic}</h5>
                                    <div className="w-12 h-1 bg-accent/30 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] italic">Seguimiento de Eventos / CRM</h4>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 text-[9px] font-black text-accent hover:text-white transition-colors uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Guardar Bitácora
                                </button>
                            </div>
                            <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 min-h-[140px] focus-within:border-accent/30 transition-all">
                                <textarea
                                    className="w-full bg-transparent border-none outline-none text-sm font-medium text-white/60 leading-relaxed italic resize-none scrollbar-none min-h-[100px]"
                                    placeholder="Registre aquí el seguimiento: llamadas, acuerdos, avance en el embudo..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer (Actions) */}
                <div className="p-12 relative z-10 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic ${lead.status === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            lead.status === 'scheduled' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                'bg-white/5 text-white/30 border border-white/10'
                        }`}>
                        Estado: {lead.status || 'NEW'}
                    </span>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { onStatusChange(lead.id!, 'scheduled'); onClose(); }}
                            className="h-16 px-8 bg-secondary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/20 italic flex items-center gap-3"
                        >
                            <CheckCircle size={18} /> Validar y Agendar
                        </button>
                        <button
                            onClick={() => { onStatusChange(lead.id!, 'closed'); onClose(); }}
                            className="h-16 px-8 bg-white/5 text-white/40 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all border border-white/10"
                        >
                            Archivar Lead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadModal;
