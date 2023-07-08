import { createRef, FC, useEffect } from 'react';
import { ReactComponent as Placeholder } from '@/assets/video-playback.svg';
import classes from './VideoStream.module.css';

type VideoStreamProps = { stream?: MediaStream; muted?: boolean; showPlaceholder?: boolean; className?: string };
/// Video stream widget
const VideoStream: FC<VideoStreamProps> = ({ stream, className = classes.outer, muted = true, showPlaceholder = false }) => {
  const refVideo = createRef<HTMLVideoElement>();
  useEffect(() => {
    if (refVideo.current && stream) {
      refVideo.current.srcObject = stream;
    }
  }, [refVideo, stream]);
  return (
    <div className={className}>
      {stream ? (
        <video className={classes.inner} ref={refVideo} playsInline autoPlay muted={muted} />
      ) : (
        <Placeholder className={classes.inner} style={{ visibility: showPlaceholder ? 'visible' : 'hidden' }} />
      )}
    </div>
  );
};

export default VideoStream;
