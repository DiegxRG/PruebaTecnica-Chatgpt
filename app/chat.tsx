import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import {
    ActivityIndicator,
    IconButton,
    Surface,
    Text,
    TextInput
} from 'react-native-paper';
import { useChat } from '../src/contexts/ChatContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { sendMessageToOpenAIStream } from '../src/services/openai.service';

export default function ChatScreen() {
  const { apiKey, messages, addMessage, clearChat, logout } = useChat();
  const { colors, toggleTheme, theme, resetTheme } = useTheme();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll automático
  useEffect(() => {
    if (messages.length > 1 || streamingContent) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setStreamingContent('');

    let fullResponse = ''; 
    abortControllerRef.current = new AbortController();

    try {
      const messagesForApi = messages.filter(
        (m): m is { role: 'user' | 'assistant'; content: string } =>
          m.role === 'user' || m.role === 'assistant'
      );

      await sendMessageToOpenAIStream(
        apiKey,
        [...messagesForApi, userMessage],
        (chunk: string) => {
          fullResponse += chunk; 
          setStreamingContent((prev) => prev + chunk);
        },
        abortControllerRef.current.signal
      );

      if (fullResponse) {
        addMessage({ role: 'assistant', content: fullResponse });
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        Alert.alert('Error', error.message || 'Error de conexión.');
      }
    } finally {
      setStreamingContent(''); 
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Cerrar Sesión', '¿Está seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir', style: 'destructive',
          onPress: async () => {
            await logout();
            await resetTheme();
            router.replace('/');
          },
        },
      ]
    );
  };

  const displayMessages = messages.filter(m => m.role !== 'system');
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy.main }}>
      {/* SOLUCIÓN 2: StatusBar Translúcida y manejo de espacio */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* 1. HEADER (Fijo, fuera del KeyboardAvoidingView para que no se mueva raro) */}
      <View style={styles.headerSafeContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }} 
                style={styles.avatarImage}
              />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Asistente IA</Text>
              <Text style={styles.headerSubtitle}>
                {loading ? 'Escribiendo...' : 'En línea'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
             <IconButton icon={theme === 'dark' ? 'weather-sunny' : 'weather-night'} iconColor="white" size={24} onPress={toggleTheme} />
             <IconButton icon="logout" iconColor="#FDA4AF" size={24} onPress={handleExit} />
          </View>
        </View>
      </View>

      {/* SOLUCIÓN 1: El KeyboardAvoidingView envuelve el CHAT y el INPUT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        // keyboardVerticalOffset ayuda si el header tapa algo, ajústalo si es necesario
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
      >
        {/* 2. BODY (Tarjeta Blanca) */}
        <View style={styles.bodyContainer}>
          <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={{ flex: 1 }}
          >
              {displayMessages.length === 0 ? (
                <View style={styles.emptyState}>
                  <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png' }}
                    style={{ width: 80, height: 80, opacity: 0.5, marginBottom: 20 }}
                  />
                  <Text variant="titleMedium" style={{ color: '#94A3B8' }}>
                    ¡Hola! ¿En qué puedo ayudarte hoy?
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={displayMessages}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={styles.messagesList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={[
                      styles.bubbleWrapper, 
                      item.role === 'user' ? styles.wrapperUser : styles.wrapperBot
                    ]}>
                      {item.role === 'assistant' && (
                          <View style={styles.msgAvatarContainer}>
                              <Image 
                                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }} 
                                  style={{ width: 24, height: 24 }}
                              />
                          </View>
                      )}
                      <Surface style={[
                        styles.bubble,
                        item.role === 'user' ? styles.userBubble : styles.botBubble,
                      ]} elevation={1}>
                        <Text style={[
                          styles.bubbleText,
                          item.role === 'user' ? styles.userBubbleText : styles.botBubbleText
                        ]}>
                          {item.content}
                        </Text>
                      </Surface>
                    </View>
                  )}
                />
              )}

              {streamingContent ? (
                 <View style={[styles.bubbleWrapper, styles.wrapperBot, { paddingHorizontal: 20 }]}>
                    <View style={styles.msgAvatarContainer}>
                        <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }} style={{ width: 24, height: 24 }} />
                    </View>
                    <Surface style={[styles.bubble, styles.botBubble]} elevation={1}>
                      <Text style={[styles.bubbleText, styles.botBubbleText]}>
                          {streamingContent}<Text style={{color: colors.navy.main}}> ▍</Text> 
                      </Text>
                    </Surface>
                 </View>
              ) : null}
          </LinearGradient>
        </View>

        {/* 3. INPUT AREA (Ahora dentro del KeyboardAvoidingView) */}
        <View style={[styles.inputContainer, { backgroundColor: colors.neutral.white }]}>
          <View style={styles.inputWrapper}>
             <TextInput
                mode="flat"
                value={input}
                onChangeText={setInput}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#94a3b8"
                style={styles.inputField}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                multiline
             />
             <TouchableOpacity 
                onPress={handleSend}
                disabled={loading || !input.trim()}
                style={[
                    styles.sendButton,
                    { backgroundColor: (!input.trim() || loading) ? '#E2E8F0' : colors.navy.main }
                ]}
             >
                {loading ? (
                    <ActivityIndicator size={20} color={colors.navy.main} />
                ) : (
                    <IconButton icon="send" iconColor={(!input.trim()) ? '#94a3b8' : 'white'} size={20} style={{margin: 0}} />
                )}
             </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  // HEADER
  headerSafeContainer: {
    backgroundColor: colors.navy.main,
    // SOLUCIÓN 2: Padding manual para Android
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: colors.navy.main,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },

  // BODY
  bodyContainer: {
    flex: 1, // Esto hace que ocupe todo el espacio disponible
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
    // Quitamos el marginTop fijo para evitar huecos al subir el teclado, 
    // el diseño curvo se mantiene.
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },

  // BUBBLES
  bubbleWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  wrapperUser: {
    justifyContent: 'flex-end',
  },
  wrapperBot: {
    justifyContent: 'flex-start',
  },
  msgAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: colors.navy.main,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userBubbleText: {
    color: 'white',
  },
  botBubbleText: {
    color: '#1E293B',
  },

  // INPUT
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Importante para el teclado:
    backgroundColor: 'white', 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 30,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputField: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});