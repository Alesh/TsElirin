import { useEffect, useState } from 'react';
import useWebCamera from '@elirin/react/hooks/useWebCamera';
import CenteredLayout from '@/components/Layout/CenteredLayout';
import VideoStream from '@/components/Video/VideoStream';
import Toolbar, { CamButton, CastButton, MicButton } from '@/components/ToolBar';
import classes from './styles/VideoTest.module.css';

/// Page "Video test"
export default function VideoTest() {
  const webCamera = useWebCamera();
  const [cam, setCam] = useState(true);
  const [mute, setMute] = useState(true);
  const [cast, setCast] = useState(false);
  useEffect(() => {
    const video = cam,
      audio = !mute;
    if (video || audio) {
      webCamera.switchStream({ video, audio });
    } else webCamera.switchStream('off');
  }, [cam, mute]);
  useEffect(() => {
    setCast((cast) => {
      if (cast) {
        if (webCamera.stream) {
          rpc.publishStream(webCamera.stream, 'local-webcam-stream');
        } else cast = !cast;
      } else rpc.disconnectStream('local-webcam-stream');
      return cast;
    });
  }, [cast]);
  return (
    <CenteredLayout>
      <div className={classes.wrapper}>
        <VideoStream className={classes.localStream} stream={webCamera.stream} />
        <VideoStream stream={undefined} showPlaceholder />
        <Toolbar className={classes.controlBar}>
          <MicButton mute={mute} setMute={setMute} />
          <CamButton active={cam} setActive={setCam} />
          <CastButton active={cast} setActive={setCast} />
        </Toolbar>
      </div>
    </CenteredLayout>
  );
}
