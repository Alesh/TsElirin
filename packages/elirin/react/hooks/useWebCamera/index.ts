import { useMemo, useState } from 'react';
import WebCamera, { WebCameraMethods, WebCameraState } from './WebCamera.ts';

/// WebCamera use interface
export interface UseWebCamera extends WebCameraState, WebCameraMethods {}

/// WebCamera hook
export default function useWebCamera(): UseWebCamera {
  const [state, setState] = useState<WebCameraState>(WebCamera.DefaultState);
  const webCamera = useMemo(() => new WebCamera(setState), [setState]);
  return { ...state, switchStream: webCamera.switchStream.bind(webCamera) };
}
