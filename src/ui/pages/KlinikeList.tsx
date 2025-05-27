import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

export type Klinika = {
    naziv:string,
    bolnicaApp: string,
    klinikaApp: string,
    bolnica: string,
    klinika: string,
    firm: number,
    user: number
}


const KlinikeList = ()=>{
    const [klinike,setKlinike] = useState<Klinika[]>([]);

    const fetchKlinke = async() => {
        try{
            const data = await window.electronApp.readJsonFile("klinike.json");
            setKlinike(data);
        }catch(error){
            console.log("Greška pri čitanju fajla:",error)
        }
    }

    useEffect(()=>{
        fetchKlinke();
    }, [])

    return(
    <div className="container py-4">
      <h1 className="mb-4">Klinike</h1>

      <ul className="list-group mb-4">
        {klinike.map((klinika) => (
          <li key={klinika.user} className="list-group-item mb-2">
            <Link to={`/klinike/${klinika.user}`} className="text-decoration-none">
              {klinika.naziv.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/addKlinika" className="btn btn-primary">
        Dodaj novu kliniku
      </Link>
    </div>
    )
}

export default KlinikeList;