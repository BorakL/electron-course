import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'; 
import HomePage from './pages/HomePage';
import DownloadPage from './pages/DownloadPage';
import PrintPage from './pages/PrintPage';
import KlinikeList from './pages/KlinikeList';
import KlinikaDetails from './pages/KlinikaDetails';
import DostavneTure from './pages/DostavneTure';
import DostavnaTuraDetails from './pages/DostavnaTuraDetails';
import EditPage from './pages/EditPage';
import MainLayout from './layout/mainlayout';
import AddKlinika from './pages/AddKlinika';
import IzdvajanjeDijeta from './pages/IzdvajanjeDijeta';
import LoginPage from './pages/LoginPage';
import { useSession } from './context/sessionContext';
// import { useAppDispatch, useAppSelector } from './redux/hooks';

function App() {
  return (
    <div className="App">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage/>} />            
            <Route path="/download" element={<ProtectedRoute><DownloadPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/editPage" element={<EditPage/>} />
            <Route path="/print" element={<PrintPage/>} />
            <Route path="/klinike" element={<KlinikeList/>} />
            <Route path="/klinike/:id" element={<KlinikaDetails/>} />
            <Route path="/dostavneTure" element={<DostavneTure/>} />
            <Route path="/dostavneTure:id" element={<DostavnaTuraDetails/>} />
            <Route path="/addKlinika" element={<AddKlinika/>} />
            <Route path="/filteri" element={<IzdvajanjeDijeta/>}/>
            <Route path="*" element={<Navigate to="/download" />} />
          </Route> 
        </Routes>
    </div> 
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session } = useSession();
  if (!session) return <Navigate to="/login" />;
  return children;
} 

export default App;
