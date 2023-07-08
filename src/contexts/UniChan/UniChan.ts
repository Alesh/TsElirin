import * as JsonRPC2 from './JsonRPC.ts';
import * as WebRTC from './WebRTC.ts';
import * as JsonRPC from '@/contexts/UniChan/JsonRPC.ts';

export interface State extends WebRTC.State {
  remoteStreams: Record<string, MediaStream>;
}

export interface Methods {
  rpc: JsonRPC2.Methods;
}

/// Sends offer to remote the side and awaits answer
async function exchangeOfferAnswer(uri: string, offer: RTCSessionDescription): Promise<RTCSessionDescriptionInit> {
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

export type SetState = (value: ((prevState: State) => State) | State) => void;
export type Props = Partial<{ entryURI: string; rpcTimeout: number }> & WebRTC.Props;
/// UniChan peer state/methods implementation
export class Impl implements Methods {
  private state: State = {} as never;
  private readonly setState: (state: Partial<State>) => void;
  private webrtc: WebRTC.Impl;
  private jsonrpc: JsonRPC.Impl;

  // Establishes connects to the remote side
  private async establishConnection(entryURI = '/unichan') {
    const offer = await this.webrtc.startConnecting();
    const answer = await exchangeOfferAnswer(entryURI, offer);
    await this.webrtc.continueConnecting(answer);
  }

  constructor(setState: SetState, { entryURI, rpcTimeout = 180, ...rtcProps }: Props) {
    this.setState = (partialState) => {
      this.state = { ...this.state, ...partialState };
      setState(this.state);
    };
    this.webrtc = new WebRTC.Impl(this.setState as WebRTC.SetState, rtcProps);
    this.jsonrpc = new JsonRPC.Impl(new JsonRPC.DataChannelTransport(this.webrtc.createDataChannel('RPC')), rpcTimeout);
    // Set initial state
    this.setState({ remoteStreams: {} });
    // Starts connecting
    this.establishConnection(entryURI).catch((err) => {
      console.error(err);
      const timerId = setInterval(() => {
        this.establishConnection(entryURI)
          .then(() => clearInterval(timerId))
          .catch(console.error);
      }, rpcTimeout * 1000);
    });
  }

  /// RPC interface
  get rpc(): JsonRPC.Methods {
    return this.jsonrpc;
  }
}
