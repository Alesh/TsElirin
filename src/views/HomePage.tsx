import CenteredLayout from '@/components/Layout/CenteredLayout';
import LinkButton from '@/components/Button/LinkButton';

/// Home page
export default function HomePage() {
  return (
    <CenteredLayout>
      <LinkButton href="/video">Video test</LinkButton>
    </CenteredLayout>
  );
}
