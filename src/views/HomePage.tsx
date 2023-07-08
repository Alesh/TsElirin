import { Link } from 'react-router-dom';
import CenteredLayout from '@/components/layouts/Centered';

/// Home page
export default function HomePage() {
  return (
    <CenteredLayout>
      <Link to="/video">Video test</Link>
    </CenteredLayout>
  );
}
