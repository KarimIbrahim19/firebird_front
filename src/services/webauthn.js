// /src/services/webauthn.js
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { authAPI } from '../api/client';

class WebAuthnService {
  constructor() {
    this.rpName = import.meta.env.VITE_WEBAUTHN_RP_NAME || 'Pharmacy Portal';
    this.rpId = import.meta.env.VITE_WEBAUTHN_RP_ID || '10.10.20.80';
  }

  /**
   * Check if WebAuthn is supported in the current browser
   */
  isSupported() {
    return browserSupportsWebAuthn();
  }

  /**
   * Check if platform authenticator is available (Touch ID, Face ID, Windows Hello)
   */
  async isPlatformAuthenticatorAvailable() {
    if (!this.isSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking platform authenticator:', error);
      return false;
    }
  }

  /**
   * Check if user has biometric credentials registered
   */
  async checkAvailability(email) {
    try {
      const response = await authAPI.checkBiometricAvailability(email);
      return response.data;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, hasCredentials: false };
    }
  }

  /**
   * Get device name for registration
   */
  getDeviceName() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Try to detect specific devices
    if (/iPhone/.test(userAgent)) {
      const model = userAgent.match(/iPhone OS (\d+)/);
      return model ? `iPhone (iOS ${model[1]})` : 'iPhone';
    }
    if (/iPad/.test(userAgent)) {
      const model = userAgent.match(/OS (\d+)/);
      return model ? `iPad (iOS ${model[1]})` : 'iPad';
    }
    if (/Android/.test(userAgent)) {
      const model = userAgent.match(/Android (\d+)/);
      return model ? `Android ${model[1]}` : 'Android Device';
    }
    if (/Windows/.test(platform)) {
      return 'Windows PC';
    }
    if (/Mac/.test(platform)) {
      return 'Mac';
    }
    if (/Linux/.test(platform)) {
      return 'Linux PC';
    }
    
    return 'Unknown Device';
  }

  /**
   * Register biometric authentication for the current user
   */
  async register(token) {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Get registration challenge from server
      const challengeResponse = await authAPI.getRegisterChallenge();
      const options = challengeResponse.data;
      
      // Start WebAuthn registration
      const credential = await startRegistration(options);
      
      // Verify with server
      const verifyResponse = await authAPI.verifyRegister({
        credential,
        deviceName: this.getDeviceName(),
      });
      
      return {
        success: true,
        data: verifyResponse.data,
      };
    } catch (error) {
      console.error('Biometric registration error:', error);
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric registration was cancelled or not allowed');
      }
      if (error.name === 'InvalidStateError') {
        throw new Error('A credential already exists for this device');
      }
      if (error.name === 'NotSupportedError') {
        throw new Error('Your device does not support biometric authentication');
      }
      
      throw error;
    }
  }

  /**
   * Login with biometric authentication
   */
  async login(email, rememberMe = false) {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Check if user has credentials
      const availability = await this.checkAvailability(email);
      if (!availability.hasCredentials) {
        throw new Error('No biometric credentials registered for this account');
      }
      
      // Get login challenge from server
      const challengeResponse = await authAPI.getLoginChallenge(email);
      const options = challengeResponse.data;
      
      // Start WebAuthn authentication
      const credential = await startAuthentication(options);
      
      // Verify with server
      const loginResponse = await authAPI.verifyLogin({
        email,
        credential,
        rememberMe,
      });
      
      return {
        success: true,
        data: loginResponse.data.data,
      };
    } catch (error) {
      console.error('Biometric login error:', error);
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled or not allowed');
      }
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      if (error.response?.status === 400) {
        throw new Error('No biometric credentials registered for this account');
      }
      
      throw error;
    }
  }

  /**
   * List all registered biometric devices
   */
  async listDevices() {
    try {
      const response = await authAPI.listCredentials();
      return response.data;
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }

  /**
   * Delete a registered biometric device
   */
  async deleteDevice(credentialId) {
    try {
      await authAPI.deleteCredential(credentialId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting device:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format device info for display
   */
  formatDeviceInfo(device) {
    const lastUsed = device.lastUsed 
      ? new Date(device.lastUsed).toLocaleDateString() 
      : 'Never';
    
    const created = new Date(device.createdAt).toLocaleDateString();
    
    return {
      ...device,
      displayName: device.deviceName || 'Unknown Device',
      formattedLastUsed: lastUsed,
      formattedCreated: created,
      isCurrentDevice: device.deviceName === this.getDeviceName(),
    };
  }
}

// Export singleton instance
const webAuthnService = new WebAuthnService();
export default webAuthnService;