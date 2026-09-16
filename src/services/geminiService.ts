import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface GeminiPlantInfo {
  species: string;
  watering_frequency: number;
  fertilizer_frequency: number;
  description: string;
}

export const identifyPlant = async (plantName: string): Promise<GeminiPlantInfo> => {
  const prompt = `Eres un experto botánico. Proporciona la especie científica, la frecuencia de riego en días y la frecuencia de fertilización en días para una planta de interior llamada "${plantName}". Devuelve la información en formato JSON siguiendo estrictamente este esquema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          species: {
            type: Type.STRING,
            description: "Nombre científico de la planta",
          },
          watering_frequency: {
            type: Type.INTEGER,
            description: "Frecuencia de riego en días",
          },
          fertilizer_frequency: {
            type: Type.INTEGER,
            description: "Frecuencia de fertilización en días",
          },
          description: {
            type: Type.STRING,
            description: "Breve descripción y consejos de cuidado (1-2 oraciones).",
          },
        },
        required: ["species", "watering_frequency", "fertilizer_frequency", "description"],
      },
    },
  });

  if (!response.text) {
    throw new Error('No se pudo generar una respuesta de Gemini.');
  }

  return JSON.parse(response.text) as GeminiPlantInfo;
};
