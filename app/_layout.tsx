import { Stack } from 'expo-router';
import { ChatProvider } from '../src/contexts/ChatContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="index"
        />
      </ChatProvider>
    </ThemeProvider>
  );
}
