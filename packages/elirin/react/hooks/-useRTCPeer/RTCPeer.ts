import * as assert from 'assert';

enum ConnectingState {
  Disconnected,
  Connecting,
  Connected,
  Transmitting,
  Receiving,
}

export interface RTCPeerState {
  connected: boolean;
  lastError?: Error;
  stream?: MediaStream;
}
export interface RTCPeerMethods {}

type SetRTCPeerState = (value: RTCPeerState) => void;
type RTCPeerOptions = { gatheringTimeout: number };

/// Web-RTC peer implementation
export default class RTCPeerImpl implements RTCPeerMethods {
  private peer: RTCPeerConnection;
  private connectingState = ConnectingState.Disconnected;
  private get connected(): boolean {
    return this.connectingState in [ConnectingState.Connected, ConnectingState.Transmitting, ConnectingState.Receiving];
  }

  static defaultOptions: RTCPeerOptions = { gatheringTimeout: 60 };
  private options: RTCPeerOptions;

  static defaultState: RTCPeerState = { connected: false };
  private state: RTCPeerState = RTCPeerImpl.defaultState;
  private readonly setState: (value: Partial<RTCPeerState>) => void;

  private startICEGathering(timeout: number) {
    const peer = this.peer;
    return new Promise(function (resolve, reject) {
      const timeoutId = setTimeout(() => reject(new Error(' ICE gathering timeout')), timeout * 1000);
      const checkState = () => {
        if (peer.iceGatheringState === 'complete') {
          peer.removeEventListener('icegatheringstatechange', checkState);
          timeoutId && clearTimeout(timeoutId);
          resolve();
        }
      };
      if (peer.iceGatheringState === 'complete') {
        timeoutId && clearTimeout(timeoutId);
        resolve();
      } else peer.addEventListener('icegatheringstatechange', checkState);
    });
  }

  constructor(setState: SetRTCPeerState, options?: Partial<RTCPeerOptions>) {
    // initialize members
    this.options = { ...RTCPeerImpl.defaultOptions, ...(options ?? {}) };
    this.setState = (state) => {
      this.state = { ...this.state, ...state, connected: this.connected };
      setState(this.state);
    };
    this.peer = new RTCPeerConnection();
  }

  protected async connect(): Promise<boolean> {
    if (!this.connected) {
      let lastError: Error;
      this.connectingState = ConnectingState.Connecting;
      try {
        await this.startICEGathering(this.options.gatheringTimeout);
        this.connectingState = ConnectingState.Connected;
      } catch (e) {
        lastError = e;
        this.connectingState = ConnectingState.Disconnected;
      } finally {
        if (lastError) this.close(lastError);
        else this.setState({});
      }
    }
    return this.connected;
  }

  /// Prepares the peer for stream transmission
  async prepareStreamTransmission(stream: MediaStream): Promise<any> {
    await this.close();
    if (await this.connect()) {
      let lastError: Error;
      try {
        stream.getTracks().forEach((track) => this.peer.addTrack(track, stream));
        const sd = await this.peer.createOffer();
        await this.peer.setLocalDescription(sd);
        this.connectingState = ConnectingState.Transmitting;
        return this.peer.localDescription.toJSON();
      } catch (e) {
        lastError = e;
        this.connectingState = ConnectingState.Disconnected;
      } finally {
        if (lastError) this.close(lastError);
        else this.setState({ stream });
      }
    }
  }

  /// Starts stream transmission
  async startStreamTransmission(answer: any): Promise<void> {
    if (this.connectingState == ConnectingState.Transmitting) {
      if (answer) await this.peer.setRemoteDescription(<RTCSessionDescriptionInit>answer);
      else this.close(new Error('Cannot get answer for start stream transmission'));
    } else throw new Error("Peer isn't in transmitting mode");
  }

  /// Closes peer connection
  close(lastError?: Error) {
    if (this.connected) {
      try {
        this.peer.close();
        this.peer = new RTCPeerConnection();
      } finally {
        this.connectingState = ConnectingState.Disconnected;
        this.setState({ ...RTCPeerImpl.defaultState, lastError });
      }
    }
  }

  /// Invokes RTCPeerMethods interface
  invokeInterfaceMethods(): RTCPeerMethods {
    return {};
  }
}
