import { useState } from 'react';

/// Local stream use interface
export interface UseLocalStream {
  published: boolean;
  publish(stream: MediaStream, key: string): void;
  cancel(): void;
}

/// Hook help to establish publishing local stream to remote peer.
export default function useLocalStream(): UseLocalStream {
  const [key, setKey] = useState<string | undefined>();
  // Tries to establish publishing local stream to remote peer.
  function publish(stream: MediaStream, key: string): void {
    setKey(() => {
      return key;
    });
  }
  // Cancels local stream publishing
  function cancel(): void {
    setKey((prevKey) => {
      return undefined;
    });
  }
  return { published: typeof key !== 'undefined', publish, cancel };
}
