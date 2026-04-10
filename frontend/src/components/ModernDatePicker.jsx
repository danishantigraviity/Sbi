import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ModernDatePicker = ({ value, onChange, label, minDate, maxDate, highlightData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  /* Close when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const min = minDate ? new Date(minDate) : null;
    const max = maxDate ? new Date(maxDate) : null;
    
    if (min) min.setHours(0, 0, 0, 0);
    if (max) max.setHours(23, 59, 59, 999);
    
    if (min && selectedDate < min) return;
    if (max && selectedDate > max) return;
    
    onChange(selectedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const prevMonthDays = daysInMonth(year, month - 1);
    const days = [];
    
    const minDateValue = minDate ? new Date(minDate) : null;
    if (minDateValue) minDateValue.setHours(0, 0, 0, 0);
    const maxDateValue = maxDate ? new Date(maxDate) : null;
    if (maxDateValue) maxDateValue.setHours(23, 59, 59, 999);

    /* Previous month padding */
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="h-10 w-10 flex items-center justify-center text-sub/30 text-xs font-medium">
          {prevMonthDays - i}
        </div>
      );
    }

    /* Current month days */
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const isSelected = value && new Date(value).toDateString() === dateObj.toDateString();
      const isToday = new Date().toDateString() === dateObj.toDateString();
      const isDisabled = (minDateValue && dateObj < minDateValue) || (maxDateValue && dateObj > maxDateValue);
      
      const dateStr = dateObj.toISOString().split('T')[0];
      const status = highlightData?.[dateStr];

      days.push(
        <button
          key={d}
          type="button"
          onClick={() => !isDisabled && handleDateClick(d)}
          disabled={isDisabled}
          className={`h-10 w-10 rounded-xl text-xs font-bold transition-all relative group flex items-center justify-center ${
            isSelected 
              ? 'bg-[#005DAB] dark:bg-[#007AFF] text-white shadow-lg shadow-[#005DAB]/30' 
              : status === 'present'
                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20'
                : status === 'absent'
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20'
                  : isDisabled 
                    ? 'text-sub/20 dark:text-white/10 cursor-not-allowed' 
                    : 'text-lead dark:text-[#E5E7EB] hover:bg-[#F2F2F7] dark:hover:bg-white/5'
          } `}
        >
          {d}
          {isToday && !isSelected && (
            <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isDisabled ? 'bg-sub/30' : 'bg-[#005DAB] dark:bg-[#5AC8FA]'}`} />
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/60 uppercase ml-1 tracking-widest mb-2 block">
          {label}
        </label>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full px-5 py-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#0B1120] border-2 cursor-pointer flex items-center justify-between transition-all ${
          isOpen 
            ? 'border-[#005DAB] dark:border-[#5AC8FA] ring-4 ring-[#005DAB]/5' 
            : 'border-transparent hover:bg-[#E5E5EA] dark:hover:bg-white/5'
        } `}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className={`w-4 h-4 ${isOpen ? 'text-[#005DAB] dark:text-[#5AC8FA]' : 'text-sub dark:text-[#E5E7EB]/40'}`} />
          <span className={`text-sm font-bold ${value ? 'text-lead dark:text-[#E5E7EB]' : 'text-sub dark:text-[#E5E7EB]/40'}`}>
            {value ? new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select Date'}
          </span>
        </div>
        {value && isOpen && (
          <X className="w-4 h-4 text-sub hover:text-[#005DAB]" onClick={(e) => { e.stopPropagation(); onChange(''); }} />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] top-full left-0 mt-2 bg-white dark:bg-[#111827] rounded-[2rem] shadow-2xl border border-[#E5E5EA] dark:border-white/10 p-6 w-[340px] origin-top-left"
          >
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-[#F2F2F7] rounded-xl text-sub transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h4 className="text-sm font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest">
                  {months[currentDate.getMonth()]}
                </h4>
                <p className="text-[10px] font-bold text-sub dark:text-[#E5E7EB]/40 tracking-widest leading-none">
                  {currentDate.getFullYear()}
                </p>
              </div>
              <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-[#F2F2F7] rounded-xl text-sub transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="h-10 w-10 flex items-center justify-center text-[10px] font-bold text-sub uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E5EA] dark:border-white/10 flex items-center justify-between">
              <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} className="text-[10px] font-bold text-[#005DAB] dark:text-[#5AC8FA] uppercase tracking-widest hover:opacity-70">
                Clear
              </button>
              <button type="button" onClick={() => { handleDateClick(new Date().getDate()); setCurrentDate(new Date()); }} className="text-[10px] font-bold text-lead dark:text-[#E5E7EB] uppercase tracking-widest hover:opacity-70">
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDatePicker;
