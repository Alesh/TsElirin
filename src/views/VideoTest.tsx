import { useEffect, useState } from 'react';
import CenteredLayout from '@/components/layouts/Centered';
import Toolbar, { CameraButton, MicButton, PublishButton } from '@/components/ui/ToolBar';
import VideoStream from '@/components/ui/VideoStream';
import useRemoteStream from '@/hooks/useRemoteStream';
import useWebCamera from '@/hooks/useWebCamera';
import classes from './styles/VideoTest.module.css';

const cameraStreamKey = 'local-camera-stream';

/// Page "Video test"
export default function VideoTest() {
  const webCamera = useWebCamera();
  const remote = useRemoteStream(cameraStreamKey);
  type Controls = { mute: boolean; camera: boolean; publish: boolean };
  const [controls, setControls] = useState<Controls>({ mute: true, camera: true, publish: false });
  useEffect(() => {
    webCamera.switchStream({ audio: !controls.mute, video: controls.camera });
  }, [controls.mute, controls.camera]);
  /*
  useEffect(() => {
    if (controls.publish) {
      if (webCamera.stream) local.publish(webCamera.stream, cameraStreamKey);
    } else local.cancel();
  }, [webCamera.stream, controls.publish]);
  */
  return (
    <CenteredLayout>
      <div className={classes.wrapper}>
        <VideoStream className={classes.localStream} stream={webCamera.stream} />
        <VideoStream stream={remote.stream} showPlaceholder />
        <Toolbar className={classes.controlBar}>
          <MicButton mute={controls.mute} setMute={(setter) => setControls((prev) => ({ ...prev, mute: setter(prev.mute) }))} />
          <CameraButton active={controls.camera} setActive={(setter) => setControls((prev) => ({ ...prev, camera: setter(prev.camera) }))} />
          <PublishButton active={controls.publish} setActive={(setter) => setControls((prev) => ({ ...prev, publish: setter(prev.publish) }))} />
        </Toolbar>
      </div>
    </CenteredLayout>
  );
}
