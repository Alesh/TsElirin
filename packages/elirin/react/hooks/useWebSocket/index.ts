import { useMemo, useState } from 'react';
import WebSocket, { ReadyState, WebSocketState, WebSocketMessage } from './WebSocket.ts';

export interface UseWebSocket extends WebSocketState {
  readonly ready: boolean;
  sendMessage(message: WebSocketMessage): void;
  close(): void;
}

/// WebSocket hook
export default function useWebSocket(uri = '/ws'): UseWebSocket {
  const [state, setState] = useState<WebSocketState>({} as never);
  const webSocket = useMemo(() => new WebSocket(uri, setState), [uri]);
  return {
    ...state,
    ready: state.readyState == ReadyState.OPEN,
    sendMessage: webSocket.sendMessage.bind(webSocket),
    close: webSocket.close.bind(webSocket),
  };
}
