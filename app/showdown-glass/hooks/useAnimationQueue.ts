'use client';

import { useState, useCallback, useRef } from 'react';

interface AnimationTask {
  id: string;
  action: () => Promise<void>;
  duration: number;
}

export function useAnimationQueue() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queueRef = useRef<AnimationTask[]>([]);

  const addToQueue = useCallback((task: AnimationTask) => {
    queueRef.current.push(task);
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || queueRef.current.length === 0) return;

    setIsProcessing(true);

    while (queueRef.current.length > 0) {
      const task = queueRef.current.shift();
      if (task) {
        try {
          await task.action();
          await new Promise(resolve => setTimeout(resolve, task.duration));
        } catch (error) {
          console.error(`Animation task ${task.id} failed:`, error);
        }
      }
    }

    setIsProcessing(false);
  }, [isProcessing]);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setIsProcessing(false);
  }, []);

  return {
    addToQueue,
    processQueue,
    clearQueue,
    isProcessing,
    queueLength: queueRef.current.length
  };
}