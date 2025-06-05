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
              <div>1. Downloaduj otpremnice</div>
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
      <footer>
        <h2>O aplikaciji</h2>
        <p>
          Aplikacija ProAdmin je napravljena za jednostavno i brzo upravljanje otpremnicama
          u Excel formatu. Omogućava automatsko uređivanje, filtriranje i štampanje velikog broja excel fajlova.
        </p>
        <p>Radi offline i čuva podatke lokalno, bez potrebe za bazom.</p>

        <p>
          <strong>Verzija aplikacije:</strong> 1.0
          <br />
          <strong>Autor:</strong> Luka Borak
        </p>
      </footer>
       
    </div>
    )
}

export default HomePage;