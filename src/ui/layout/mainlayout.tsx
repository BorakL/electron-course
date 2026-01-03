import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

const Layout = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleNavbar = () => setExpanded(!expanded);
  const closeNavbar = () => setExpanded(false);

  return (
    <div>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/" onClick={closeNavbar}>
            ProAdmin
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleNavbar}
            aria-controls="navbarNav"
            aria-expanded={expanded}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav">
              {[
                { to: '/download', label: 'Download' },
                { to: '/editPage', label: 'Izdvajanje dijeta' },
                { to: '/print', label: 'Štampanje' },
                { to: '/klinike', label: 'Klinike' },
                { to: '/dostavneTure', label: 'Linije za razvoz' },
                { to: '/filteri', label: 'Filteri za otpremnice' },
                { to: '/vanRfzo', label: 'Van Rfzo' },
                { to: '/specOtpremnice', label: 'Proizvodi'}
              ].map((item) => (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeNavbar}
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active fw-bold text-primary' : '')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mt-5 pt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
