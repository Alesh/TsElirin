import CenteredLayout from '@/components/Layout/Centered';
import StreamWidget from '@/components/Widget/Stream.tsx';

export default function App() {
  return (
    <CenteredLayout>
      <StreamWidget streamId={'file:cats.mp4'} />
    </CenteredLayout>
  );
}
