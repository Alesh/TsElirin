import { useMemo, useState } from 'react';
import RTCPeer, { RTCPeerMethods, RTCPeerState } from './RTCPeer.ts';

/// Web-RTC use peer interface
export interface UseRTCPeer extends RTCPeerState, RTCPeerMethods {}

/// Web-RTC use peer hook
export default function useRTCPeer(): UseRTCPeer {
  const [state, setState] = useState<RTCPeerState>(RTCPeer.defaultState);
  const rtcPeer = useMemo(() => new RTCPeer(setState), [setState]);
  return { ...state, ...rtcPeer.invokeInterfaceMethods() };
}
