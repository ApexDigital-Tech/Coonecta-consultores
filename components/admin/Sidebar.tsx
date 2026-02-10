import React from 'react';
import { Calendar, Users, LogOut } from 'lucide-react';

interface SidebarProps {
    currentView: 'calendar' | 'list';
    setView: (view: 'calendar' | 'list') => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
    return (
        <aside className="w-56 glass-dark flex-shrink-0 hidden lg:flex flex-col border-r border-white/5 z-20">
            <div className="p-6 border-b border-white/5 flex flex-col items-center">
                <div className="mb-4 p-2.5 glass rounded-xl shadow-premium ring-1 ring-white/10">
                    <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-black text-dark italic text-lg">C</div>
                </div>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">ADMIN CORE</span>
            </div>

            <nav className="p-3 space-y-1.5 flex-1">
                <button
                    onClick={() => setView('calendar')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group ${currentView === 'calendar' ? 'bg-primary/30 text-white shadow-lg border border-primary/20 italic font-black' : 'text-white/30 hover:bg-white/5 hover:text-white font-bold'}`}
                >
                    <Calendar size={16} className={`mr-3 ${currentView === 'calendar' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                    <span className="text-xs">Calendario</span>
                    {currentView === 'calendar' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group ${currentView === 'list' ? 'bg-primary/30 text-white shadow-lg border border-primary/20 italic font-black' : 'text-white/30 hover:bg-white/5 hover:text-white font-bold'}`}
                >
                    <Users size={16} className={`mr-3 ${currentView === 'list' ? 'text-accent' : 'text-white/20 group-hover:text-white/60'}`} />
                    <span className="text-xs">Leads CRM</span>
                    {currentView === 'list' && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />}
                </button>
            </nav>

            <div className="p-4 border-t border-white/5">
                <button onClick={onLogout} className="flex items-center text-white/20 hover:text-red-400 transition-all w-full font-black uppercase tracking-widest text-[8px] group px-3 py-2">
                    <LogOut size={12} className="mr-3" />
                    SALIR
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
