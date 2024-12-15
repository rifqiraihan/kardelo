import { useState } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import { FaPowerOff } from "react-icons/fa6";


const Headers = () => {

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userName, setUserName] = useState<string | null>('');

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');


    router.replace('/login');
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };


  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    const initials = names.map((n) => n[0]).join('');
    return initials.toUpperCase();
  };

  React.useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName');
      setUserName(storedUserName);
    }
  }, []);

  return (
    <header className="bg-blue-500 p-4 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kardello</h1>
        
        {userName ? (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex flex-row items-center gap-1 space-x-2 px-4 py-2 rounded-lg"
            >
              <div className={`w-12 h-12  rounded-full flex items-center text-lg justify-center text-blue-500 font-bold bg-white`}>
                              {getInitials(userName)}
                            </div>
              <div className="text-lg font-medium flex items-center ">
                  <span>{userName}</span>
                </div>
            </button>
            
            {dropdownVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                <div className="px-4 py-3 text-lg font-medium border-b-2 ">
                  <span>{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex flex-row gap-2 items-center text-left px-4 py-3 text-xl text-red-500 hover:text-red-700"
                >
                  <FaPowerOff className='w-5 h-5'/>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <span>Welcome, Guest</span>
        )}
      </div>
    </header>
  );
};

export default Headers;
