import React from 'react';
import { Mail, Phone, Clock, Search, CheckCircle, XCircle } from 'lucide-react';
import { AppointmentData } from '../../types';

interface ListViewProps {
    appointments: AppointmentData[];
    onViewDetail: (appt: AppointmentData) => void;
    onStatusChange: (id: string, status: AppointmentData['status']) => void;
}

const ListView: React.FC<ListViewProps> = ({ appointments, onViewDetail, onStatusChange }) => {
    return (
        <div className="glass-dark rounded-[2rem] shadow-premium border border-white/5 overflow-hidden animate-zoom-in">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/20 text-[9px] uppercase font-black tracking-[0.3em] border-b border-white/5">
                        <tr>
                            <th className="px-8 py-5">Estructura del Lead</th>
                            <th className="px-8 py-5">Foco de Intervención</th>
                            <th className="px-8 py-5">Cronograma</th>
                            <th className="px-8 py-5">Estado</th>
                            <th className="px-8 py-5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-black text-white text-base tracking-tight group-hover:text-accent transition-colors italic leading-tight">{appt.clientName}</div>
                                    <div className="text-xs text-white/30 font-bold mb-2.5">{appt.organization || 'Sin Organización'}</div>
                                    <div className="flex gap-3">
                                        <div className="flex items-center text-[9px] font-black text-white/10 group-hover:text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                            <Mail size={9} className="mr-1.5" /> {appt.email}
                                        </div>
                                        {appt.phone && (
                                            <div className="flex items-center text-[9px] font-black text-white/10 group-hover:text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                                <Phone size={9} className="mr-1.5" /> {appt.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-block bg-primary/20 text-accent px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-accent/20 italic shadow-inner-premium whitespace-nowrap w-fit">
                                            {appt.needType}
                                        </span>
                                        <span className="text-[10px] font-bold text-white/40 pl-1 italic">
                                            {appt.topic || 'Sin tema específico'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors">
                                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10">
                                            <Clock size={14} className="text-accent" />
                                        </div>
                                        {appt.preferredDateTime ? new Date(appt.preferredDateTime).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'No definida'}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${appt.status === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                        appt.status === 'scheduled' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                            'bg-white/5 text-white/20 border border-white/10'
                                        }`}>
                                        {appt.status?.toUpperCase() || 'NUEVO'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 translate-x-3 opacity-20 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <button onClick={() => onViewDetail(appt)} className="w-10 h-10 bg-white/5 text-accent rounded-xl hover:bg-accent hover:text-dark transition-all flex items-center justify-center shadow-premium" title="Expediente Completo"><Search size={16} /></button>
                                        <button onClick={() => onStatusChange(appt.id!, 'scheduled')} className="w-10 h-10 bg-white/5 text-secondary rounded-xl hover:bg-secondary hover:text-white transition-all flex items-center justify-center shadow-premium"><CheckCircle size={16} /></button>
                                        <button onClick={() => onStatusChange(appt.id!, 'closed')} className="w-10 h-10 bg-white/5 text-white/10 rounded-xl hover:bg-white/20 hover:text-white transition-all flex items-center justify-center shadow-premium"><XCircle size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListView;
