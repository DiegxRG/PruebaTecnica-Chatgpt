import axios from 'axios';

type OpenAIMessage = {
  role: 'user' | 'assistant';
  content: string;
};

// --- Función 1: Envío normal (Sin cambios) ---
export async function sendMessageToOpenAI(
  apiKey: string,
  messages: OpenAIMessage[]
): Promise<string> {
  try {
    if (!apiKey || !apiKey.trim()) throw new Error('API Key is missing');
    if (messages.length === 0) throw new Error('No messages provided');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    return content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
    throw error;
  }
}

// --- Función 2: Streaming (Adaptado para React Native) ---
export function sendMessageToOpenAIStream(
  apiKey: string,
  messages: OpenAIMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!apiKey || !apiKey.trim()) {
      return reject(new Error('API Key is missing or invalid'));
    }

    if (messages.length === 0) {
      return reject(new Error('No messages provided'));
    }

    // Usamos XMLHttpRequest nativo porque soporta "onprogress" en React Native
    const xhr = new XMLHttpRequest();
    let lastResponseLength = 0; // Para rastrear cuánto hemos leído

    xhr.open('POST', 'https://api.openai.com/v1/chat/completions');

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${apiKey}`);

    // Configuración del body
    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Manejar cancelación (AbortController)
    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        // No rechazamos la promesa si es abortado por el usuario, o resolvemos silenciosamente
        resolve(); 
      });
    }

    // Evento clave: Se dispara cada vez que llega un pedacito de texto
    xhr.onprogress = () => {
      // Obtenemos solo la parte NUEVA de la respuesta
      const response = xhr.responseText;
      const newChunk = response.substring(lastResponseLength);
      lastResponseLength = response.length;

      // Procesamos los datos nuevos
      const lines = newChunk.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Ignorar líneas vacías o el mensaje de finalización
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.replace(/^data: /, '');
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.log('Error parsing JSON chunk', e);
          }
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData?.error?.message || `HTTP Error ${xhr.status}`));
        } catch (e) {
          reject(new Error(`HTTP Error ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred'));
    };

    xhr.send(body);
  });
}