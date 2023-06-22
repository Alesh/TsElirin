export enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export type WebSocketMessage = string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView;

export interface WebSocketState {
  readonly ready: boolean;
  lastError?: Event | Error;
  lastMessage?: WebSocketMessage;
}

export interface WebSocketMethods {
  sendMessage(message: WebSocketMessage): void;

  close(): void;
}

type SetWebSocketState = (value: WebSocketState) => void;
/// WebSocket implementation
export default class WebSocketImpl implements WebSocketMethods {
  private ws: WebSocket;
  private state: WebSocketState;
  private setState: (value: Partial<WebSocketState>) => void;
  private whenReady: Promise<void>;

  static DefaultState: WebSocketState = { ready: false };

  constructor(uri: string, setState: SetWebSocketState) {
    console.assert(uri.startsWith('/'));
    const url = `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}${uri}`;
    // initialize members
    this.state = WebSocketImpl.DefaultState;
    this.ws = new WebSocket(url);
    this.setState = (state) => {
      this.state = { ...this.state, ...state };
      setState(this.state);
    };
    let whenReadyResolve: (value?: PromiseLike<void> | void) => void;
    let whenReadyReject: (reason?: unknown) => void;
    this.whenReady = new Promise<void>((resolve, reject) => {
      whenReadyResolve = resolve;
      whenReadyReject = reject;
    });
    // initialize web socket
    const timeoutId = setTimeout(() => whenReadyReject(new Error('WebSocket cannot connect; timeout')), 300000);
    this.ws.onopen = () => {
      clearTimeout(timeoutId);
      whenReadyResolve();
      this.setState({ ready: true });
    };
    this.ws.onmessage = (ev) => this.setState({ lastMessage: ev.data, lastError: undefined });
    this.ws.onerror = (ev) => this.setState({ lastError: ev, lastMessage: undefined });
    this.ws.onclose = (ev) =>
      this.setState({
        ready: false,
        lastMessage: undefined,
        ...(ev.code == 1000 ? {} : { lastError: ev }),
      });
  }

  /// Sends message
  public sendMessage(message: WebSocketMessage) {
    if (this.ws.readyState == ReadyState.OPEN) {
      this.ws.send(message);
    } else if (this.ws.readyState == ReadyState.CONNECTING) this.whenReady.then(() => this.sendMessage(message));
    else this.setState({ lastError: new Error('WebSocket is not ready'), lastMessage: undefined });
  }

  /// Close
  public close() {
    this.setState({ ready: false, lastMessage: undefined, lastError: undefined });
    this.ws.close();
  }
}
