import { useEffect, useState } from 'react';

/// Remote stream use interface
export interface UseStream {
  stream?: MediaStream;
  subscribe(streamKey: string): void;
  cancel(): void;
}
/// Hook help to subscribe to remote stream
export default function useRemoteStream(streamKey?: string): UseStream {
  const [key, setKey] = useState<string | undefined>(streamKey);
  const [stream, setStream] = useState<MediaStream | undefined>();
  // Subscribes to a stream from remote peer.
  function subscribe(streamKey: string): void {
    setKey(() => {
      return key;
    });
  }
  // Cancels active subscription
  function cancel() {
    setKey((prevKey) => {
      return undefined;
    });
  }
  // Apply default subscription
  useEffect(() => {
    if (streamKey) subscribe(streamKey);
    return () => cancel();
  }, [streamKey]);
  return { stream, subscribe, cancel };
}
