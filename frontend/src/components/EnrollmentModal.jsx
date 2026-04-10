import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserPlus, X } from 'lucide-react';
import FaceScanner from './FaceScanner';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EnrollmentModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState('intro'); // intro, scanning, processing
  const [loading, setLoading] = useState(false);

  const handleEnroll = async (images) => {
    setStep('processing');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.post('/api/auth/enroll-face', { 
        userId: user.id || user._id, 
        images 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Biometric profile created successfully!');
      onComplete();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
      setStep('intro');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="relative p-10">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X className="w-6 h-6 text-sub" />
          </button>

          {step === 'intro' && (
            <div className="text-center space-y-8 py-6">
              <div className="w-20 h-20 bg-blue-50 dark:bg-[#005DAB]/10 rounded-3xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-[#005DAB]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-lead dark:text-white uppercase tracking-tight">Biometric Enrollment</h3>
                <p className="text-sm text-sub mt-2 px-8">Register your face to enable secure, hands-free authentication for shifts and task management.</p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setStep('scanning')}
                  className="w-full py-5 rounded-[2rem] bg-[#005DAB] text-white font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-[#005DAB]/20 flex items-center justify-center"
                >
                  <UserPlus className="w-4 h-4 mr-3" /> Start Registration
                </button>
                <p className="text-[10px] text-sub uppercase tracking-widest font-bold">Requires 3 security samples</p>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="py-2">
              <FaceScanner 
                mode="enroll" 
                targetSamples={3} 
                onCapture={handleEnroll} 
                autoStart={true} 
              />
              <button 
                onClick={() => setStep('intro')} 
                className="w-full mt-6 py-2 text-sub font-bold text-[10px] uppercase tracking-widest"
              >
                Go Back
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-20 space-y-8">
              <div className="w-16 h-16 border-4 border-t-[#FFD100] border-gray-100 dark:border-white/5 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-[#005DAB] uppercase tracking-[0.3em]">Creating Digital Identity...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EnrollmentModal;
