import { useEffect, useState } from 'react';
import { useRPC } from '@elirin/react';
import CenteredLayout from '@/components/Layout/Centered';

export default function App() {
  const rpc = useRPC();
  const [greeting, setGreeting] = useState<string>();
  useEffect(() => {
    rpc.call<string>('get_greeting').then(setGreeting).catch(console.error);
  }, []);
  return (
    <CenteredLayout>
      <h1>{greeting}</h1>
    </CenteredLayout>
  );
}
