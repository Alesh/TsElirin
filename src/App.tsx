import CenteredLayout from '@/components/layouts/Centered.tsx';
import useUniChan from '@/hooks/useUniChan.ts';
import { useEffect, useState } from 'react';

export default function App() {
  const { rpc } = useUniChan();
  const [msg, setMsg] = useState<string>();
  useEffect(() => {
    rpc.call<string>('get_greeting').then(setMsg);
  }, []);
  return (
    <CenteredLayout>
      <h1>{msg}</h1>
    </CenteredLayout>
  );
}
