export enum ConnectionState {
  Disconnected,
  Connecting,
  Connected,
}

/// Web-RTC peer state interface
export interface RTCPeerState {
  connectionState: ConnectionState;
  lastError?: Error;
  stream?: MediaStream;
}

/// Web-RTC peer methods interface
export interface RTCPeerMethods {
  receiveStream(id: string): void;
  transmitStream(id: string, stream: MediaStream): void;
  close(): void;
}
