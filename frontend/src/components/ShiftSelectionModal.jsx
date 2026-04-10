import React from 'react';
import { Sun, Moon, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShiftSelectionModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-[3rem] shadow-2xl overflow-hidden border border-[#E5E5EA] dark:border-white/10 p-10"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold uppercase tracking-tight">
                <span className="text-[#005DAB] dark:text-[#5AC8FA]">Select</span> <span className="text-[#FFD100]">Shift Phase</span>
              </h3>
              <button 
                onClick={onClose} 
                className="p-2 bg-[#F2F2F7] dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5 text-sub" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => onSelect('day')} 
                className="group p-8 rounded-[2.5rem] bg-[#F9F9FB] dark:bg-white/5 border-2 border-transparent hover:border-[#FFD100] hover:bg-[#FFD100]/5 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#FFD100]/20 flex items-center justify-center text-[#FFD100] group-hover:scale-110 transition-transform">
                    <Sun className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">Day Shift</h4>
                    <p className="text-[10px] font-bold text-sub uppercase tracking-widest">09:00 AM - 06:00 PM</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-[#E5E5EA] group-hover:text-[#FFD100] group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => onSelect('night')} 
                className="group p-8 rounded-[2.5rem] bg-[#F9F9FB] dark:bg-white/5 border-2 border-transparent hover:border-[#005DAB] hover:bg-[#005DAB]/5 transition-all flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#005DAB]/20 flex items-center justify-center text-[#005DAB] dark:text-[#5AC8FA] group-hover:scale-110 transition-transform">
                    <Moon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-tight">Night Shift</h4>
                    <p className="text-[10px] font-bold text-sub uppercase tracking-widest">09:00 PM - 06:00 AM</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-[#E5E5EA] group-hover:text-[#005DAB] dark:group-hover:text-[#5AC8FA] group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <p className="text-center mt-10 text-[9px] font-bold text-sub uppercase tracking-[0.2em] leading-relaxed italic opacity-60">
              Phase selection is critical for payroll synchronization and operational reporting.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShiftSelectionModal;
