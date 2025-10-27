import { Link } from "react-router-dom";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { LuSeparatorVertical } from "react-icons/lu";

const HomePage = ()=>{
    return(
<div className="container mt-4">
      <h1>ProAdmin</h1>
        <div className="main-menu">
           
            <Link to="/download">
              <div><FiDownload/></div>
              <div>1. Preuzmi otpremnice</div>
            </Link>
 
            <Link to="/editPage">
              <div><LuSeparatorVertical/></div>
              <div>2. Izdvoj posebne dijete</div>
            </Link>
 
            <Link to="/print">
              <div><FiPrinter/></div>
              <div>3. Štampaj otpremnice</div>
            </Link>
 
        </div> 
        <footer className="text-center mt-5 mb-4 small text-muted">
          <h2 className="h5">O aplikaciji</h2>
          <p>
            Aplikacija <strong>ProAdmin</strong> je napravljena za jednostavno i brzo upravljanje otpremnicama
            u Excel formatu. Omogućava automatsko uređivanje, filtriranje i štampanje velikog broja Excel fajlova.
          </p>
          <p>Radi offline i čuva podatke lokalno, bez potrebe za bazom.</p>

          <p>
            <strong>Verzija aplikacije:</strong> 1.0<br />
          </p>

          <hr />
          <p className="mt-3">
            © {new Date().getFullYear()} Luka Borak. Sva prava zadržana.
          </p>
        </footer>
       
    </div>
    )
}

export default HomePage;