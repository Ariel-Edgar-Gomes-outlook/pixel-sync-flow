// Web Audio API para criar sons personalizados de notificação

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export type NotificationSoundType = 'urgent' | 'important' | 'info' | 'success';

// Configurações de som para cada tipo de notificação
const soundConfigs: Record<NotificationSoundType, { frequencies: number[]; durations: number[] }> = {
  urgent: {
    // Som de alerta urgente - tom alto e rápido
    frequencies: [880, 1047, 880, 1047],
    durations: [0.1, 0.1, 0.1, 0.2],
  },
  important: {
    // Som importante - dois tons médios
    frequencies: [523, 659],
    durations: [0.15, 0.25],
  },
  info: {
    // Som de informação - tom suave ascendente
    frequencies: [440, 554],
    durations: [0.1, 0.2],
  },
  success: {
    // Som de sucesso - três tons ascendentes
    frequencies: [523, 659, 784],
    durations: [0.1, 0.1, 0.2],
  },
};

// Mapear tipos de notificação para tipos de som
export const notificationTypeToSound: Record<string, NotificationSoundType> = {
  payment_overdue: 'urgent',
  invoice_overdue: 'urgent',
  contract_pending: 'important',
  maintenance_due: 'important',
  job_reminder: 'info',
  lead_follow_up: 'info',
  new_lead: 'info',
  job_completed: 'success',
  contract_signed: 'success',
  delivery_ready: 'success',
  quote_sent: 'info',
};

export function playNotificationSound(type: NotificationSoundType, volume: number = 0.3) {
  if (!audioContext) return;

  try {
    const config = soundConfigs[type];
    let currentTime = audioContext.currentTime;

    config.frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Envelope para som mais suave
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + config.durations[index]);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + config.durations[index]);

      currentTime += config.durations[index] + 0.05; // Pequena pausa entre tons
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

export function getNotificationSoundType(notificationType: string): NotificationSoundType {
  return notificationTypeToSound[notificationType] || 'info';
}

// Função para testar um som
export function testNotificationSound(type: NotificationSoundType) {
  playNotificationSound(type, 0.4);
}
