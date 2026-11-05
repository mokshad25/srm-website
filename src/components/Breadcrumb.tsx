import { Link, useLocation } from 'react-router-dom';
import site from '../data/site.json';
import { headerKey } from './Header';

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const key = headerKey(pathname);
  const crumb = key === 'home' ? undefined : site.headers[key].crumb;
  if (!crumb) return null;
  return (
    <nav aria-label="Breadcrumb" className="text-14">
      <Link to="/" className="underline underline-offset-2">Home</Link>
      {crumb.map((c) => <span key={c}> / {c}</span>)}
    </nav>
  );
}
