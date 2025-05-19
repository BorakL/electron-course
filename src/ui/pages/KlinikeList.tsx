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
        <div>
            <h1>Klinke</h1>
            <ul>
                {klinike.map(klinika => 
                    <li key={klinika.user}>
                        <Link to={`/klinike/${klinika.user}`}>
                            {klinika.naziv}
                        </Link>
                    </li>
                )}
            </ul>
            <Link to={`/addKlinika`}>Dodaj novu kliniku</Link>
        </div>
    )
}

export default KlinikeList;