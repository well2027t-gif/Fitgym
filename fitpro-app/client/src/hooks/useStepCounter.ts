/**
 * FitPro — useStepCounter
 * Detecta passos em tempo real usando o acelerômetro do dispositivo (DeviceMotionEvent).
 * Algoritmo: threshold de aceleração + debounce para evitar dupla contagem.
 */
import { useEffect, useRef, useCallback, useState } from 'react';

// Configurações do detector de passos
const STEP_THRESHOLD = 12;    // m/s² — aceleração mínima para contar um passo
const STEP_DEBOUNCE_MS = 350; // ms — tempo mínimo entre dois passos consecutivos

export interface StepCounterState {
  isTracking: boolean;
  sessionSteps: number;       // passos contados nesta sessão
  permissionGranted: boolean | null; // null = não solicitado ainda
  error: string | null;
}

export interface UseStepCounterReturn extends StepCounterState {
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  resetSession: () => void;
}

export function useStepCounter(
  onStep?: (totalSessionSteps: number) => void
): UseStepCounterReturn {
  const [state, setState] = useState<StepCounterState>({
    isTracking: false,
    sessionSteps: 0,
    permissionGranted: null,
    error: null,
  });

  const lastStepTimeRef = useRef<number>(0);
  const isAboveThresholdRef = useRef<boolean>(false);
  const sessionStepsRef = useRef<number>(0);
  const listenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    const now = Date.now();

    // Detecta cruzamento do threshold (subida → descida)
    if (magnitude > STEP_THRESHOLD && !isAboveThresholdRef.current) {
      isAboveThresholdRef.current = true;
    } else if (magnitude <= STEP_THRESHOLD && isAboveThresholdRef.current) {
      isAboveThresholdRef.current = false;

      // Verifica debounce
      if (now - lastStepTimeRef.current >= STEP_DEBOUNCE_MS) {
        lastStepTimeRef.current = now;
        sessionStepsRef.current += 1;
        const total = sessionStepsRef.current;

        setState(s => ({ ...s, sessionSteps: total }));
        onStep?.(total);
      }
    }
  }, [onStep]);

  const startTracking = useCallback(async () => {
    setState(s => ({ ...s, error: null }));

    // iOS 13+ requer permissão explícita para DeviceMotionEvent
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission !== 'granted') {
          setState(s => ({
            ...s,
            permissionGranted: false,
            error: 'Permissão para o sensor de movimento negada. Ative nas configurações do dispositivo.',
          }));
          return;
        }
        setState(s => ({ ...s, permissionGranted: true }));
      } catch {
        setState(s => ({
          ...s,
          permissionGranted: false,
          error: 'Não foi possível solicitar permissão para o sensor de movimento.',
        }));
        return;
      }
    } else if (typeof DeviceMotionEvent === 'undefined') {
      setState(s => ({
        ...s,
        permissionGranted: false,
        error: 'Sensor de movimento não disponível neste dispositivo ou navegador.',
      }));
      return;
    } else {
      setState(s => ({ ...s, permissionGranted: true }));
    }

    // Remove listener anterior se existir
    if (listenerRef.current) {
      window.removeEventListener('devicemotion', listenerRef.current);
    }

    listenerRef.current = handleMotion;
    window.addEventListener('devicemotion', handleMotion, { passive: true });
    setState(s => ({ ...s, isTracking: true }));
  }, [handleMotion]);

  const stopTracking = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener('devicemotion', listenerRef.current);
      listenerRef.current = null;
    }
    setState(s => ({ ...s, isTracking: false }));
  }, []);

  const resetSession = useCallback(() => {
    sessionStepsRef.current = 0;
    setState(s => ({ ...s, sessionSteps: 0 }));
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('devicemotion', listenerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    resetSession,
  };
}
