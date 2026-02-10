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
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.03] text-white/20 text-[7px] md:text-[8px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                        <tr>
                            <th className="px-4 md:px-6 py-4">Lead / Org</th>
                            <th className="px-4 md:px-6 py-4">Propósito</th>
                            <th className="px-4 md:px-6 py-4">Agenda</th>
                            <th className="px-4 md:px-6 py-4">Status</th>
                            <th className="px-4 md:px-6 py-4 text-right">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {appointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-white/[0.01] transition-colors group">
                                <td className="px-4 md:px-6 py-4">
                                    <div className="font-black text-white text-sm tracking-tight group-hover:text-accent transition-colors italic leading-tight">{appt.clientName}</div>
                                    <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">{appt.organization || 'ORG'}</div>
                                    <div className="flex gap-2 mt-2">
                                        <div className="flex items-center text-[7px] font-bold text-white/30 bg-white/5 px-1.5 py-0.5 rounded-sm">
                                            <Mail size={8} className="mr-1" /> {appt.email}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="inline-block bg-primary/10 text-accent/80 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border border-accent/10 italic truncate max-w-[150px]">
                                            {appt.needType}
                                        </span>
                                        <span className="text-[9px] font-bold text-white/40 italic truncate max-w-[120px]">
                                            {appt.topic || 'Sin tema'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <div className="flex items-center text-[10px] font-bold text-white/40">
                                        <Clock size={12} className="text-white/20 mr-2" />
                                        {appt.preferredDateTime ? new Date(appt.preferredDateTime).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '---'}
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${appt.status === 'new' ? 'bg-blue-500/10 text-blue-400/80 border border-blue-500/20' :
                                        appt.status === 'scheduled' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                                            'bg-white/5 text-white/10'
                                        }`}>
                                        {appt.status?.toUpperCase() || 'NEW'}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <button onClick={() => onViewDetail(appt)} className="w-8 h-8 glass rounded-lg inline-flex items-center justify-center text-accent/40 hover:text-accent hover:bg-accent/10 transition-all">
                                        <Search size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden divide-y divide-white/5">
                {appointments.map((appt) => (
                    <div key={appt.id} className="p-4 bg-white/[0.01]" onClick={() => onViewDetail(appt)}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-black text-white text-base tracking-tight italic">{appt.clientName}</div>
                                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{appt.organization || 'ORG'}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${appt.status === 'new' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                appt.status === 'scheduled' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                                    'bg-white/5 text-white/10'
                                }`}>
                                {appt.status?.toUpperCase() || 'NEW'}
                            </span>
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-white/40 mb-3">
                            <Clock size={12} className="text-white/20 mr-2" />
                            {appt.preferredDateTime ? new Date(appt.preferredDateTime).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '---'}
                        </div>
                        <div className="bg-primary/5 border border-accent/10 p-3 rounded-xl">
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{appt.needType}</p>
                            <p className="text-xs text-white/60 italic leading-tight truncate">{appt.topic || 'Sin tema'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListView;
