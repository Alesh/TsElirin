import CenteredLayout from '@/components/layouts/CenteredLayout.tsx';
import { Link } from 'react-router-dom';

/// Home page
export default function HomePage() {
  return (
    <CenteredLayout>
      <Link to="/video">Video test</Link>
    </CenteredLayout>
  );
}
