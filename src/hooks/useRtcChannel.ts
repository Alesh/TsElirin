import { useMemo } from 'react';
import { RtcChannel, createRtcChannel } from '@/api';

/// RTC Channel hook
export default function useRtcChannel(channelId: string): RtcChannel {
  return useMemo(() => new createRtcChannel(channelId), [channelId]);
}
