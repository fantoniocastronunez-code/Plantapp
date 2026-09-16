import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <Sprout size={24} />
          PlantApp
        </Link>
        <Link to="/add" className="bg-white text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-sm">
          + Nueva Planta
        </Link>
      </div>
    </nav>
  );
};
