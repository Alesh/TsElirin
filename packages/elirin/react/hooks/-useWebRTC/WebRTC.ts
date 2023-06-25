/// WebRTC state
import { UseRPClient } from '@elirin/react';

export interface WebRTCState {
  lastError?: Error;
}

/// WebRTC methods
export interface WebRTCMethods {
  putStream(stream: MediaStream, streamId: string): Promise<void>;
}

type SetState = (value: WebRTCState) => void;
/// WebRTC interface implementation
export default class WebRTCImpl {
  static defaultState: WebRTCState = {};

  private readonly peer: RTCPeerConnection;

  private state: WebRTCState = WebRTCImpl.defaultState;
  private readonly setState: (value: Partial<WebRTCState>) => void;

  protected iceGathering: Promise<void>;
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

  constructor(private rpc: UseRPClient, setState: SetState) {
    // initialize members
    this.setState = (state) => {
      this.state = { ...this.state, ...state };
      setState(this.state);
    };
    // starts peer
    this.peer = new RTCPeerConnection();
    this.iceGathering = this.startICEGathering(60).catch((lastError) => setState({ lastError }));
  }

  /// Prepares peer for transmit stream to remote peer
  async putStream(stream: MediaStream, streamId: string): Promise<void> {
    console.log('@putStream', stream, streamId);
    stream.getTracks().map((track) => this.peer.addTrack(track));
    const sd = await this.peer.createOffer();
    await this.peer.setLocalDescription(sd);
    const answer = await this.rpc.call('put_stream', [streamId, this.peer.localDescription.toJSON()]);
    if (!answer) throw Error(`Cannot publish stream with id ${streamId}`);
    await this.peer.setRemoteDescription(<RTCSessionDescriptionInit>answer);
  }

  /// Closes peer
  close() {
    this.peer.close();
  }

  /// Invokes WebRTCMethods interface
  invokeInterfaceMethods(): WebRTCMethods {
    return {
      putStream: this.putStream.bind(this),
    };
  }
}
