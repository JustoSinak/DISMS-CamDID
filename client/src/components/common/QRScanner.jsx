// client/src/components/common/QRScanner.jsx - QR code scanner component
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCodeIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const QRScanner = ({
  onScan,
  onError,
  onClose,
  isOpen = false,
  className = ''
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        videoRef.current.onloadedmetadata = () => {
          setIsScanning(true);
          startQRDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setError('Camera access denied or not available');

      if (onError) {
        onError(err);
      } else {
        toast.error('Camera access denied. Please enable camera permissions.');
      }
    }
  }, [onError, startQRDetection]);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, startScanning]);

  const stopScanning = () => {
    setIsScanning(false);

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear scan interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startQRDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Scan for QR codes every 500ms
    scanIntervalRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Try to detect QR code
        try {
          const qrCode = detectQRCode(imageData);
          if (qrCode) {
            handleQRCodeDetected(qrCode);
          }
        } catch (err) {
          console.error('QR detection error:', err);
        }
      }
    }, 500);
  }, []);

  const detectQRCode = (imageData) => {
    // This is a simplified QR detection
    // In a real implementation, you would use a library like jsQR
    try {
      // For now, we'll simulate QR detection
      // You should install and use jsQR library: npm install jsqr
      // import jsQR from 'jsqr';
      // const code = jsQR(imageData.data, imageData.width, imageData.height);
      // return code ? code.data : null;

      // Placeholder implementation - in real app, use jsQR library
      return null;
    } catch (error) {
      console.error('QR code detection error:', error);
      return null;
    }
  };

  const handleQRCodeDetected = (qrData) => {
    try {
      // Parse QR code data
      const parsedData = JSON.parse(qrData);

      // Validate QR code structure
      if (parsedData.type === 'credential_share' && parsedData.shareId) {
        setIsScanning(false);

        if (onScan) {
          onScan(parsedData);
        }

        toast.success('QR code scanned successfully!');
      } else {
        toast.error('Invalid QR code format');
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      toast.error('Invalid QR code data');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = detectQRCode(imageData);

        if (qrCode) {
          handleQRCodeDetected(qrCode);
        } else {
          toast.error('No QR code found in the image');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${className}`}>
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <CameraIcon className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : hasPermission === false ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <CameraIcon className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 mb-4">
                Camera permission is required to scan QR codes
              </p>
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Grant Permission
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-emerald-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500"></div>

                      {/* Scanning Line Animation */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {!isScanning && hasPermission && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="text-white text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-gray-600">
                <p>Position the QR code within the frame to scan</p>
              </div>

              {/* Alternative Upload Option */}
              <div className="border-t pt-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                    <QrCodeIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      Or upload QR code image
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Canvas for QR Detection */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default QRScanner;