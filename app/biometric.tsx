import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useChat } from '../src/contexts/ChatContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { BiometricService } from '../src/services/biometric.service';
import { spacing } from '../src/theme/colors';

export default function BiometricScreen() {
  const { apiKey } = useChat();
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometría');

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      // Si no hay API Key, ir al login normal
      if (!apiKey) {
        router.replace('/');
        return;
      }

      // Verificar si hay biometría disponible
      const available = await BiometricService.isBiometricAvailable();
      setBiometricAvailable(available);

      if (available) {
        const biometrics = await BiometricService.getAvailableBiometrics();
        if (biometrics.length > 0) {
          setBiometricType(biometrics[0]);
        }
      }

      setLoading(false);

      // Si hay biometría, intentar autenticar automáticamente
      if (available) {
        await attemptBiometric();
      } else {
        // Si no hay biometría, ir directo al chat
        router.replace('/chat');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Error al inicializar autenticación');
    }
  };

  const attemptBiometric = async () => {
    try {
      setLoading(true);
      const success = await BiometricService.authenticate();

      if (success) {
        router.replace('/chat');
      } else {
        // Usuario canceló, mostrar opciones
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error de autenticación', error.message || 'Intenta de nuevo');
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.navy.main }]}>
      <View style={[styles.container, { backgroundColor: colors.neutral.white }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.user.bg} />
            <Text variant="bodyMedium" style={[styles.loadingText, { color: colors.slate.main }]}>
              Autenticando...
            </Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Text variant="displaySmall" style={styles.emoji}>
              🔐
            </Text>
            <Text variant="headlineLarge" style={[styles.title, { color: colors.navy.main }]}>
              Autenticación
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: colors.slate.main, marginBottom: spacing.xl }]}
            >
              Usa {biometricType} para acceder rápidamente
            </Text>

            <Button
              mode="contained"
              onPress={attemptBiometric}
              style={[styles.button, { backgroundColor: colors.user.bg }]}
              labelStyle={styles.buttonLabel}
              disabled={loading}
            >
              🔓 Usar {biometricType}
            </Button>

            <Button
              mode="outlined"
              onPress={handleSkip}
              style={styles.skipButton}
              labelStyle={[styles.skipButtonLabel, { color: colors.slate.main }]}
            >
              Omitir
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: spacing.md,
    borderColor: '#CBD5E1',
  },
  skipButtonLabel: {
    fontSize: 14,
  },
});
