import { getFaceDetector } from './faceDetection';

export const livenessDetection = async (imageData) => {
  try {
    const faceDetector = getFaceDetector();
    
    // Analyze image for liveness
    const result = await faceDetector.analyzeLiveness(imageData);
    
    // Check for multiple faces
    if (result.faces.length !== 1) {
      throw new Error('Multiple faces detected');
    }
    
    // Check for liveness
    if (!result.livenessScore || result.livenessScore < 0.7) {
      throw new Error('Liveness score too low');
    }
    
    return {
      verified: true,
      confidence: result.livenessScore,
      faceData: result.faces[0]
    };
  } catch (error) {
    console.error('Liveness detection error:', error);
    return {
      verified: false,
      error: error.message
    };
  }
};
