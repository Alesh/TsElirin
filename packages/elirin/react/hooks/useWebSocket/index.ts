import { useMemo, useState } from 'react';
import WebSocket, { WebSocketState, WebSocketMethods } from './WebSocket.ts';

export interface UseWebSocket extends WebSocketState, WebSocketMethods {}

/// WebSocket hook
export default function useWebSocket(uri = '/ws'): UseWebSocket {
  const [state, setState] = useState<WebSocketState>(WebSocket.DefaultState);
  const webSocket = useMemo(() => new WebSocket(uri, setState), [uri]);
  return { ...state, sendMessage: webSocket.sendMessage.bind(webSocket), close: webSocket.close.bind(webSocket) };
}
