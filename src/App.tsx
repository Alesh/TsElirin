import CenteredLayout from '@/components/layouts/Centered.tsx';
import useUniChan from '@/hooks/useUniChan.ts';

export default function App() {
  const uniChan = useUniChan();
  console.log(uniChan);
  return (
    <CenteredLayout>
      <h1>Hello, world!</h1>
    </CenteredLayout>
  );
}
