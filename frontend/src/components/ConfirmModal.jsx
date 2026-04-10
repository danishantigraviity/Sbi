import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}) => {
  return (
    <AnimatePresence>
      {" "}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          {" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-[#111827] rounded-[2rem] border border-[#E5E5EA] dark:border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {" "}
            <div
              className={`p-6 ${isDestructive ? "bg-red-500/10" : "bg-[#007AFF]/10"} flex items-center justify-between`}
            >
              {" "}
              <div
                className={`p-3 rounded-xl ${isDestructive ? "bg-red-500/20 text-red-500" : "bg-[#007AFF]/20 text-[#007AFF]"}`}
              >
                {" "}
                <AlertTriangle className="w-5 h-5" />{" "}
              </div>{" "}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-sub"
              >
                {" "}
                <X className="w-5 h-5" />{" "}
              </button>{" "}
            </div>{" "}
            <div className="p-8 text-center">
              {" "}
              <h3 className="text-xl font-bold text-lead dark:text-white uppercase tracking-tight mb-3">
                {" "}
                {title}{" "}
              </h3>{" "}
              <p className="text-sub font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
                {" "}
                {message}{" "}
              </p>{" "}
              <div className="flex gap-3">
                {" "}
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-white/5 text-lead dark:text-[#E5E7EB] font-bold uppercase text-[9px] tracking-widest hover:bg-[#E5E5EA] dark:hover:bg-white/10 transition-all"
                >
                  {" "}
                  {cancelText}{" "}
                </button>{" "}
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-4 rounded-2xl font-bold uppercase text-[9px] tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${isDestructive ? "bg-red-500 shadow-red-500/20 hover:bg-red-600" : "bg-[#007AFF] shadow-[#007AFF]/20 hover:bg-[#0066D6]"}`}
                >
                  {" "}
                  {confirmText}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>
      )}{" "}
    </AnimatePresence>
  );
};
export default ConfirmModal;
