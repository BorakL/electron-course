import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import klinike from "./../../data/klinike.json";

function App() {
  const [count, setCount] = useState(0)
 
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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + Reactaa</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="read-the-docs">
        <button onClick={downloadShippingDocs}>Download shipping docs</button>
      </div> 
      
    </div>
  )
}

export default App
