import { ConnectionState, RTCPeerMethods, RTCPeerState, StreamDescription } from './interfaces.ts';
import { UseRPClient } from '@elirin/react';

type SetRTCPeerState = (value: RTCPeerState) => void;

/// Web-RTC peer implementation
export default class RTCPeerImpl {
  private peer: RTCPeerConnection;

  private createRTCPeerConnection() {
    const peer = new RTCPeerConnection(this.configuration);
    peer.addEventListener('track', this.onTrackListener);
    return peer;
  }

  private tracks = new Set<MediaStreamTrack>();
  private onTrackListener(event: RTCPeerConnectionEventMap['track']) {
    this.tracks.add(event.track);
  }

  static defaultState: RTCPeerState = { connectionState: ConnectionState.Disconnected, lastError: undefined, stream: undefined };
  private state: RTCPeerState = RTCPeerImpl.defaultState;
  private readonly setState: (value: Partial<RTCPeerState>) => void;

  private async connect(): Promise<boolean> {
    try {
      this.setState({ connectionState: ConnectionState.Connecting });
      throw new Error('Not yet implemented!');
      this.setState({ connectionState: ConnectionState.Connected });
    } catch (lastError) {
      this.close(lastError);
    }
    return this.state.connectionState == ConnectionState.Connected;
  }

  constructor(setState: SetRTCPeerState, private rpc: UseRPClient, private configuration?: RTCConfiguration) {
    // initialize members
    this.setState = (state) => {
      this.state = { ...this.state, ...state };
      setState(this.state);
    };
    this.configuration = configuration;
    this.peer = this.createRTCPeerConnection();
  }

  /// Receives a stream from the remote peer
  protected async receiveStream(key: string): Promise<MediaStream> {
    if (await this.connect()) {
      try {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        const response = this.rpc.call('receive_stream', [this.peer.localDescription.toJSON()]);
        if (!response) throw Error(`Cannot receive from remote stream with key ${key}`);
        const { streamDesc, answer } = response;
        await this.peer.setRemoteDescription(<RTCSessionDescriptionInit>answer);
        ///
      } catch (lastError) {
        this.close(lastError);
        throw lastError;
      }
    } else throw this.state.lastError;
  }

  /// Transmits a stream to the remote peer
  protected async transmitStream(key: string, stream: MediaStream): Promise<void> {
    console.assert(stream.active, "Stream isn't active");
    if (await this.connect()) {
      try {
        const streamDesc: StreamDescription = { key, tracks: [] };
        stream.getTracks().forEach((track) => {
          streamDesc.tracks.push({ id: track.id, kind: track.kind });
          this.peer.addTrack(track);
        });
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        const answer = this.rpc.call('transmit_stream', [this.peer.localDescription.toJSON(), JSON.stringify(streamDesc)]);
        if (!answer) throw Error(`Cannot transmit to remote stream with key ${key}`);
        await this.peer.setRemoteDescription(<RTCSessionDescriptionInit>answer);
      } catch (lastError) {
        this.close(lastError);
        throw lastError;
      }
    } else throw this.state.lastError;
  }

  /// Closes peer connection
  protected close(lastError?: Error) {
    if (this.state.connectionState != ConnectionState.Disconnected) {
      this.peer.removeEventListener('track', this.onTrackListener);
      this.tracks.forEach((track) => track.stop());
      this.tracks.clear();
      this.peer.close();
      this.peer = this.createRTCPeerConnection();
      this.setState({ ...RTCPeerImpl.defaultState, lastError });
    }
  }

  invokeInterfaceMethods(): RTCPeerMethods {
    return {
      close: () => this.close(),
      receiveStream: (id: string) => this.receiveStream(id).then().catch(console.log),
      transmitStream: (id: string, stream: MediaStream) => this.transmitStream(id, stream).then().catch(console.log),
    };
  }
}
