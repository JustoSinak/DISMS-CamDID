import { getFingerprintManager } from 'react-native-biometrics';
import { getFaceDetector } from './faceDetection';

export const enrollBiometrics = async () => {
  try {
    // Initialize biometric managers
    const fingerprintManager = getFingerprintManager();
    const faceDetector = getFaceDetector();

    // Enroll fingerprint
    const fingerprintData = await fingerprintManager.enroll();

    // Enroll face template (optional)
    let faceTemplate = null;
    if (faceDetector.isAvailable()) {
      faceTemplate = await faceDetector.enroll();
    }

    return {
      fingerprintData,
      faceTemplate
    };
  } catch (error) {
    console.error('Biometric enrollment error:', error);
    throw error;
  }
};

export const verifyBiometrics = async (type = 'fingerprint') => {
  try {
    const fingerprintManager = getFingerprintManager();
    
    if (type === 'fingerprint') {
      return await fingerprintManager.verify();
    } else {
      const faceDetector = getFaceDetector();
      return await faceDetector.verify();
    }
  } catch (error) {
    console.error('Biometric verification error:', error);
    throw error;
  }
};
