import * as WebRTC from './WebRTC.ts';
import * as JsonRPC from './JsonRPC.ts';

export interface State extends WebRTC.State {
  remoteStreams: Record<string, MediaStream>;
}

export interface Methods {
  /// RPC interface
  rpc: JsonRPC.Methods;
  /// Tries to publish local stream
  publishStream(key: string, src: MediaStream): Promise<boolean>;
  /// Cancels publish local stream
  unPublishStream(key: string): Promise<void>;
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

  constructor(setState: SetState, { entryURI = '/unichan', rpcTimeout = 180, ...rtcProps }: Props) {
    this.setState = (partialState) => {
      this.state = { ...this.state, ...partialState };
      setState(this.state);
    };
    this.webrtc = new WebRTC.Impl(this.setState as WebRTC.SetState, async (offer) => exchangeOfferAnswer(entryURI, offer), rtcProps);
    this.jsonrpc = new JsonRPC.Impl(new JsonRPC.DataChannelTransport(this.webrtc.createDataChannel('RPC')), rpcTimeout);
    // Set initial state
    this.setState({ remoteStreams: {} });
  }

  /// RPC interface
  get rpc(): JsonRPC.Methods {
    return {
      call: (...args) => this.jsonrpc.call(...args),
    };
  }

  /// Tries to publish local stream
  async publishStream(key: string, src: MediaStream): Promise<boolean> {
    return await this.webrtc.publishStream(this.rpc, key, src);
  }

  /// Cancels publish local stream
  async unPublishStream(key: string): Promise<void> {
    await this.webrtc.unPublishStream(this.rpc, key);
  }
}
