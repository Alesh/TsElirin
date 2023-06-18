import { createPrcClient, RpcClient } from '@/api/wsrpc.ts';

/// RTC Peer interface
export interface RtcChannel {
  getStream(): Promise<MediaStream>;
  close();
}

/// Creates new RtcChannel object
export function createRtcChannel(channelId: string): RtcChannel {
  return new RtcChannelImpl(channelId);
}

// RTC Peer implementation
class RtcChannelImpl implements RtcChannel {
  private readonly rpc: RpcClient;
  private readonly peer: RTCPeerConnection;
  private readonly mediaStream: MediaStream;

  private mediaStreamConnectedResolve: (value: PromiseLike<boolean> | boolean) => void;
  private mediaStreamConnected = new Promise<boolean>((resolve) => {
    this.mediaStreamConnectedResolve = resolve;
  });

  private async mediaStreamConnect(timeout: number): Promise<void> {
    const timeoutId = 0;
    await Promise.race([
      this.mediaStreamConnected,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Channel established timeout')), timeout * 1000);
      }),
    ]);
    clearTimeout(timeoutId);
  }

  private addTrack(evt: RTCTrackEvent) {
    this.mediaStream.addTrack(evt.track);
    this.mediaStreamConnectedResolve(true);
  }

  private iceGathering(timeout: number) {
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

  constructor(public channelId: string) {
    this.rpc = createPrcClient();
    this.peer = new RTCPeerConnection();
    this.mediaStream = new MediaStream();
    this.peer.addTransceiver('video', { direction: 'recvonly' });
    this.peer.addTransceiver('audio', { direction: 'recvonly' });
    this.peer.addEventListener('track', this.addTrack.bind(this));
  }

  async getStream(): Promise<MediaStream> {
    const sd = await this.peer.createOffer();
    await this.peer.setLocalDescription(sd);
    await this.iceGathering(60);
    const answer = await this.rpc.call('get_stream_answer', [this.channelId, this.peer.localDescription.toJSON()]);
    if (!answer) {
      throw Error(`RPC channel with id ${this.channelId} not found`);
    }
    await this.peer.setRemoteDescription(<RTCSessionDescriptionInit>answer);
    await this.mediaStreamConnect(60);
    return this.mediaStream;
  }

  close() {
    this.peer.close();
  }
}
