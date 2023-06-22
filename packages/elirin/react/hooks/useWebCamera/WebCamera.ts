/// WebCamera state
export interface WebCameraState {
  stream?: MediaStream;
  permission: boolean;
  lastError?: Error;
}

/// WebCamera methods
export interface WebCameraMethods {
  switchStream(constraints?: MediaStreamConstraints): void;
}

type SetWebCameraState = (value: WebCameraState) => void;
/// WebCamera implementation
export default class WebCameraImpl implements WebCameraMethods {
  private readonly hasMediaDevices: boolean;
  private state: WebCameraState;
  private readonly setState: (value: Partial<WebCameraState>) => void;
  private readonly defaultStreamConstraints: MediaStreamConstraints;

  private async getStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (this.hasMediaDevices) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } else {
      throw new Error('Web camera is absent on your device');
    }
  }

  static DefaultState: WebCameraState = { permission: false };
  constructor(setState: SetWebCameraState) {
    // initialize members
    this.state = WebCameraImpl.DefaultState;
    this.defaultStreamConstraints = { video: true };
    this.hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    this.setState = (state) => {
      this.state = { ...this.state, ...state };
      setState(this.state);
    };
    this.getStream(this.defaultStreamConstraints)
      .then((stream) => this.setState({ stream, permission: true, lastError: undefined }))
      .catch((error) => this.setState({ lastError: error, stream: undefined }));
  }

  /// Switches webcam stream mode
  switchStream(constraints: MediaStreamConstraints) {
    this.getStream(constraints)
      .then((stream) => this.setState({ stream, lastError: undefined }))
      .catch((error) => this.setState({ lastError: error, stream: undefined }));
  }
}
