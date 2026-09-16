import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getPlant, getLogs, addLog, updatePlant } from '../services/dbService';
import type { Plant, PlantLog, ActionType, HealthStatus } from '../types';
import { PrintableQR } from '../components/PrintableQR';
import { Droplets, Sprout, Activity, Printer, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const PlantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [logs, setLogs] = useState<PlantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const p = await getPlant(id);
      setPlant(p);
      const l = await getLogs(id);
      setLogs(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action: ActionType, note?: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await addLog({
        plantId: id,
        date: Date.now(),
        action,
        note
      });
      await fetchData(); // Refresh logs
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHealthChange = async (status: HealthStatus) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await updatePlant(id, { health_status: status });
      await handleAction('health_update', `Salud actualizada a: ${status}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles...</div>;
  if (!plant) return <div className="p-8 text-center text-red-500">Planta no encontrada</div>;

  const actionIcons = {
    water: <Droplets size={16} className="text-blue-500" />,
    fertilize: <Activity size={16} className="text-purple-500" />,
    sprout: <Sprout size={16} className="text-green-500" />,
    health_update: <Activity size={16} className="text-orange-500" />
  };

  const actionLabels = {
    water: 'Regado',
    fertilize: 'Fertilizado',
    sprout: 'Nuevo Brote',
    health_update: 'Actualización de Salud'
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      
      {/* Contenido Principal (Se oculta al imprimir) */}
      <div className="flex-1 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{plant.name}</h1>
              <p className="text-gray-500 italic">{plant.species}</p>
            </div>
            <button 
              onClick={handlePrint}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition"
              title="Imprimir QR (Etiqueta 58mm)"
            >
              <Printer size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-xl text-blue-900">
              <span className="text-xs uppercase font-bold text-blue-500 tracking-wider">Riego</span>
              <p className="font-semibold text-lg mt-1">Cada {plant.watering_frequency} días</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-purple-900">
              <span className="text-xs uppercase font-bold text-purple-500 tracking-wider">Fertilizante</span>
              <p className="font-semibold text-lg mt-1">Cada {plant.fertilizer_frequency} días</p>
            </div>
          </div>

          <div className="mt-6">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-2 block">Estado de Salud</span>
            <div className="flex gap-2">
              {(['excellent', 'good', 'fair', 'poor'] as HealthStatus[]).map(status => (
                <button
                  key={status}
                  disabled={actionLoading}
                  onClick={() => handleHealthChange(status)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    plant.health_status === status 
                      ? 'bg-primary text-white shadow' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'excellent' ? 'Excelente' :
                   status === 'good' ? 'Buena' :
                   status === 'fair' ? 'Regular' : 'Mala'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('water')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition shadow-sm"
          >
            <Droplets size={24} />
            <span className="font-semibold text-sm">Regar</span>
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('fertilize')}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition shadow-sm"
          >
            <Activity size={24} />
            <span className="font-semibold text-sm">Fertilizar</span>
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('sprout')}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition shadow-sm"
          >
            <Sprout size={24} />
            <span className="font-semibold text-sm">Brote</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            Bitácora
          </h2>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay registros aún.</p>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="bg-gray-50 p-2 rounded-full mt-1">
                    {actionIcons[log.action]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{actionLabels[log.action]}</p>
                    <p className="text-sm text-gray-500">{format(log.date, 'PPpp')}</p>
                    {log.note && <p className="text-sm text-gray-600 mt-1">{log.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección para Imprimir (Solo visible al imprimir o en un panel de preview si se desea) */}
      <div className="hidden print:block absolute top-0 left-0 w-full h-full bg-white z-50">
        <PrintableQR plantId={id!} name={plant.name} species={plant.species} />
      </div>

      {/* Preview opcional del QR en pantalla */}
      <div className="w-[58mm] hidden md:block print:hidden flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Preview Etiqueta</h3>
        <PrintableQR plantId={id!} name={plant.name} species={plant.species} />
      </div>
      
    </div>
  );
};
