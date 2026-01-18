import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { useChat } from '../src/contexts/ChatContext';
import { useTheme } from '../src/contexts/ThemeContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [keyInput, setKeyInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { setApiKey, apiKey, isLoading } = useChat();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && apiKey) {
      router.replace('/biometric');
    }
  }, [isLoading, apiKey]);

  const validateApiKey = (key: string): boolean => {
    if (!key.trim()) {
      setError('La clave API es necesaria');
      return false;
    }
    if (!key.startsWith('sk-')) {
      setError('La clave debe comenzar con "sk-"');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = () => {
    if (validateApiKey(keyInput)) {
      setApiKey(keyInput.trim());
      router.push('/biometric');
    }
  };

  const openOpenAiPage = () => {
    Linking.openURL('https://platform.openai.com/api-keys');
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      
      {/* FONDO */}
      <LinearGradient
        colors={[colors.navy.main, '#1a2a40']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.mainContainer}>
              
              {/* 1. HEADER */}
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }} 
                    style={styles.robotImage}
                    resizeMode="contain"
                  />
                  <View style={styles.glowRing} />
                </View>
                <Text style={styles.headerTitle}>Bienvenido</Text>
                <Text style={styles.headerSubtitle}>Tu asistente IA personal</Text>
              </View>

              {/* 2. TARJETA BLANCA */}
              <View style={styles.cardContainer}>
                <ScrollView 
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  
                  {/* FORMULARIO */}
                  <View style={styles.formContent}>
                    <Text style={styles.inputLabel}>API Key de OpenAI</Text>
                    
                    <View style={styles.inputShadow}>
                      <TextInput
                        mode="flat"
                        value={keyInput}
                        onChangeText={(t) => { setKeyInput(t); setError(''); }}
                        secureTextEntry={!showPassword}
                        placeholder="sk-..."
                        placeholderTextColor="#94a3b8"
                        style={styles.input}
                        activeUnderlineColor={colors.navy.main}
                        underlineColor="transparent"
                        selectionColor={colors.navy.main}
                        left={<TextInput.Icon icon="key" color="#64748b" />}
                        right={
                          <TextInput.Icon 
                            icon={showPassword ? "eye-off" : "eye"} 
                            color="#64748b" 
                            onPress={() => setShowPassword(!showPassword)}
                          />
                        }
                      />
                    </View>

                    {error ? (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                      </View>
                    ) : null}

                    <Button
                      mode="contained"
                      onPress={handleLogin}
                      disabled={!keyInput.trim()}
                      style={styles.button}
                      contentStyle={{ height: 56 }}
                      labelStyle={styles.buttonLabel}
                    >
                      Conectar
                    </Button>
                  </View>

                  {/* 3. CARACTERÍSTICAS */}
                  <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                      <View style={[styles.featureIconBox, { backgroundColor: '#DBEAFE' }]}>
                        <IconButton icon="message-text" iconColor="#2563EB" size={24} style={{margin:0}} />
                      </View>
                      <View style={styles.featureTextBox}>
                        <Text style={styles.featureTitle}>Conversaciones naturales</Text>
                        <Text style={styles.featureSubtitle}>Chatea como si hablaras con un amigo</Text>
                      </View>
                    </View>

                    <View style={styles.featureItem}>
                      <View style={[styles.featureIconBox, { backgroundColor: '#FEF3C7' }]}>
                        <IconButton icon="lightning-bolt" iconColor="#D97706" size={24} style={{margin:0}} />
                      </View>
                      <View style={styles.featureTextBox}>
                        <Text style={styles.featureTitle}>Respuestas instantáneas</Text>
                        <Text style={styles.featureSubtitle}>Obtén ayuda en tiempo real</Text>
                      </View>
                    </View>

                    <View style={styles.featureItem}>
                      <View style={[styles.featureIconBox, { backgroundColor: '#D1FAE5' }]}>
                        <IconButton icon="shield-check" iconColor="#059669" size={24} style={{margin:0}} />
                      </View>
                      <View style={styles.featureTextBox}>
                        <Text style={styles.featureTitle}>100% Privado y seguro</Text>
                        <Text style={styles.featureSubtitle}>Tu información está protegida</Text>
                      </View>
                    </View>
                  </View>

                  {/* 4. FOOTER INFO (Ahora más arriba) */}
                  <View style={styles.footerInfo}>
                    <TouchableOpacity onPress={openOpenAiPage}>
                      <Text style={styles.footerText}>
                        ¿No tienes una llave? <Text style={{fontWeight: 'bold', color: colors.navy.main}}>openai.com</Text>
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.securityBadge}>
                      <Text style={{fontSize: 12}}>🔐</Text>
                      <Text style={styles.securityText}>
                         Tu llave se guarda encriptada en tu dispositivo.
                      </Text>
                    </View>
                  </View>

                </ScrollView>
              </View>

            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  backgroundGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: height * 0.05, 
    paddingBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  robotImage: {
    width: 60,
    height: 60,
    zIndex: 2,
  },
  glowRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#60A5FA',
    opacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.neutral.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CBD5E1',
    marginTop: 5,
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  formContent: {
    marginBottom: 20, // Reducido ligeramente
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy.main,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  inputShadow: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
    height: 60,
    fontSize: 16,
    color: '#1E293B',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
  },
  errorText: {
    color: colors.status.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    borderRadius: 16,
    backgroundColor: colors.navy.main,
    shadowColor: colors.navy.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#FFF',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 25, // Reducido el margen inferior
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  // FOOTER CORREGIDO
  footerInfo: {
    alignItems: 'center',
    // ELIMINADO: marginTop: 'auto',
    marginTop: 10, // Solo un pequeño margen superior
    gap: 15,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  securityText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
});