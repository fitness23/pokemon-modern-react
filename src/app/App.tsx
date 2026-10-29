import { lazy, Suspense, type ReactNode } from 'react';
import { Link, Route, Routes, useMatch } from 'react-router-dom';
import './App.scss';

const Search = lazy(() => import('./search/Search'));
const Fire = lazy(() => import('./fire/Fire'));
const Water = lazy(() => import('./water/Water'));

function NavItem({ to, children }: { to: string; children: ReactNode }) {
  const active = useMatch({ path: to, end: false });
  return (
    <li className={active ? 'active' : undefined}>
      <Link to={to}>{children}</Link>
    </li>
  );
}

export default function App() {
  return (
    <>
      <div id="logo"><img src="/assets/logo.png" title="Pokeapi" /></div>

      <nav id="mainNav">
        <ul>
          <NavItem to="/search">Search</NavItem>
          <NavItem to="/fire">Fire</NavItem>
          <NavItem to="/water">Water</NavItem>
        </ul>
      </nav>

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/search" element={<Search />} />
          <Route path="/fire" element={<Fire />} />
          <Route path="/water" element={<Water />} />
        </Routes>
      </Suspense>
    </>
  );
}
