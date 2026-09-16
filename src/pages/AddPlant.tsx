import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { identifyPlant } from '../services/geminiService';
import { addPlant } from '../services/dbService';
import { Sparkles, Loader2 } from 'lucide-react';

export const AddPlant = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [species, setSpecies] = useState('');
  const [waterFreq, setWaterFreq] = useState(0);
  const [fertFreq, setFertFreq] = useState(0);
  const [description, setDescription] = useState('');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleIdentify = async () => {
    if (!name) {
      setError('Por favor, ingresa el nombre de la planta primero (ej: "Monstera").');
      return;
    }
    setError('');
    setIsAiLoading(true);
    try {
      const data = await identifyPlant(name);
      setSpecies(data.species);
      setWaterFreq(data.watering_frequency);
      setFertFreq(data.fertilizer_frequency);
      setDescription(data.description);
    } catch (err) {
      setError('Hubo un error al conectar con Gemini IA. Intenta llenar los datos manualmente.');
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !species) {
      setError('El nombre y la especie son requeridos.');
      return;
    }
    setIsSaving(true);
    try {
      const newPlantId = await addPlant({
        name,
        species,
        location: location || 'Desconocida',
        watering_frequency: waterFreq,
        fertilizer_frequency: fertFreq,
        health_status: 'good',
        created_at: Date.now()
      });
      navigate(`/plant/${newPlantId}`);
    } catch (err) {
      setError('Error al guardar la planta.');
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nueva Planta</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (común o apodo)</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            placeholder="Ej. Ficus de la sala"
          />
          <button 
            type="button"
            onClick={handleIdentify}
            disabled={isAiLoading || !name}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Autocompletar con IA
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Escribe el nombre y presiona el botón para que Gemini IA busque los cuidados ideales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        
        {description && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm mb-4">
            <strong className="block mb-1">Consejo de Gemini:</strong>
            {description}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especie Científica</label>
          <input 
            type="text" 
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="Ej. Ficus elastica"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="Ej. Sala, Junto a la ventana"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Riego (cada X días)</label>
            <input 
              type="number" 
              value={waterFreq}
              onChange={(e) => setWaterFreq(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizante (cada X días)</label>
            <input 
              type="number" 
              value={fertFreq}
              onChange={(e) => setFertFreq(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-white font-bold py-3 rounded-xl mt-6 transition flex justify-center items-center gap-2"
        >
          {isSaving && <Loader2 size={20} className="animate-spin" />}
          Guardar Planta
        </button>
      </form>
    </div>
  );
};
