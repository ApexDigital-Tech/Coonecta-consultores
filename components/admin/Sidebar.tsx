import React from 'react';
import { Calendar, Users, LogOut } from 'lucide-react';

interface SidebarProps {
    currentView: 'calendar' | 'list';
    setView: (view: 'calendar' | 'list') => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
    return (
        <aside className="w-64 glass-dark flex-shrink-0 hidden lg:flex flex-col border-r border-white/5 z-20">
            <div className="p-8 border-b border-white/5 flex flex-col items-center">
                <div className="mb-4 p-3 glass rounded-2xl shadow-premium ring-1 ring-white/10">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-dark italic text-xl">C</div>
                </div>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Control Panel</span>
            </div>

            <nav className="p-4 space-y-2 flex-1">
                <button
                    onClick={() => setView('calendar')}
                    className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-300 group ${currentView === 'calendar' ? 'bg-primary/40 text-white shadow-lg shadow-primary/10 border border-primary/20 italic font-black' : 'text-white/30 hover:bg-white/5 hover:text-white font-bold'}`}
                >
                    <Calendar size={18} className={`mr-3 ${currentView === 'calendar' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                    <span className="text-sm">Calendario</span>
                    {currentView === 'calendar' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-300 group ${currentView === 'list' ? 'bg-primary/40 text-white shadow-lg shadow-primary/10 border border-primary/20 italic font-black' : 'text-white/30 hover:bg-white/5 hover:text-white font-bold'}`}
                >
                    <Users size={18} className={`mr-3 ${currentView === 'list' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                    <span className="text-sm">Leads de Impacto</span>
                    {currentView === 'list' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                </button>
            </nav>

            <div className="p-6 border-t border-white/5">
                <button onClick={onLogout} className="flex items-center text-white/20 hover:text-red-400 transition-all w-full font-black uppercase tracking-widest text-[9px] group px-4">
                    <LogOut size={14} className="mr-3" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
