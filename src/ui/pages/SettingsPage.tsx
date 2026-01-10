import { useEffect, useState } from "react";

const SettingsPage = ()=> { 
    const[formData, setFormData] = useState()

    useEffect(()=>{
        const fetchData = async()=> {
            try{
                const data = await window.electronApp.readJsonFile("settings.json")
                setFormData(data)
                console.log("dataaaa",data)
            }catch(error){
                console.log(error)
            }
        }
        fetchData();
    },[])

    const createForm = (data)=> {
        
    }

    return(
        <div className="container mt-4">

            <button onClick={()=>createForm()} className="btn">See form data</button>
        </div>
    )
}

export default SettingsPage;