import { useEffect, useState } from 'react';
import useRPC from '@elirin/react/hooks/useRPC';
import useWebCamera from '@elirin/react/hooks/useWebCamera';
import CenteredLayout from '@/components/Layout/Centered';
import StreamWidget from '@/components/Widget/Stream.tsx';

export default function App() {
  const rpc = useRPC();
  const webCamera = useWebCamera();
  const [greeting, setGreeting] = useState<string>();
  useEffect(() => {
    rpc.call<string>('get_greeting').then(setGreeting).catch(console.error);
  }, []);
  return (
    <CenteredLayout>
      <h1>{greeting}</h1>
      <StreamWidget stream={webCamera.stream} />
    </CenteredLayout>
  );
}
