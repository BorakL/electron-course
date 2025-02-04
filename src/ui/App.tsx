import { useEffect } from 'react' 
import './App.css'
import klinike from "./../../data/klinike.json";

function App() {
 
  useEffect(()=>{
    
  },[])

  const downloadShippingDocs = async () => {
    const refererUrl = "https://prochef.rs/hospital/otpremnice.php"
    const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php"
    const category = 2;
    const date = "12-01-2025";
    const session = "107su6vf0qtb03ggkh9rr2rt0a"
    try{
      await window.electronApp.createFullFolder(
        {
          cliniks: klinike,
          url,
          refererUrl,
          category,
          date,
          session
        }
      )
    }catch(error){
      console.error("Greška pri pozivanju createFullFolder:", error)
    }
  }

  return (
    <div className='App'>
      <div>
        <form action="">
          <div>
            <label htmlFor="category">Obrok: </label>
            <input type="number" name="category" id="category" />
          </div>
          <div>
            <label htmlFor="data">Datum: </label>
            <input type="date" name="date" id="date" /> 
          </div>      
          <div>
            <label htmlFor="session">PHPSESSID: </label>
            <input type="text" name="session" id="session" />
          </div>      
        </form>
      </div>
      <div className="read-the-docs">
        <button onClick={downloadShippingDocs}>Download shipping docs</button>
      </div> 
      
    </div>
  )
}

export default App
