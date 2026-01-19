import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ CAMBIO 1: Usamos el hook
import { useChat } from '../src/contexts/ChatContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { sendMessageToOpenAIStream } from '../src/services/openai.service';

export default function ChatScreen() {
  const { apiKey, messages, addMessage, logout } = useChat();
  const { colors, toggleTheme, theme, resetTheme } = useTheme();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ CAMBIO 1: Obtenemos las medidas seguras calculadas por tu Layout
  const insets = useSafeAreaInsets();

  // ✅ CAMBIO 2: Lógica de Datos (Streaming integrado en la lista)
  const displayMessages = useMemo(() => messages.filter(m => m.role !== 'system'), [messages]);

  const dataWithStreaming = useMemo(() => {
    // Si hay streaming, lo agregamos como si fuera un mensaje más al final
    if (streamingContent && loading) {
      return [
        ...displayMessages,
        { role: 'assistant' as const, content: streamingContent, isStreaming: true }
      ];
    }
    return displayMessages;
  }, [displayMessages, streamingContent, loading]);

  // ✅ CAMBIO 3: Scroll Nativo (Sin setTimeout)
  const onContentSizeChange = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = async () => {
    const textToSend = input.trim();
    if (!textToSend) return;

    setInput('');
    setLoading(true);
    setStreamingContent('');

    const userMessage = { role: 'user' as const, content: textToSend };
    addMessage(userMessage);

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

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.navy.main }}>
      
      {/* StatusBar transparente para aprovechar toda la pantalla */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ✅ CAMBIO 4: Header Manual. Usamos insets.top para el padding. */}
      <View style={[styles.headerSafeContainer, { paddingTop: insets.top }]}>
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
            <IconButton
              icon={theme === 'dark' ? 'weather-sunny' : 'weather-night'}
              iconColor="white"
              size={24}
              onPress={toggleTheme}
            />
            <IconButton
              icon="logout"
              iconColor="#FDA4AF"
              size={24}
              onPress={handleExit}
            />
          </View>
        </View>
      </View>

      {/* ✅ CAMBIO 5: Teclado. 'undefined' en Android para que no pelee con el sistema */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.bodyContainer}>
          <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={{ flex: 1 }}
          >
              {displayMessages.length === 0 && !streamingContent ? (
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
  data={dataWithStreaming}
  keyExtractor={(_, index) => index.toString()}
  
  // 🔑 Espacio inferior para que el último mensaje no quede debajo del input
  contentContainerStyle={[
    styles.messagesList,
    { paddingBottom: 12 }
  ]}

  showsVerticalScrollIndicator={false}

  // 🔑 Scroll automático REAL (streaming fluido)
  onContentSizeChange={onContentSizeChange}

  // 🔑 Manejo correcto del teclado (iOS + Android)
  keyboardDismissMode="interactive"
  keyboardShouldPersistTaps="handled"

  // 🔑 iOS: deja que el sistema ajuste los insets automáticamente
  contentInsetAdjustmentBehavior="automatic"

  renderItem={({ item }) => (
    <View
      style={[
        styles.bubbleWrapper,
        item.role === 'user' ? styles.wrapperUser : styles.wrapperBot
      ]}
    >
      {item.role === 'assistant' && (
        <View style={styles.msgAvatarContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png' }}
            style={{ width: 24, height: 24 }}
          />
        </View>
      )}

      <Surface
        style={[
          styles.bubble,
          item.role === 'user' ? styles.userBubble : styles.botBubble
        ]}
        elevation={1}
      >
        <Text
          style={[
            styles.bubbleText,
            item.role === 'user'
              ? styles.userBubbleText
              : styles.botBubbleText
          ]}
        >
          {item.content}
          {(item as any).isStreaming && (
            <Text style={{ color: colors.navy.main }}> ▍</Text>
          )}
        </Text>
      </Surface>
    </View>
  )}
/>

              )}
          </LinearGradient>
        </View>

        {/* ✅ CAMBIO 6: Input Footer. Padding manual usando insets.bottom */}
        <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: colors.neutral.white,
              // Si hay notch abajo (iPhone X), usa ese espacio. Si no, usa 12px.
              paddingBottom: insets.bottom > 0 ? insets.bottom : 12 
            }
        ]}>
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
    // Sin paddingTop fijo, usamos insets
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 6,
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
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingTop: 30,
    // El paddingBottom se maneja dinámicamente en el contentContainerStyle
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
    minWidth: 50, 
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
    paddingTop: 12,
    // paddingBottom se aplica inline con insets
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
    paddingHorizontal: 10,
    textAlignVertical: 'top',
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