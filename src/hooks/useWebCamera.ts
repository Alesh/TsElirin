import { useEffect, useState } from 'react';

/// WebCamera state
export interface WebCameraState {
  stream?: MediaStream;
  permission: boolean;
  lastError?: Error;
}

/// WebCamera methods
export interface WebCameraMethods {
  switchStream(constraints?: MediaStreamConstraints | 'off' | 'on'): void;
}

type UseWebCamera = WebCameraState & WebCameraMethods;
/// Hook help to use local web camera
export default function useWebCamera(): UseWebCamera {
  const [state, setState] = useState<WebCameraState>({ permission: false });
  // Turns on cam stream
  async function turnOnStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setState((prevState) => ({ ...prevState, stream, lastError: undefined }));
      } catch (lastError) {
        setState((prevState) => ({ ...prevState, stream: undefined, lastError }));
      }
    } else setState({ permission: false, lastError: new Error('Web camera is absent on your device') });
  }
  // Switches cam mode
  function switchStream(constraints: MediaStreamConstraints | 'off' | 'on') {
    setState((prevState) => {
      if (constraints !== 'off') turnOnStream(constraints === 'on' ? { video: true, audio: true } : constraints).then();
      if (prevState.stream) {
        prevState.stream.getTracks().forEach((track) => track.stop());
        return { ...prevState, stream: undefined };
      }
      return prevState;
    });
  }
  useEffect(() => switchStream('on'), []);
  return { ...state, switchStream };
}
