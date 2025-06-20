import { useEffect, useRef, useState } from "react";
import { READY_TIMEOUT } from "../consts";

interface UseReadyTimerProps {
  roomId: string;
  shouldStartTimer?: boolean;
  onTimeExpired?: () => void;
}

export const useReadyTimer = ({
  shouldStartTimer = false,
  onTimeExpired,
}: UseReadyTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(READY_TIMEOUT);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    console.log("Starting ready timer for", READY_TIMEOUT, "seconds");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeLeft(READY_TIMEOUT);
    setIsActive(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        console.log(`Ready timer: ${newTime} seconds left`);
        if (newTime <= 0) {
          console.log("Ready timer expired, calling onTimeExpired");
          setIsActive(false);
          onTimeExpired?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    console.log("Stopping ready timer");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    setTimeLeft(READY_TIMEOUT);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(READY_TIMEOUT);
  };

  useEffect(() => {
    console.log(
      "useReadyTimer effect:",
      shouldStartTimer,
      "isActive:",
      isActive,
      "timestamp:",
      new Date().toISOString()
    );
    if (shouldStartTimer && !isActive) {
      console.log(
        "🟢 Starting timer because shouldStart=true and isActive=false"
      );
      startTimer();
    } else if (!shouldStartTimer && isActive) {
      console.log(
        "🔴 Stopping timer because shouldStart=false and isActive=true"
      );
      stopTimer();
    } else {
      console.log("⚪ No timer action needed");
    }
  }, [shouldStartTimer, isActive]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isActive,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
