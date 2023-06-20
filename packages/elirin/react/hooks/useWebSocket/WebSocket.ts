export enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export type WebSocketMessage = string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView;

export interface WebSocketState {
  readyState: ReadyState;
  lastError?: Event | Error;
  lastMessage?: WebSocketMessage;
}

type SetWebSocketState = (value: WebSocketState) => void;
// WebSocket implementation
export default class WebSocketImpl {
  private ws: WebSocket;
  private state: WebSocketState = { readyState: ReadyState.UNINSTANTIATED };
  private setState: (value: Partial<WebSocketState>) => void;
  private whenReady: Promise<void>;

  constructor(uri: string, setState: SetWebSocketState) {
    console.assert(uri.startsWith('/'));
    const url = `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}${uri}`;
    // initialize members
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
      this.setState({ readyState: ReadyState.OPEN });
    };
    this.ws.onmessage = (ev) => this.setState({ lastMessage: ev.data, lastError: undefined });
    this.ws.onerror = (ev) => this.setState({ lastError: ev });
    this.ws.onclose = (ev) =>
      this.setState({
        readyState: ReadyState.CLOSED,
        ...(ev.code == 1000 ? {} : { lastError: ev }),
      });
    this.setState({ readyState: ReadyState.CONNECTING });
  }

  /// Sends message
  public sendMessage(message: WebSocketMessage) {
    if (this.state.readyState == ReadyState.OPEN) {
      this.ws.send(message);
    } else if (this.state.readyState == ReadyState.CONNECTING) this.whenReady.then(() => this.sendMessage(message));
    else this.setState({ lastError: new Error('WebSocket is not ready') });
  }

  /// Close
  public close() {
    this.setState({ readyState: ReadyState.CLOSING });
    this.ws.close();
  }
}
