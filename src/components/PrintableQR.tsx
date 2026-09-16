import QRCode from 'react-qr-code';

interface PrintableQRProps {
  plantId: string;
  name: string;
  species: string;
}

export const PrintableQR: React.FC<PrintableQRProps> = ({ plantId, name, species }) => {
  // Generar URL hacia los detalles de la planta.
  // En producción, debería ser el dominio real. 
  // Para pruebas usaremos window.location.origin
  const url = `${window.location.origin}/plant/${plantId}`;

  return (
    <div className="w-[58mm] bg-white text-black p-4 flex flex-col items-center border-2 border-black print:border-none print:shadow-none shadow-md">
      <h2 className="text-xl font-bold text-center mb-1 leading-tight">{name}</h2>
      <p className="text-xs text-center italic mb-3">{species}</p>
      
      <div className="bg-white p-2">
        <QRCode 
          value={url} 
          size={160}
          level="H"
        />
      </div>
      
      <div className="mt-3 text-[10px] text-center uppercase tracking-widest font-semibold border-t-2 border-black w-full pt-1">
        Escanear para bitácora
      </div>
    </div>
  );
};
