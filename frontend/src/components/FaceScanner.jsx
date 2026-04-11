import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FaceScanner = ({ onCapture, mode = 'verify', targetSamples = 1, autoStart = false, isLoading = false }) => {
  const webcamRef = useRef(null);
  const [samples, setSamples] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [status, setStatus] = useState('Initializing secure optical link...');
  const [error, setError] = useState(null);

  // Auto-start only when webcam is actually ready
  useEffect(() => {
    if (autoStart && isWebcamReady && !isCapturing && samples.length === 0) {
      const timer = setTimeout(() => startScan(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isWebcamReady, isCapturing, samples.length]);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSamples((prev) => {
          const newSamples = [...prev, imageSrc];
          if (newSamples.length >= targetSamples) {
            setIsCapturing(false);
            onCapture(newSamples);
            setStatus('Processing Biometrics...');
          } else {
            setStatus(`Capturing Sample ${newSamples.length + 1}/${targetSamples}`);
          }
          return newSamples;
        });
      }
    } catch (err) {
      console.error('Capture failed:', err);
    }
  }, [webcamRef, targetSamples, onCapture]);

  useEffect(() => {
    let interval;
    if (isCapturing && samples.length < targetSamples) {
      interval = setInterval(() => {
        capture();
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isCapturing, samples.length, targetSamples, capture]);

  const startScan = () => {
    setSamples([]);
    setIsCapturing(true);
    setError(null);
    setStatus(mode === 'verify' ? 'Blink to verify liveness...' : 'Stay still, capturing profile...');
  };

  const handleUserMedia = () => {
    setIsWebcamReady(true);
    setStatus('Optical link established. Ready for scan.');
  };

  const handleUserMediaError = (err) => {
    console.error('Webcam Error:', err);
    setIsWebcamReady(false);
    setError('Optical Sensor Blocked');
    setStatus('Review Privacy Settings');
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[3.5rem] overflow-hidden border-8 border-white dark:border-[#111827] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group bg-[#0B1120]">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.9}
          videoConstraints={{ facingMode: "user", width: { min: 320, ideal: 1280 }, height: { min: 240, ideal: 720 } }}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          className={`w-full h-full object-cover scale-110 transition-opacity duration-1000 ${isWebcamReady ? 'opacity-100' : 'opacity-0'}`}
        />

        <AnimatePresence>
          {!isWebcamReady && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#F2F2F7] dark:bg-[#0B1120] z-10"
            >
              <div className="w-12 h-12 border-4 border-[#005DAB]/20 border-t-[#005DAB] rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-bold text-sub uppercase tracking-[0.2em]">Warming Sensors...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#111827] z-20 p-8 text-center"
            >
              <div className="p-5 rounded-full bg-red-50 dark:bg-red-500/10 mb-6 shadow-sm">
                <Camera className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight mb-2">Sensor Connection Failed</h3>
              <p className="text-[10px] font-bold text-sub uppercase tracking-widest leading-relaxed mb-6 px-4">
                Please ensure camera access is enabled in your browser settings and try refreshing this portal.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl bg-[#F2F2F7] text-[#005DAB] font-bold text-[9px] uppercase tracking-widest hover:bg-blue-50 transition-colors"
              >
                Refresh Link
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 border-[50px] border-black/20 pointer-events-none z-30">
          <div className="w-full h-full border-2 border-[#005DAB] rounded-[2.5rem] relative">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FFD100]"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#FFD100]"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#FFD100]"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FFD100]"></div>
          </div>
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#005DAB]/80 flex flex-col items-center justify-center backdrop-blur-md z-40"
            >
              <div className="w-16 h-16 border-4 border-t-[#FFD100] border-white/20 rounded-full animate-spin mb-6"></div>
              <p className="text-white font-bold text-[10px] tracking-[0.3em] uppercase">Synthesizing Bio-Identity</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center space-y-6 w-full max-w-xs">
        <div className="px-6 py-4 bg-white dark:bg-[#111827] rounded-2xl border border-[#005DAB]/10 dark:border-white/10 shadow-xl shadow-black/5">
          <p className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] flex items-center justify-center uppercase tracking-widest ">
            <ShieldCheck className="w-4 h-4 mr-3 text-[#005DAB]" /> {status}
          </p>
        </div>

        {!isCapturing && isWebcamReady && (
          <button
            onClick={startScan}
            className="w-full py-5 rounded-[2rem] bg-[#005DAB] text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-[#005DAB]/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group overflow-hidden border-b-4 border-black/10"
          >
            <ShieldCheck className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" /> <span>Authorize Identity</span>
          </button>
        )}

        {isCapturing && (
          <div className="w-full h-2.5 bg-[#F2F2F7] dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-[#E5E5EA] dark:border-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-[#005DAB] to-[#FFD100]"
              initial={{ width: 0 }}
              animate={{ width: `${(samples.length / targetSamples) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceScanner;
