import { useMemo, useState } from 'react';
import WebRTC, { WebRTCMethods, WebRTCState } from './WebRTC.ts';
import { UseRPClient } from '@elirin/react';

/// WebRTC use interface
export interface UseWebRTC extends WebRTCState, WebRTCMethods {}

/// WebRTC hook
export default function useWebRTC(rpc: UseRPClient): UseWebRTC {
  const [state, setState] = useState<WebRTCState>(WebRTC.defaultState);
  const webRTC = useMemo(() => new WebRTC(rpc, setState), [setState]);
  return { ...state, ...webRTC.invokeInterfaceMethods() };
}
