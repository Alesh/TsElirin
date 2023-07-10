import { useEffect, useState } from 'react';
import CenteredLayout from '@/components/layouts/Centered';
import Toolbar, { CameraButton, MicButton, PublishButton } from '@/components/ui/ToolBar';
import VideoStream from '@/components/ui/VideoStream';
import useRemoteStream from '@/hooks/useStream.ts';
import useWebCamera from '@/hooks/useWebCamera';
import classes from './styles/VideoTest.module.css';
import useUniChan from '@/hooks/useUniChan.ts';

const cameraStreamKey = 'local-camera-stream';

/// Page "Video test"
export default function VideoTest() {
  const uniChan = useUniChan();
  const webCamera = useWebCamera();
  const remote = useRemoteStream(cameraStreamKey);
  const [publishing, setPublishing] = useState(false);
  type Controls = { mute: boolean; camera: boolean; publish: boolean };
  const [controls, setControls] = useState<Controls>({ mute: true, camera: true, publish: false });
  useEffect(() => {
    webCamera.switchStream({ audio: !controls.mute, video: controls.camera });
  }, [controls.mute, controls.camera]);

  useEffect(() => {
    if (controls.publish) {
      if (webCamera.stream) uniChan.publishStream(cameraStreamKey, webCamera.stream).then(setPublishing);
    } else if (publishing) uniChan.unPublishStream(cameraStreamKey).then();
  }, [webCamera.stream, controls.publish]);

  console.log(uniChan, webCamera);
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
