import { Link } from 'react-router-dom';
import CenteredLayout from '@/components/layouts/CenteredLayout';
import useJsonRPC2 from '@/hooks/useJsonRPC2';
import { useEffect, useState } from 'react';

/// Home page
export default function HomePage() {
  const rpc = useJsonRPC2();
  const [msg, setMsg] = useState<string>();
  useEffect(() => {
    rpc.call('get_greeting').then(setMsg);
  }, [rpc]);
  return (
    <CenteredLayout>
      <Link to="/video">Video test; {msg}</Link>
    </CenteredLayout>
  );
}
