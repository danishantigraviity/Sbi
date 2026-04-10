import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, User } from "lucide-react";

/**
 * CustomSelect - A premium dropdown component
 * @param {Object} props
 * @param {Array} props.options - [{ label: string, value: string }]
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Selection handler
 * @param {string} props.placeholder - Displayed when no value selected
 * @param {string} props.label - Optional label above select
 * @param {React.ElementType} props.icon - Optional icon for the trigger
 */
const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  label,
  icon: Icon = User,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase ml-1 tracking-widest block mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-3 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 transition-all flex items-center justify-between group ${
          isOpen
            ? "border-[#005DAB] dark:border-[#5AC8FA] shadow-2xl shadow-[#005DAB]/10 ring-4 ring-[#005DAB]/5 scale-[1.02]"
            : "border-transparent hover:bg-[#E5E5EA] dark:hover:bg-white/5"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              isOpen
                ? "bg-[#005DAB] text-white"
                : "bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-[#E5E7EB]/40 group-hover:bg-gray-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span
            className={`font-bold text-sm tracking-tight ${
              selectedOption
                ? "text-lead dark:text-[#E5E7EB]"
                : "text-sub dark:text-[#E5E7EB]/40"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-sub transition-all duration-300 ${
            isOpen ? "rotate-180 text-[#005DAB] dark:text-[#5AC8FA]" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="absolute z-[100] left-0 right-0 mt-2 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-[2.5rem] border border-[#E5E5EA] dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {options.length > 0 ? (
                  options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-5 py-3.5 rounded-2xl flex items-center justify-between transition-all group ${
                        value === option.value
                          ? "bg-[#005DAB] dark:bg-[#007AFF] text-white shadow-xl shadow-[#005DAB]/20"
                          : "hover:bg-[#F2F2F7] dark:hover:bg-white/5 text-lead dark:text-[#E5E7EB] hover:pl-6"
                      }`}
                    >
                      <span className="font-bold text-sm tracking-tight">
                        {option.label}
                      </span>
                      {value === option.value && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm ring-2 ring-white/20" />
                        </motion.div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-xs font-bold text-sub uppercase tracking-widest opacity-40">
                    No matching sectors
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
