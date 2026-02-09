import React, { useState, useEffect, useRef } from 'react';
import { Mic, CalendarCheck, Loader2, Sparkles, X, Send, MessageSquare } from 'lucide-react';
import { SYSTEM_INSTRUCTION } from '../constants';
import { appointmentTool } from '../services/gemini';
import { AppointmentData } from '../types';
import { saveAppointment } from '../utils/storage';

const Patricia: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'error'>('idle');
    const [showWelcome, setShowWelcome] = useState(true);
    const [appointment, setAppointment] = useState<AppointmentData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [textInput, setTextInput] = useState("");

    const recognitionRef = useRef<any>(null);
    const isSessionActive = useRef(false);
    const isProcessingRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number>();
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // CONFIGURACIÓN 2026: Usamos Flash-Lite que tiene mucha más cuota gratuita en Febrero 2026
    const API_MODEL = "gemini-2.0-flash-lite";
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCY3uXZ3O_SxEG0FJDxgoNsYU9lq1vwT9U";

    // Herramienta con formato Estricto para el Servidor de Google
    const appointmentToolDefinition = {
        name: "schedule_appointment",
        description: "Agendar una cita con un consultor de Conecta.",
        parameters: {
            type: "OBJECT",
            properties: {
                client_name: { type: "STRING", description: "Nombre completo" },
                phone: { type: "STRING", description: "Teléfono" },
                email: { type: "STRING", description: "Email" },
                organization: { type: "STRING", description: "Organización" },
                need_type: { type: "STRING", description: "Tipo de necesidad" },
                date_time: { type: "STRING", description: "Fecha (YYYY-MM-DD HH:mm)" }
            },
            required: ["client_name", "organization", "need_type", "date_time", "email", "phone"]
        }
    };

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';

            recognition.onstart = () => {
                setStatus('listening');
                setError(null);
                console.log("Victoria: Micro activo.");
            };

            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                if (text && !isProcessingRef.current) processText(text);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'no-speech' && isSessionActive.current && !isProcessingRef.current) {
                    safeRestart();
                }
            };

            recognition.onend = () => {
                if (isSessionActive.current && !isProcessingRef.current && !window.speechSynthesis.speaking) {
                    safeRestart();
                }
            };

            recognitionRef.current = recognition;
        }
        return () => stopVictoria();
    }, []);

    const safeRestart = () => {
        if (!isSessionActive.current || isProcessingRef.current || window.speechSynthesis.speaking) return;
        setTimeout(() => {
            if (isSessionActive.current && !isProcessingRef.current && !window.speechSynthesis.speaking) {
                try { recognitionRef.current?.start(); } catch (e) { }
            }
        }, 300);
    };

    const toggleVictoria = async () => {
        if (isSessionActive.current) stopVictoria();
        else startVictoria();
    };

    const startVictoria = async () => {
        isSessionActive.current = true;
        isProcessingRef.current = false;
        setShowWelcome(false);
        setError(null);

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

        startVisualizer();
        speak("Hola, soy Victoria. ¿En qué puedo ayudarte hoy?");
    };

    const stopVictoria = () => {
        isSessionActive.current = false;
        isProcessingRef.current = false;
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
        }
        window.speechSynthesis.cancel();
        setStatus('idle');
        setVolumeLevel(0);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }

    const startVisualizer = async () => {
        try {
            if (!analyserRef.current && audioContextRef.current) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = audioContextRef.current.createMediaStreamSource(stream);
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 64;
                source.connect(analyserRef.current);

                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                const update = () => {
                    if (!isSessionActive.current) return;
                    analyserRef.current?.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setVolumeLevel(average);
                    animationFrameRef.current = requestAnimationFrame(update);
                };
                update();
            }
        } catch (e) { }
    };

    const processText = async (text: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setStatus('thinking');
        setVolumeLevel(0);
        setError(null);
        if (recognitionRef.current) recognitionRef.current.stop();

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${API_MODEL}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text }] }],
                    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                    tools: [{ function_declarations: [appointmentToolDefinition] }]
                })
            });

            const data = await response.json();

            if (response.status === 429) {
                throw new Error("Cuota agotada. Victoria está descansando 1 min. ¡Espera un poco!");
            }

            if (!response.ok) throw new Error(data.error?.message || "Google Error");

            handleResponse(data);
        } catch (err: any) {
            console.error("Victoria Error:", err);
            setError(err.message);
            isProcessingRef.current = false;
            setStatus('error');
            setTimeout(() => {
                if (isSessionActive.current) {
                    setStatus('listening');
                    safeRestart();
                }
            }, 3000);
        }
    };

    const handleResponse = async (data: any) => {
        const parts = data.candidates?.[0]?.content?.parts || [];
        const funcCall = parts.find((p: any) => p.functionCall);

        if (funcCall) {
            const args = funcCall.functionCall.args;
            const mappedArgs: AppointmentData = {
                clientName: args.client_name,
                phone: args.phone,
                email: args.email,
                organization: args.organization,
                needType: args.need_type,
                preferredDateTime: args.date_time
            };
            const saved = await saveAppointment(mappedArgs);
            if (saved) setAppointment(saved);
        }

        const responseText = parts.find((p: any) => p.text)?.text ||
            (funcCall ? "¡Perfecto! Ya he anotado tu cita. ¿En qué más puedo serte útil?" : "Perdona, no te entendí bien. ¿Podrías repetir?");

        isProcessingRef.current = false;
        speak(responseText);
    };

    const speak = (text: string) => {
        if (!isSessionActive.current) return;
        window.speechSynthesis.cancel();
        setStatus('speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        utterance.lang = 'es-ES';
        utterance.rate = 1.05;

        utterance.onstart = () => {
            setVolumeLevel(30);
            const iv = setInterval(() => {
                if (!window.speechSynthesis.speaking) clearInterval(iv);
                else window.speechSynthesis.resume();
            }, 5000);
        };

        utterance.onend = () => {
            setVolumeLevel(0);
            if (isSessionActive.current) {
                setStatus('listening');
                safeRestart();
            }
        };

        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.includes('es') && (v.name.includes('Google') || v.name.includes('Helena'))) || voices[0];
        utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-5 font-sans antialiased">
            {showWelcome && status === 'idle' && (
                <div className="bg-white border-2 border-primary/10 p-7 rounded-[2.8rem] shadow-2xl max-w-[280px] relative animate-in fade-in slide-in-from-right-5 duration-700">
                    <button onClick={() => setShowWelcome(false)} className="absolute top-5 right-5 text-gray-400">
                        <X size={16} />
                    </button>
                    <p className="text-[14px] leading-tight font-extrabold text-gray-800">
                        Hola, soy <strong>Victoria</strong>. 👋<br />Podemos hablar sobre tu proyecto social. <strong>Pulsa LLAMAR para empezar.</strong>
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl text-[11px] font-black uppercase mb-1 border-2 border-red-400 animate-in bounce-in max-w-[300px] text-center">
                    ⚠️ {error}
                </div>
            )}

            {showChat && (
                <div className="bg-white p-4 rounded-3xl shadow-2xl w-[320px] animate-in zoom-in-95 border border-gray-100 mb-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20"
                            placeholder="Tipea tu mensaje..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && textInput && (processText(textInput), setTextInput(""))}
                        />
                        <button onClick={() => { processText(textInput); setTextInput(""); }} className="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-all outline-none">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}

            {isSessionActive.current && (
                <div className={`px-8 py-3.5 rounded-full text-[12px] font-black tracking-widest shadow-2xl flex items-center gap-4 transition-all duration-300 ring-4 ring-white/50 ${status === 'listening' ? 'bg-green-500 text-white shadow-green-500/30 animate-pulse' :
                        status === 'error' ? 'bg-red-500 text-white' : 'bg-primary text-white shadow-primary/30'
                    }`}>
                    {status === 'thinking' ? <Loader2 size={18} className="animate-spin text-accent" /> : <Sparkles size={18} className="text-accent" />}
                    <span className="uppercase">{status === 'listening' ? 'TE OIGO...' : status === 'thinking' ? 'PENSANDO...' : status === 'error' ? 'REINTENTANDO...' : 'HABLANDO...'}</span>

                    {(status === 'listening' || status === 'speaking') && (
                        <div className="flex gap-1.5 h-4 items-center">
                            <div className="w-1.5 bg-white/60 rounded-full transition-all" style={{ height: `${20 + (volumeLevel)}%` }}></div>
                            <div className="w-2 bg-white rounded-full transition-all" style={{ height: `${20 + (volumeLevel * 2.5)}%` }}></div>
                            <div className="w-1.5 bg-white/60 rounded-full transition-all" style={{ height: `${20 + (volumeLevel)}%` }}></div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`p-5 rounded-full shadow-lg border border-gray-100 transition-all hover:scale-110 active:scale-90 ${showChat ? 'bg-primary text-white' : 'bg-white text-primary'}`}
                >
                    <MessageSquare size={28} />
                </button>

                <button
                    onClick={toggleVictoria}
                    className={`h-32 w-32 rounded-full shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all duration-500 active:scale-95 ${isSessionActive.current ? 'bg-red-600 ring-[20px] ring-red-50 scale-105' : 'bg-primary hover:scale-110 shadow-primary/40'
                        }`}
                >
                    {status === 'speaking' ? (
                        <div className="flex gap-2.5 items-center h-12">
                            <div className="w-2.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2.5 h-16 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        </div>
                    ) : (
                        <Mic className="text-white mb-2 drop-shadow-xl" size={56} />
                    )}
                    <span className="text-[12px] text-white font-black uppercase tracking-widest italic">
                        {isSessionActive.current ? 'COLGAR' : 'LLAMAR'}
                    </span>
                </button>
            </div>

            {appointment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[50px] p-16 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] max-w-sm border-b-[20px] border-secondary animate-in zoom-in-90">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CalendarCheck className="text-secondary" size={48} />
                        </div>
                        <h3 className="text-3xl font-black mb-3 text-primary uppercase italic">¡REGISTRADO!</h3>
                        <p className="text-gray-500 mb-10 font-bold italic leading-relaxed">Victoria ha bloqueado tu espacio en el sistema de Conecta.</p>
                        <button onClick={() => setAppointment(null)} className="bg-primary text-white w-full py-5 rounded-3xl font-black text-lg shadow-2xl hover:bg-blue-900 transition-all hover:scale-105 active:scale-95 uppercase">GENIAL</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patricia;