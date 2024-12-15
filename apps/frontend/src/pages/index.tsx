import { useEffect } from 'react';
import { useRouter } from 'next/router';
import "../app/globals.css";

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      const expirationTime = localStorage.getItem('authExpirationTime');
      const currentTime = Date.now();

      if (!token || !expirationTime || currentTime >= parseInt(expirationTime)) {
        router.replace('/login');
      }else{
        router.replace('/home');
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-blue-500 h-screen flex justify-center items-center text-white font-bold">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-4xl mb-4">Kardello</h1>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
