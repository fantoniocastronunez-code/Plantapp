import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlants } from '../services/dbService';
import type { Plant } from '../types';
import { Droplet, Leaf } from 'lucide-react';

export const Dashboard = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const data = await getPlants();
        setPlants(data);
      } catch (error) {
        console.error("Error fetching plants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando tus plantas...</div>;
  }

  if (plants.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <Leaf size={48} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Aún no tienes plantas</h2>
        <p className="text-gray-500 mb-6">Agrega tu primera planta para comenzar a controlarlas.</p>
        <Link to="/add" className="bg-primary text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-primary-dark transition">
          Agregar Planta
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mi Colección</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <Link to={`/plant/${plant.id}`} key={plant.id} className="block">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary opacity-5 rounded-bl-full group-hover:scale-110 transition-transform"></div>
              
              <h2 className="text-xl font-semibold text-gray-800">{plant.name}</h2>
              <p className="text-sm text-gray-500 italic mb-4">{plant.species}</p>
              
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-1 text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                  <Droplet size={14} />
                  <span>Cada {plant.watering_frequency} días</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  plant.health_status === 'excellent' ? 'bg-green-100 text-green-700' :
                  plant.health_status === 'good' ? 'bg-blue-100 text-blue-700' :
                  plant.health_status === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {plant.health_status === 'excellent' ? 'Excelente' :
                   plant.health_status === 'good' ? 'Buena' :
                   plant.health_status === 'fair' ? 'Regular' : 'Mala'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
