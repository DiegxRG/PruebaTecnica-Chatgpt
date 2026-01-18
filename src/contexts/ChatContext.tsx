import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatContextType = {
  apiKey: string;
  setApiKey: (key: string) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  clearChat: () => void;
  logout: () => void;
  isLoading: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEYS = {
  API_KEY: 'chatgpt_api_key',
  MESSAGES: 'chatgpt_messages',
};

const SYSTEM_MESSAGE = {
  role: 'system' as const,
  content: 'You are a helpful assistant. Respond in the same language as the user.',
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKeyState] = useState('');
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedApiKey = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
        const savedMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);

        if (savedApiKey) {
          setApiKeyState(savedApiKey);
        }

        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Guardar API Key cuando cambia
  const setApiKey = async (key: string) => {
    setApiKeyState(key);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } catch (error) {
      console.error('Error guardando API Key:', error);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => {
      const updated = [...prev, message];
      // Guardar en AsyncStorage
      AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated)).catch(e =>
        console.error('Error guardando mensajes:', e)
      );
      return updated;
    });
  };

  const clearChat = async () => {
    setMessages([SYSTEM_MESSAGE]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (error) {
      console.error('Error borrando mensajes:', error);
    }
  };

  const logout = async () => {
    setApiKeyState('');
    setMessages([SYSTEM_MESSAGE]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.API_KEY);
      await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        apiKey,
        setApiKey,
        messages,
        addMessage,
        clearChat,
        logout,
        isLoading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
