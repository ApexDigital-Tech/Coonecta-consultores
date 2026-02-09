import { FunctionDeclaration, Type } from "@google/genai";

export const appointmentTool: FunctionDeclaration = {
    name: "scheduleAppointment",
    description: "Agendar una consulta inicial gratuita con un consultor.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: { type: Type.STRING, description: "Nombre completo del cliente" },
            phone: { type: Type.STRING, description: "Teléfono o celular de contacto (Indispensable)" },
            email: { type: Type.STRING, description: "Correo electrónico institucional (Indispensable)" },
            organization: { type: Type.STRING, description: "Nombre de la organización u ONG" },
            needType: { type: Type.STRING, description: "Tipo de necesidad (HPO, Evaluación, Proyectos)" },
            preferredDateTime: { type: Type.STRING, description: "Formato ISO 8601 (YYYY-MM-DD HH:mm) EJEMPLO: 2025-02-06 10:00" },
            consultant: { type: Type.STRING, description: "Nombre del consultor asignado (opcional, default Bernarda Sarué)" },
            notes: { type: Type.STRING, description: "Notas adicionales del contexto" },
        },
        // Added email and phone to required list
        required: ["clientName", "organization", "needType", "preferredDateTime", "email", "phone"]
    }
};