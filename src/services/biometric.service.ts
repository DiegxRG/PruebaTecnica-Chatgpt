import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricService = {
  /**
   * Verifica si el dispositivo soporta autenticación biométrica
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtiene los tipos de biometría disponibles
   */
  async getAvailableBiometrics(): Promise<string[]> {
    try {
      const biometrics = (await LocalAuthentication.supportedAuthenticationTypesAsync()) as number[];
      return biometrics.map((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Huella Dactilar';
          default:
            return 'Biometría';
        }
      });
    } catch (error) {
      return [];
    }
  },

  /**
   * Solicita autenticación biométrica al usuario
   */
  async authenticate(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      
      if (!isAvailable) {
        throw new Error('La autenticación biométrica no está disponible en este dispositivo');
      }

      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error: any) {
      // Si el usuario cancela, no lanzar error (handled en el flujo)
      if (error.name === 'LAError' || error.code === 'ERR_CANCELLED') {
        return false;
      }
      throw error;
    }
  },

  /**
   * Verifica si hay biometría enrolled en el dispositivo
   */
  async isEnrolled(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return false;

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      return false;
    }
  },
};
