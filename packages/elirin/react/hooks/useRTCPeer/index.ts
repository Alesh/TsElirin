import { useMemo, useState } from 'react';
import { UseRPClient } from '@elirin/react';
import { RTCPeerMethods, RTCPeerState } from './interfaces.ts';
import RTCPeer from './RTCPeer.ts';

/// Web-RTC use peer interface
export interface UseRTCPeer extends RTCPeerState, RTCPeerMethods {}

/// Web-RTC use peer hook
export default function useRTCPeer(rpc: UseRPClient): UseRTCPeer {
  const [state, setState] = useState<RTCPeerState>(RTCPeer.defaultState);
  const rtcPeer = useMemo(() => new RTCPeer(setState, rpc), [setState]);
  return { ...state, ...rtcPeer.invokeInterfaceMethods() };
}
