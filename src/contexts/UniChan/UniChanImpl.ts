import { Methods, SetState, State } from './interface.ts';

export type UniChanProps = Partial<{
  entryURI: string;
  reconnectAt: number;
  rtcConfiguration: RTCConfiguration;
}>;
/// UniChan implementation
export default class UniChanImpl implements Methods {
  private state: State = {} as never;
  private readonly setState: (state: Partial<State>) => void;

  private peerConnection: RTCPeerConnection;
  private rpc_data_channel: RTCDataChannel;
  // Sends offer to remote the side
  private static async sendCallOffer(uri: string, offer: RTCSessionDescription): Promise<RTCSessionDescriptionInit> {
    const resp = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offer.toJSON()),
    });
    if (resp.ok) {
      return await resp.json();
    } else throw new Error('Cannot get answer from remote side');
  }
  // ICE gathering
  private static async iceGathering(peerConnection: RTCPeerConnection): Promise<void> {
    if (peerConnection.iceGatheringState !== 'complete') {
      await new Promise(function (resolve) {
        const checkGatheringState = () => {
          if (peerConnection.iceGatheringState === 'complete') {
            peerConnection.removeEventListener('icegatheringstatechange', checkGatheringState);
            resolve(undefined);
          }
        };
        peerConnection.addEventListener('icegatheringstatechange', checkGatheringState);
      });
    }
  }
  // Establishes connects to remote side
  private async establishConnection(uri: string): Promise<void> {
    this.peerConnection.addTransceiver('video', { direction: 'sendrecv' });
    this.peerConnection.addTransceiver('audio', { direction: 'sendrecv' });
    // offer/answer exchange
    const sessionDescriptionInit = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(sessionDescriptionInit);
    if (!this.peerConnection.localDescription) throw new Error('Cannot set local RTC session description');
    const answer = await UniChanImpl.sendCallOffer(uri, this.peerConnection.localDescription);
    await this.peerConnection.setRemoteDescription(answer);
    // await connection complete
    await UniChanImpl.iceGathering(this.peerConnection);
  }

  constructor(setState: SetState, { entryURI = '/unichan', reconnectAt = 5, rtcConfiguration }: UniChanProps = {}) {
    this.peerConnection = new RTCPeerConnection(rtcConfiguration);
    this.rpc_data_channel = this.peerConnection.createDataChannel('RPC');
    this.setState = (partialState) => {
      this.state = { ...this.state, ...partialState };
      setState(this.state);
    };
    // Set initial state
    this.setState({ ready: false });
    // Connect to remote side
    this.establishConnection(entryURI).catch((err) => {
      console.error(err);
      const timerId = setInterval(() => {
        this.establishConnection(entryURI)
          .then(() => clearInterval(timerId))
          .catch(console.error);
      }, reconnectAt * 1000);
    });
    //
    this.peerConnection.onconnectionstatechange = () => {
      const connectionState = this.peerConnection.connectionState;
      if (connectionState == 'connected') {
        this.setState({ ready: true });
      } else if (connectionState != 'new' && connectionState != 'connecting') this.setState({ ready: false });
    };
    //
    this.rpc_data_channel.onopen = () => this.rpc_data_channel.send('PING!');
    this.rpc_data_channel.onmessage = (ev) => {
      if (ev.data === 'PING!') this.rpc_data_channel.send('PONG!');
      else console.log('>>', ev.data);
    };
  }

  call<T>(method: string, params?: unknown): Promise<T> {
    console.log('!UniChanImpl.call', method, params);
    throw new Error('Not yet implemented');
  }
}
