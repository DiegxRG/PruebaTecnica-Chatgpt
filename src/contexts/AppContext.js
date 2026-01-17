import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const saveApiKey = (key) => {
    setApiKey(key);
  };

  const addMessage = (message) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const clearSession = () => {
    setApiKey('');
    setChatHistory([]);
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        chatHistory,
        loading,
        setLoading,
        saveApiKey,
        addMessage,
        clearSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
