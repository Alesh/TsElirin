import * as JsonRPC from './JsonRPC.ts';

/// WebRTC peer state interface
export interface State {
  connected: boolean;
}

/// Method provided Offer/Answer exchange
export type ExchangeOfferAnswer = (offer: RTCSessionDescription) => Promise<RTCSessionDescriptionInit>;

export type SetState = (value: ((prevState: State) => State) | State) => void;
export type Props = Partial<{ rtcConfiguration: RTCConfiguration; rtcTimeout: number }>;
/// WebRTC peer methods interface
export interface Methods {
  /// Tries to publish local stream
  publishStream(rpc: JsonRPC.Methods, key: string, src: MediaStream): Promise<boolean>;
  /// Cancels publish local stream
  unPublishStream(rpc: JsonRPC.Methods, key: string): Promise<void>;
}

/// WebRTC peer state/methods implementation
export class Impl implements Methods {
  private state: State = {} as never;
  private readonly setState: (state: Partial<State>) => void;
  private readonly timeout: number;
  private readonly peerConnection: RTCPeerConnection;

  private async createOffer(): Promise<RTCSessionDescription> {
    const sessionDescriptionInit = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(sessionDescriptionInit);
    if (!this.peerConnection.localDescription) throw new Error('Cannot set local RTC session description');
    return this.peerConnection.localDescription;
  }

  private async applyAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    // await this.iceGathered();
    await this.peerConnection.setRemoteDescription(answer);
  }

  public readonly createDataChannel: (label: string, dataChannelDict?: RTCDataChannelInit) => RTCDataChannel;

  constructor(setState: SetState, exchangeOfferAnswer: ExchangeOfferAnswer, { rtcConfiguration, rtcTimeout }: Props) {
    this.timeout = rtcTimeout ?? 300;
    this.peerConnection = new RTCPeerConnection(rtcConfiguration);
    this.createDataChannel = (...props) => this.peerConnection.createDataChannel(...props);
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
    /// First negotiation
    this.renegotiation(exchangeOfferAnswer).catch((err) => {
      this.setState({ connected: false });
      console.error('Fail first negotiation; see detail below');
      console.error(err);
    });
  }

  // Renegotiation
  renegotiation(exchangeOfferAnswer: ExchangeOfferAnswer): Promise<void> {
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias
    return new Promise(function (resolve, reject) {
      const timerId = setTimeout(() => reject(new Error('Renegotiation timeout error')), self.timeout * 1000);
      const onNegotiationNeeded = () => {
        clearTimeout(timerId);
        self.peerConnection.removeEventListener('negotiationneeded', onNegotiationNeeded);
        (async (exchangeOfferAnswer: ExchangeOfferAnswer) => {
          const offer = await self.createOffer();
          const answer = await exchangeOfferAnswer(offer);
          await self.applyAnswer(answer);
        })(exchangeOfferAnswer)
          .then(resolve)
          .catch(reject);
      };
      self.peerConnection.addEventListener('negotiationneeded', onNegotiationNeeded);
    });
  }

  private localStreams: Map<string, RTCRtpSender[]> = new Map();

  /// Tries to publish local stream
  async publishStream(rpc: JsonRPC.Methods, key: string, src: MediaStream): Promise<boolean> {
    const tracks = src.getTracks().map((track) => track.id);
    const senders = src.getTracks().map((track) => this.peerConnection.addTrack(track, src));
    this.localStreams.set(key, senders);
    try {
      await this.renegotiation(async (offer) => {
        return await rpc.call<RTCSessionDescription>('request_publishing', [offer, key, tracks]);
      });
      return true;
    } catch (err) {
      console.error(`Cannot publish stream with key:${key}; see detail below`);
      console.error(err);
      senders.forEach((sender) => this.peerConnection.removeTrack(sender));
    }
    return false;
  }

  /// Cancels publish local stream
  async unPublishStream(rpc: JsonRPC.Methods, key: string): Promise<void> {
    const senders = this.localStreams.get(key);
    if (senders) {
      this.localStreams.delete(key);
      senders.forEach((sender) => {
        sender.track?.stop();
        this.peerConnection.removeTrack(sender);
      });
      try {
        await this.renegotiation(async (offer) => {
          return await rpc.call<RTCSessionDescription>('cancel_publishing', [offer, key]);
        });
      } catch (err) {
        console.error(err); /* empty */
      }
    }
  }
}
