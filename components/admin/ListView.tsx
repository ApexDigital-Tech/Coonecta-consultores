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
        <div className="glass-dark rounded-[2.5rem] shadow-premium border border-white/5 overflow-hidden animate-zoom-in">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/30 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                        <tr>
                            <th className="px-10 py-6">Estructura del Lead</th>
                            <th className="px-10 py-6">Foco de Intervención</th>
                            <th className="px-10 py-6">Cronograma</th>
                            <th className="px-10 py-6">Estado</th>
                            <th className="px-10 py-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-10 py-8">
                                    <div className="font-black text-white text-lg tracking-tight group-hover:text-accent transition-colors italic">{appt.clientName}</div>
                                    <div className="text-sm text-white/40 font-bold mb-3">{appt.organization}</div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center text-[10px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                            <Mail size={10} className="mr-2" /> {appt.email}
                                        </div>
                                        {appt.phone && (
                                            <div className="flex items-center text-[10px] font-black text-white/20 group-hover:text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                                <Phone size={10} className="mr-2" /> {appt.phone}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-block bg-primary/20 text-accent px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-accent/20 italic shadow-inner-premium whitespace-nowrap w-fit">
                                            {appt.needType}
                                        </span>
                                        <span className="text-xs font-bold text-white/50 pl-2">
                                            {appt.topic}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="flex items-center text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 group-hover:bg-white/10">
                                            <Clock size={16} className="text-accent" />
                                        </div>
                                        {appt.preferredDateTime}
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${appt.status === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                        appt.status === 'scheduled' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                                            'bg-white/5 text-white/30 border border-white/10'
                                        }`}>
                                        {appt.status || 'NEW'}
                                    </span>
                                </td>
                                <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                        <button onClick={() => onViewDetail(appt)} className="w-12 h-12 bg-white/5 text-accent rounded-2xl hover:bg-accent hover:text-dark transition-all flex items-center justify-center shadow-premium" title="Expediente Completo"><Search size={20} /></button>
                                        <button onClick={() => onStatusChange(appt.id!, 'scheduled')} className="w-12 h-12 bg-white/5 text-secondary rounded-2xl hover:bg-secondary hover:text-white transition-all flex items-center justify-center shadow-premium"><CheckCircle size={20} /></button>
                                        <button onClick={() => onStatusChange(appt.id!, 'closed')} className="w-12 h-12 bg-white/5 text-white/20 rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center shadow-premium"><XCircle size={20} /></button>
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
