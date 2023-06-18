import { createRef, FC, useEffect } from 'react';
import classes from './Stream.module.css';
import useRtcChannel from '@/hooks/useRtcChannel.ts';

/// Stream view widget
const StreamWidget: FC<{ streamId: string }> = ({ streamId }) => {
  const refVideo = createRef<HTMLVideoElement>();
  const rtcChannel = useRtcChannel(streamId);
  useEffect(() => {
    rtcChannel
      .getStream()
      .then((stream) => {
        if (refVideo.current) {
          refVideo.current.srcObject = stream;
        }
      })
      .catch(console.error);
  }, [refVideo, rtcChannel, streamId]);
  return (
    <div className={classes.outer}>
      <video className={classes.inner} ref={refVideo} playsInline autoPlay muted />
    </div>
  );
};
export default StreamWidget;
