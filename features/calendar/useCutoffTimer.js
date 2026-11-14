'use client';

// custom hook: useCutoffTimer
// INT252 Requirement: useEffect with real setInterval cleanup calculating remaining time to 10:00 PM IST cutoff
import { useState, useEffect } from 'react';

export function useCutoffTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
    text: '',
  });

  useEffect(() => {
    function calculateCutoff() {
      const now = new Date();
      // 10:00 PM today
      const cutoff = new Date(now);
      cutoff.setHours(22, 0, 0, 0);

      let diff = cutoff.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPassed: true,
          text: 'Order cutoff passed for tomorrow morning (10:00 PM IST).',
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);
      const seconds = Math.floor(diff / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isPassed: false,
        text: `${hours}h ${minutes}m ${seconds}s until tonight's 10:00 PM cutoff`,
      });
    }

    calculateCutoff();
    const intervalId = setInterval(calculateCutoff, 1000);

    // real cleanup function to prevent memory leaks
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return timeLeft;
}
