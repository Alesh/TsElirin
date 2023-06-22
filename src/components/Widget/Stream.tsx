import { createRef, FC, useEffect } from 'react';
import classes from './Stream.module.css';

/// Stream view widget
const StreamWidget: FC<{ stream?: MediaStream }> = ({ stream }) => {
  const refVideo = createRef<HTMLVideoElement>();
  useEffect(() => {
    if (refVideo.current) refVideo.current.srcObject = stream;
  }, [refVideo, stream]);
  return (
    <div className={classes.outer}>
      <video className={classes.inner} ref={refVideo} playsInline autoPlay muted />
    </div>
  );
};

export default StreamWidget;
