import { useEffect, useState } from 'react';
import { ConstantBackoff, Websocket, WebsocketBuilder } from 'websocket-ts';

type WebSocketMessage = string | ArrayBufferLike | Blob | ArrayBufferView;

/// Web socket use interface
export interface UseWebSocket {
  readonly ready: boolean;
  lastError?: Event | Error;
  lastMessage?: WebSocketMessage;
  sendMessage(message: WebSocketMessage): void;
}

/// Hook help to use web socket
export default function useWebSocket(uri: string, reconnect_at = 3): UseWebSocket {
  const [webSocket, setWebSocket] = useState<Websocket>();
  const [state, setState] = useState<{ lastError?: Event | Error; lastMessage?: WebSocketMessage }>({});
  useEffect(() => {
    const url = `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}${uri}`;
    new WebsocketBuilder(url)
      .withBackoff(new ConstantBackoff(reconnect_at * 1000))
      .onOpen((webSocket) => setWebSocket(webSocket))
      .onMessage((_, ev) => setState({ lastMessage: ev.data }))
      .onError((_, ev) => setState({ lastError: ev }))
      .onClose((_, ev) =>
        setWebSocket(() => {
          setState(ev.code == 1000 ? {} : { lastError: ev });
          return undefined;
        })
      )
      .build();
  }, [reconnect_at, uri]);
  /// Sends message to server side
  function sendMessage(message: WebSocketMessage) {
    setWebSocket((webSocket) => {
      if (webSocket) {
        webSocket.send(message);
      } else setState({ lastError: new Error('Cannot send message, web socket is not ready') });
      return webSocket;
    });
  }
  return { ready: typeof webSocket !== 'undefined', ...state, sendMessage };
}
