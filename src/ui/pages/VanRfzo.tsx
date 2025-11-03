import { useEffect, useState } from "react";
import { Klinika } from "../types";
// import { useForm } from "react-hook-form";

const VanRfzo = ()=>{
    const[cliniks,setCliniks] = useState<Klinika[]>([]);
    // const{register} = useForm()

    useEffect(()=>{
        const fetchCliniks = async() => {
            try{
                const data = await window.electronApp.readJsonFile("klinike.json")
                setCliniks(data)
            }catch(error){
                console.log("error",error)    
            }
        }
        fetchCliniks();
    },[])
    
 
    return(
        <>
        <div>
            {cliniks.map(c => <div key={c.id}>{c.naziv}</div>)}
        </div>
        <form>
            
        </form>
        </>
    )
}

export default VanRfzo;