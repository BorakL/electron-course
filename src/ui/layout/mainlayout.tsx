import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      <nav className = "navbar fixed-top navbar-expand navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">ProAdmin</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigacije">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/download">Download</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/editPage">Edit</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/print">Print Page</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/klinike">Klinike</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dostavneTure">Dostavne Ture</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/filteri">Filteri Za Otpremnice</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
