import { useState } from 'react';
import CenteredLayout from '@/components/layouts/CenteredLayout';
import Toolbar, { CameraButton, MicButton, PublishButton } from '@/components/ui/ToolBar';
import VideoStream from '@/components/ui/VideoStream';
import useSubscribedStream from '@/hooks/useSubscribedStream';
import useWebCamera from '@/hooks/useWebCamera';
import classes from './styles/VideoTest.module.css';

/// Page "Video test"
export default function VideoTest() {
  const webCamera = useWebCamera();
  const subscribed = useSubscribedStream('local-camera');
  type Controls = { mute: boolean; camera: boolean; publish: boolean };
  const [controls, setControls] = useState<Controls>({ mute: true, camera: true, publish: false });
  return (
    <CenteredLayout>
      <div className={classes.wrapper}>
        <VideoStream className={classes.localStream} stream={webCamera.stream} />
        <VideoStream stream={subscribed.stream} showPlaceholder />
        <Toolbar className={classes.controlBar}>
          <MicButton mute={controls.mute} setMute={(setter) => setControls((prev) => ({ ...prev, mute: setter(prev.mute) }))} />
          <CameraButton active={controls.camera} setActive={(setter) => setControls((prev) => ({ ...prev, camera: setter(prev.camera) }))} />
          <PublishButton active={controls.publish} setActive={(setter) => setControls((prev) => ({ ...prev, publish: setter(prev.publish) }))} />
        </Toolbar>
      </div>
    </CenteredLayout>
  );
}
