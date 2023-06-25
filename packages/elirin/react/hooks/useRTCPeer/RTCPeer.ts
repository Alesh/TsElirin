/// Peer connection state
enum ConnectionState {
  Disconnected,
  Connecting,
  Connected,
}

/// Track description
export interface TrackDescription {
  id: string;
  kind: string;
}

/// Stream description
export interface StreamDescription {
  key: string;
  tracks: TrackDescription[];
}

/// Simple  Web-RTC peer
export default class RTCPeer {
  private peerConnection: RTCPeerConnection;
  private connectionState = ConnectionState.Disconnected;

  constructor(private configuration?: RTCConfiguration) {
    createConnection
  }
}
