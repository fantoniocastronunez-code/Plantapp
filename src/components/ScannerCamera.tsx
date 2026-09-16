import { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface ScannerCameraProps {
  onCapture: (base64Data: string, mimeType: string) => void;
  onCancel: () => void;
}

export const ScannerCamera = ({ onCapture, onCancel }: ScannerCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = async () => {
    setIsLoading(true);
    setError('');
    
    // Stop any existing streams first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsLoading(false);
      setError('No se pudo acceder a la cámara. Asegúrate de dar permisos en tu navegador.');
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      // Cleanup: stop camera when unmounted
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // Configurar el canvas con una resolución más baja y optimizada para IA
    // Esto evita el error de memoria en teléfonos (e.g. limitamos a max 800px ancho o alto)
    const MAX_DIMENSION = 800;
    let targetWidth = video.videoWidth;
    let targetHeight = video.videoHeight;
    
    if (targetWidth > targetHeight) {
      if (targetWidth > MAX_DIMENSION) {
        targetHeight = targetHeight * (MAX_DIMENSION / targetWidth);
        targetWidth = MAX_DIMENSION;
      }
    } else {
      if (targetHeight > MAX_DIMENSION) {
        targetWidth = targetWidth * (MAX_DIMENSION / targetHeight);
        targetHeight = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // Convertir a JPEG con calidad 0.8 para ahorrar mucha memoria
      const mimeType = 'image/jpeg';
      const base64DataUrl = canvas.toDataURL(mimeType, 0.8);
      
      // Separar el raw data del mimeType para la API
      const rawBase64 = base64DataUrl.split(',')[1];
      
      // Detener cámara tras tomar foto
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      onCapture(rawBase64, mimeType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 flex gap-4 z-50">
        <button 
          onClick={startCamera} 
          className="bg-gray-800 bg-opacity-70 text-white p-3 rounded-full shadow hover:bg-gray-700"
          title="Recargar cámara"
        >
          <RefreshCw size={24} />
        </button>
        <button 
          onClick={onCancel} 
          className="bg-red-500 bg-opacity-90 text-white p-3 rounded-full shadow hover:bg-red-600"
          title="Cerrar cámara"
        >
          <X size={24} />
        </button>
      </div>
      
      {isLoading && (
        <div className="text-white text-lg absolute z-10 flex flex-col items-center">
          <RefreshCw className="animate-spin mb-4" size={40} />
          Iniciando cámara...
        </div>
      )}

      {error && (
        <div className="text-white text-center p-8 z-10 bg-black">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button 
            onClick={onCancel}
            className="bg-gray-800 px-6 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      )}

      <video 
        ref={videoRef} 
        playsInline
        muted
        className="w-full h-full object-cover"
      ></video>
      
      {!error && !isLoading && (
        <div className="absolute bottom-10 w-full flex justify-center pb-4 z-50">
          <button 
            onClick={takePhoto}
            className="w-20 h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center hover:bg-opacity-50 transition border-4 border-white"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
               <Camera size={32} className="text-gray-800" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
