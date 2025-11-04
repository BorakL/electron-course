import { useEffect, useState } from "react";
import { Klinika, VanRfzoForm } from "../types";
import { useFieldArray, useForm} from "react-hook-form";

const VanRfzo = ()=>{
    const[clinics,setClinics] = useState<Klinika[]>([]);
    const[selectedClinicId,setSelectedClinicId] = useState<number>(0)
    const{
        register,
        control,
        handleSubmit,
        formState:{errors},
        reset
    } = useForm<VanRfzoForm>({
        defaultValues:{
            clinics: [],
            date: ''
        }})

    const{fields,append,remove} = useFieldArray({
        control,
        name:"clinics"
    })

    const handleAddClinic = () => {
        if(!selectedClinicId) return;
        const clinicToAdd = clinics.find(clinic => clinic.id===selectedClinicId)
        if(!clinicToAdd) return;
        //prevent duplicates
        if(fields.some(field => field.naziv===clinicToAdd.naziv)) return;
        append(clinicToAdd)
    }

    const onSubmit = async(data: VanRfzoForm) => {
        try{
            await window.electronApp.writeJsonFile("klinikeVanRfzo.json", data)
        }catch(error){
            console.log("error",error)
        }
    }

    useEffect(()=>{
        const fetchClinics = async() => {
            try{
                const data = await window.electronApp.readJsonFile("klinike.json")
                const dataVrfzo = await window.electronApp.readJsonFile("klinikeVanRfzo.json")
                setClinics(data)
                reset(dataVrfzo)
            }catch(error){
                console.log("error",error)    
            }
        }
        fetchClinics();
    },[])

    return(
        <div className="mb-3">
        <form className="container mt-4" onSubmit={handleSubmit(onSubmit)}>
            {/* DATE */}
            <div className="mb-3">
                <label className="form-label">Datum</label>
                <input 
                    type="date" 
                    className="form-control"
                    {...register("date", {required:true})} 
                />
            </div>
            <div>{errors.date?.message}</div>

            {/* SELECT + ADD BUTTON */}
            <label htmlFor="clinic" className="form-label">Klinika</label>
            <div className="input-group mb-3">
                <select
                    className='form-select'
                    value={selectedClinicId}
                    onChange={e => setSelectedClinicId(Number(e.target.value))}
                >
                    <option value="">-- Odabri kliniku --</option>
                    {clinics.map(clinic => 
                        <option key={clinic.id} value={clinic.id}>
                            {clinic.naziv.toUpperCase()}
                        </option>
                    )}
                </select>
                <button type="button" className="btn btn-secondary" onClick={handleAddClinic}>
                    Dodaj
                </button>
            </div>
            
            {/* SELECTED CLINICS LIST */}
            <ul className="list-group mb-3">
                {fields.map((field,index) => 
                <li key={field.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {field.naziv.toUpperCase()}
                    <button type="button" className="btn btn-danger btn-sm" onClick={()=>remove(index)}>
                        Ukloni
                    </button>
                </li>)}
            </ul>

            <button type="submit" className="btn btn-primary">Sačuvaj</button>
        </form>
        </div>
    )
}

export default VanRfzo;