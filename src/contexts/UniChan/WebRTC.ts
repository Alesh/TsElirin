/// WebRTC peer state interface
export interface State {
  connected: boolean;
}

export type SetState = (value: ((prevState: State) => State) | State) => void;
export type Props = Partial<{ rtcConfiguration: RTCConfiguration; rtcTimeout: number }>;
/// WebRTC peer methods interface
export interface Methods {
  /// Starts connecting to the remote side
  startConnecting(): Promise<RTCSessionDescription>;
  /// Continue connecting to the remote side
  continueConnecting(answer: RTCSessionDescriptionInit): Promise<void>;
}

/// WebRTC peer state/methods implementation
export class Impl implements Methods {
  private state: State = {} as never;
  private readonly setState: (state: Partial<State>) => void;
  private readonly timeout: number;
  private readonly peerConnection: RTCPeerConnection;

  public readonly createDataChannel: (label: string, dataChannelDict?: RTCDataChannelInit) => RTCDataChannel;

  constructor(setState: SetState, { rtcConfiguration, rtcTimeout }: Props) {
    this.timeout = rtcTimeout ?? 300;
    this.peerConnection = new RTCPeerConnection(rtcConfiguration);
    this.createDataChannel = (...props) => this.peerConnection.createDataChannel(...props);
    this.peerConnection.addTransceiver('video', { direction: 'sendrecv' });
    this.peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
    this.setState = (partialState) => {
      this.state = { ...this.state, ...partialState };
      setState(this.state);
    };
    // Set initial state
    this.setState({ connected: false });
    // Connection state observer
    this.peerConnection.onconnectionstatechange = () => {
      const connectionState = this.peerConnection.connectionState;
      if (connectionState == 'connected') {
        this.setState({ connected: true });
      } else if (connectionState != 'new' && connectionState != 'connecting') this.setState({ connected: false });
    };
  }

  /// Starts connecting to the remote side
  async startConnecting(): Promise<RTCSessionDescription> {
    const sessionDescriptionInit = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(sessionDescriptionInit);
    if (!this.peerConnection.localDescription) throw new Error('Cannot set local RTC session description');
    return this.peerConnection.localDescription;
  }

  /// Continue connecting to the remote side
  async continueConnecting(answer: RTCSessionDescriptionInit): Promise<void> {
    const timeout = this.timeout;
    const peerConnection = this.peerConnection;
    await peerConnection.setRemoteDescription(answer);
    /// ICE gathering
    if (peerConnection.iceGatheringState !== 'complete') {
      await new Promise(function (resolve, reject) {
        const timerId = setTimeout(() => reject(new Error('ICE gathering timeout error')), timeout * 1000);
        const checkGatheringState = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            peerConnection.removeEventListener('icegatheringstatechange', checkGatheringState);
            clearTimeout(timerId);
            resolve(undefined);
          }
        };
        peerConnection.addEventListener('icegatheringstatechange', checkGatheringState);
      });
    }
  }
}
