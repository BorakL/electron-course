import { useEffect, useState } from "react";
import { Klinika } from "../../shared/types";
import { Link } from 'react-router-dom';

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
        </div>
    )
}

export default KlinikeList;