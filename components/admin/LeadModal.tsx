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
            // 🔄 Trigger refresh globally
            window.dispatchEvent(new CustomEvent('appointment-saved'));
            alert("Bitácora actualizada.");
        } catch (error) {
            console.error("Save notes error:", error);
            alert("Error al guardar notas.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dark/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-zoom-in">
                {/* Modal Header */}
                <div className="p-5 md:p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center shrink-0">
                    <div className="flex gap-4 md:gap-5 items-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl flex items-center justify-center text-accent">
                            <User size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-accent/10 text-accent text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-accent/20">Lead CRM</span>
                                {(lead.status === 'new' || !lead.status) && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
                            </div>
                            <h3 className="text-base md:text-lg font-black text-white italic tracking-tighter uppercase leading-none truncate">
                                {lead.clientName}
                            </h3>
                            <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2 truncate">
                                <Briefcase size={8} className="text-accent shrink-0" />
                                {lead.organization}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/30 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 md:p-8 relative z-10 grid md:grid-cols-2 gap-6 md:gap-10 overflow-y-auto scrollbar-none flex-1">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-2 italic">Contacto Directo</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary border border-white/5">
                                        <Mail size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[7px] font-black text-white/10 uppercase tracking-widest">Email</p>
                                        <p className="text-xs font-bold text-white/90 truncate">{lead.email || 'No registrado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-secondary border border-white/5">
                                        <Phone size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[7px] font-black text-white/10 uppercase tracking-widest">Teléfono</p>
                                        <p className="text-xs font-bold text-white/90 truncate">{lead.phone || 'No registrado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-2 italic">Planificación</h4>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <p className="text-[7px] font-black text-white/10 uppercase tracking-widest mb-1.5">Fecha y Hora Propuesta</p>
                                <div className="flex items-baseline gap-2">
                                    <Calendar size={10} className="text-accent opacity-40" />
                                    <p className="text-sm font-black text-accent italic tracking-tight">{lead.preferredDateTime || 'Pendiente'}</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[7px] font-black text-white/10 uppercase tracking-widest">Consultor Asignado:</span>
                                    <span className="text-[9px] font-bold text-white/40 italic">{lead.consultant || 'Admin'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Context */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-2 italic">Requerimiento</h4>
                            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                <div className="inline-block bg-accent/20 text-accent px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border border-accent/20 mb-2">{lead.needType}</div>
                                <h5 className="text-lg font-black text-white italic tracking-tighter leading-tight">{lead.topic || 'Sin tema específico'}</h5>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h4 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic">Seguimiento CRM</h4>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 text-[7px] font-black text-accent hover:text-white transition-colors uppercase tracking-[0.2em] disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={8} className="animate-spin" /> : <Save size={10} />} GUARDAR LOG
                                </button>
                            </div>
                            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 focus-within:border-accent/20 transition-all">
                                <textarea
                                    className="w-full bg-transparent border-none outline-none text-[11px] font-medium text-white/50 leading-relaxed italic resize-none scrollbar-none min-h-[100px]"
                                    placeholder="Bitácora de seguimiento..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer (Actions) */}
                <div className="p-5 md:p-6 border-t border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] italic ${lead.status === 'new' ? 'bg-blue-500/10 text-blue-400/80 border border-blue-500/20' :
                        lead.status === 'scheduled' ? 'bg-secondary/10 text-secondary/80 border border-secondary/20' :
                            'bg-white/5 text-white/20 border border-white/10'
                        }`}>
                        STATUS: {lead.status?.toUpperCase() || 'NEW'}
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => { onStatusChange(lead.id!, 'scheduled'); onClose(); }}
                            className="flex-1 md:flex-none h-10 px-5 bg-secondary text-white font-black uppercase tracking-widest text-[9px] rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg italic flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={12} /> Agendar
                        </button>
                        <button
                            onClick={() => { onStatusChange(lead.id!, 'closed'); onClose(); }}
                            className="flex-1 md:flex-none h-10 px-5 bg-white/5 text-white/40 font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/10"
                        >
                            Archivar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadModal;
