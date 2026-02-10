import React from 'react';
import { AppointmentData } from '../../types';

interface StatsSummaryProps {
    appointments: AppointmentData[];
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ appointments }) => {
    const total = appointments.length;
    const novos = appointments.filter(a => a.status === 'new' || !a.status).length;
    const agendados = appointments.filter(a => a.status === 'scheduled').length;

    return (
        <div className="hidden xl:flex items-center gap-6 pl-8 border-l border-white/5">
            <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Total Leads</span>
                <span className="text-lg font-black text-white italic leading-tight">{total}</span>
            </div>
            <div className="flex flex-col border-l border-white/5 pl-6">
                <span className="text-[9px] font-black text-blue-400/40 uppercase tracking-widest">A procesar</span>
                <span className="text-lg font-black text-blue-400 italic leading-tight">{novos}</span>
            </div>
            <div className="flex flex-col border-l border-white/5 pl-6">
                <span className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">En Agenda</span>
                <span className="text-lg font-black text-secondary italic leading-tight">{agendados}</span>
            </div>
        </div>
    );
};

export default StatsSummary;
