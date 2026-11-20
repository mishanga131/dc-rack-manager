import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" /> DC Rack Manager
        </div>
        <nav className="nav">
          <NavLink to="/racks" end>Реєстр стійок</NavLink>
          <NavLink to="/racks/new">+ Нова стійка</NavLink>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
