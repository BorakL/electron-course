import { useEffect, useState } from "react";
import { DostavnaTura, Vozac, Vozilo } from "../types";
import { useForm } from "react-hook-form";

const Transport = () => {
    const[vozila, setVozila] = useState<Vozilo[]>([])
    const[vozaci, setVozaci] = useState<Vozac[]>([]);
    const voziloForm = useForm<{
        model: string;
        tablice: string
    }>();
    const vozacForm = useForm<{
        ime: string;
        prezime: string
    }>();
    
    useEffect(() => {
        const fetchTransport = async () => {
            try{
                const transport = await window.electronApp.readJsonFile("transport.json")
                if(transport){
                    setVozaci(transport.vozaci);
                    setVozila(transport.vozila);
                }
            }catch(error){
                console.log("Problem sa učitavanjem podataka o transportu: ", error)
            }
        }
        fetchTransport();
    },[])

    const addVozilo = async (data: {model:string, tablice:string}) => {
        try{
            const novoVozilo: Vozilo = {
                model: data.model,
                tablice: data.tablice
            };
            const updatedVozila = [...vozila, novoVozilo];
            setVozila(updatedVozila);
            await window.electronApp.writeJsonFile("transport.json", {
                vozaci: vozaci,
                vozila: updatedVozila
            })
            voziloForm.reset();
        }catch(error){
            console.log("Problem prilikom dodavanja novog vozila: ", error)
        }
    }

    const addVozac = async(data: {ime:string, prezime:string}) => {
        try{
            const noviVozac: Vozac = {
                id: Date.now().toString(),
                ime: data.ime,
                prezime: data.prezime
            }
            const updatedVozaci = [...vozaci, noviVozac];
            setVozaci(updatedVozaci);
            await window.electronApp.writeJsonFile("transport.json", {
                vozaci: updatedVozaci,
                vozila: vozila
            })
            vozacForm.reset();
        }catch(error){
            console.log("Problem prilikom dodavanja novog vozaca: ", error)
        }
    }

    const removeVozilo = async(tablice:string) => {
        try{
            const updatedVozila = vozila.filter(v => v.tablice!==tablice);
            setVozila(updatedVozila);
            await window.electronApp.writeJsonFile("transport.json", {
                vozaci: vozaci,
                vozila: updatedVozila
            })
            const dostavneTure: DostavnaTura[] = await window.electronApp.readJsonFile("dostavneTure.json");
            if(dostavneTure && dostavneTure.length>0){
                const novaDostavnaTura = dostavneTure.filter(dt => dt?.vozilo?.tablice !== tablice );
                await window.electronApp.writeJsonFile("dostavneTure.json", novaDostavnaTura)
            }
        }catch(error){
            console.log("Greška prilikom brisanja vozila: ", error)
        }
    }

    const removeVozac = async (id: string) => {  // number umesto string
        try {
            // 1. Obriši vozača iz liste vozača
            const updatedVozaci = vozaci.filter(v => v.id !== id);
            setVozaci(updatedVozaci);
            
            // 2. Sačuvaj transport.json
            await window.electronApp.writeJsonFile("transport.json", {
                vozaci: updatedVozaci,
                vozila: vozila
            });
            
            // 3. Obriši sve ture koje imaju ovog vozača (bilo kao prvi ili drugi vozač)
            const dostavneTure: DostavnaTura[] = await window.electronApp.readJsonFile("dostavneTure.json");
            
            if (dostavneTure && dostavneTure.length > 0) {
                const novaDostavnaTura = dostavneTure.filter(tura => {
                    // Proveri da li tura ima ovog vozača
                    const imaVozaca = 
                        tura.vozaci?.["1"]?.id === id || 
                        tura.vozaci?.["2"]?.id === id;
                    
                    // Zadrži ture KOJE NEMAJU ovog vozača
                    return !imaVozaca;
                });
                
                await window.electronApp.writeJsonFile("dostavneTure.json", novaDostavnaTura);
            }
            
            console.log("Vozač uspešno obrisan");
            
        } catch (error) {
            console.log("Greška prilikom brisanja vozača: ", error);
            alert("Došlo je do greške prilikom brisanja vozača.");
        }
    };

    return(
        <div className="container py-4">
            <div className="mb-5">
                <h2>Vozila</h2>
                <ul className="list-group mb-3">
                    {vozila.map((vozilo: Vozilo) => 
                        <li 
                            className="list-group-item d-flex justify-content-between align-items-center" 
                            key={vozilo.tablice}
                        >
                            <div className="me-3">
                                {vozilo.model} - <strong>{vozilo.tablice}</strong>
                            </div>
                            <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeVozilo(vozilo.tablice)}
                            >
                                <i className="bi bi-trash"></i> Obriši
                            </button>
                        </li>
                    )}
                </ul>
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={voziloForm.handleSubmit(addVozilo)}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input
                                        type="text" 
                                        className={`form-control ${voziloForm.formState.errors.model ? 'is-invalid' : ''}`}
                                        {...voziloForm.register('model')} 
                                        placeholder="Model"
                                    />
                                    {voziloForm.formState.errors.model && (
                                        <div className="invalid-feedback">
                                            {voziloForm.formState.errors.model.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input 
                                        type="text"
                                        className={`form-control ${voziloForm.formState.errors.tablice ? 'is-invalid' : ''}`} 
                                        {...voziloForm.register('tablice', {
                                            required:'Obavezno polje!', 
                                            validate: (value) => {
                                                const postoji = vozila.some(vozilo => vozilo.tablice === value);
                                                return !postoji || 'Vozilo sa ovom registracijom već postoji u bazi podataka!'
                                            }
                                        })} 
                                        placeholder="Registracija"
                                    />
                                    {voziloForm.formState.errors.tablice && (
                                        <div className="invalid-feedback">
                                            {voziloForm.formState.errors.tablice.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-plus-circle"></i> Dodaj vozilo
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="mb-5">
                <h2>Vozači</h2>
                <ul className="list-group mb-3">
                    {vozaci.map((vozac: Vozac) => 
                        <li 
                            className="list-group-item d-flex justify-content-between align-items-center" 
                            key={vozac.id}
                        >
                            <div className="me-3">
                                {vozac.ime} {vozac.prezime}
                            </div>
                            <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeVozac(vozac.id)}
                            >
                                <i className="bi bi-trash"></i> Obriši
                            </button>
                        </li>)}
                </ul>
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={vozacForm.handleSubmit(addVozac)}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input
                                        type="text" 
                                        className={`form-control ${vozacForm.formState.errors.ime ? 'is-invalid' : ''}`}
                                        {...vozacForm.register('ime', {required:'Obavezno polje!'})} 
                                        placeholder="Ime"
                                    />
                                    {vozacForm.formState.errors.ime && (
                                        <div className="invalid-feedback">
                                            {vozacForm.formState.errors.ime.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <input 
                                        type="text"
                                        className={`form-control ${vozacForm.formState.errors.prezime ? 'is-invalid' : ''}`} 
                                        {...vozacForm.register('prezime', {required:'Obavezno polje!'})} 
                                        placeholder="Prezime"
                                    />
                                    {vozacForm.formState.errors.prezime && (
                                        <div className="invalid-feedback">
                                            {vozacForm.formState.errors.prezime.message}
                                        </div>
                                    )}
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary">
                                        <i className="bi bi-plus-circle"></i> Dodaj vozača
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Transport;