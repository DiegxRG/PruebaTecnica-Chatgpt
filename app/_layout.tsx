import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatProvider } from '../src/contexts/ChatContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ChatProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </ChatProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
