import { createRef, FC, useEffect } from 'react';
import classes from './Stream.module.css';
import useRpc from '@/hooks/useRpc';
import * as api from '@/api';

/// Stream view widget
const StreamWidget: FC<{ streamId: string }> = ({ streamId }) => {
  const rpc = useRpc();
  const refVideo = createRef<HTMLVideoElement>();
  useEffect(() => {
    api
      .getStream(rpc, streamId)
      .then((stream) => {
        if (refVideo.current) refVideo.current.srcObject = stream;
      })
      .catch(console.error);
  }, [streamId, rpc]);
  return (
    <div className={classes.outer}>
      <video className={classes.inner} ref={refVideo} autoPlay />
    </div>
  );
};
export default StreamWidget;
