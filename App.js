import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import { AppProvider } from './src/contexts/AppContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {/* Screens go here */}
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </PaperProvider>
  );
}
