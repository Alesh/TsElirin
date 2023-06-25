/// WebCamera state
export interface WebCameraState {
  stream?: MediaStream;
  permission: boolean;
  lastError?: Error;
}

/// WebCamera methods
export interface WebCameraMethods {
  switchStream(constraints?: MediaStreamConstraints | 'off'): void;
}

type SetState = (value: WebCameraState) => void;
/// WebCamera implementation
export default class WebCameraImpl implements WebCameraMethods {
  private readonly hasMediaDevices: boolean;
  private state: WebCameraState;
  private readonly setState: (value: Partial<WebCameraState>) => void;

  private async getStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (this.hasMediaDevices) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } else {
      throw new Error('Web camera is absent on your device');
    }
  }

  static defaultState: WebCameraState = { permission: false };
  constructor(setState: SetState) {
    // initialize members
    this.state = WebCameraImpl.defaultState;
    this.hasMediaDevices = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    this.setState = (state) => {
      this.state = { ...this.state, ...state };
      setState(this.state);
    };
  }

  /// Switches webcam stream mode
  switchStream(constraints: MediaStreamConstraints | 'on' | 'off') {
    if (constraints === 'off') {
      if (this.state.stream) {
        this.state.stream.getTracks().forEach((track) => track.stop());
        this.setState({ stream: undefined });
      }
    } else {
      constraints = constraints === 'on' ? { video: true, audio: true } : constraints;
      this.getStream(constraints)
        .then((stream) => this.setState({ stream, lastError: undefined }))
        .catch((error) => this.setState({ lastError: error, stream: undefined }));
    }
  }

  /// Invokes WebCameraMethods interface
  invokeInterfaceMethods(): WebCameraMethods {
    return {
      switchStream: this.switchStream.bind(this),
    };
  }
}
