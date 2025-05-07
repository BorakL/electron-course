// src/layout/MainLayout.tsx
import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/download">Download</Link></li>
          <li><Link to="/editPage">Edit</Link></li>
          <li><Link to="/print">Print Page</Link></li>
          <li><Link to="/klinike">Klinike</Link></li>
          <li><Link to="/dostavneTure">Dostavne Ture</Link></li>
        </ul>
      </nav>
      
      <main>
        <Outlet /> {/* Ovde se prikazuju sve podstranice */}
      </main>
    </div>
  );
}
