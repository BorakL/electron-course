import { useEffect } from 'react' 
import './App.css'
import klinike from "./../../data/klinike.json";

function App() {
 
  useEffect(()=>{
    
  },[])

  const downloadShippingDocs = async () => {
    const refererUrl = "https://prochef.rs/hospital/otpremnice.php"
    const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php"
    const kategorija = 2;
    const date = "12-01-2025";
    const session = "v573b98fk40mh7pofgib1sdrfl"
    try{
      await window.electronApp.createFullFolder(klinike, url, refererUrl, kategorija, date, session)
    }catch(error){
      console.error("Greška pri pozivanju createFullFolder:", error)
    }
  }

  return (
    <div className='App'>
      <div className="read-the-docs">
        <button onClick={downloadShippingDocs}>Download shipping docs</button>
      </div> 
      
    </div>
  )
}

export default App
