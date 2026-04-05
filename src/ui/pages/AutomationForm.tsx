import { useEffect, useState } from "react";
import { DostavnaTura, Field, Klinika, KlinikaSaLinijom, WindowInfo } from "../types";
import { useForm } from 'react-hook-form';


const AutomationForm = () => {
        type FormValues = {
        category: 1 | 2 | 3;
        date: string;
        shift: number;
    };
    
    const form = useForm<FormValues>({
        defaultValues: {
            category: 1,
            date: "",
            shift: 1
        },
    });

    const [klinike, setKlinike] = useState<Klinika[]>([]);
    const [dostavneTure, setDostavneTure] = useState<DostavnaTura[]>([]);
    const [fields, setFields] = useState<Record<string,Field>>({});
    const [windowInfo, setwindowInfo] = useState<WindowInfo>();
    const [klinikeSaLinijama, setKlinikeSaLinijama] = useState<(KlinikaSaLinijom)[]>([]);
    const [loading, setLoading] = useState(true); // Dodaj loading state
    const [clickedClinics, setClickedClinics] = useState<number[]>([]);
    const { register, formState, watch, setValue } = form;
    const { errors } = formState;
    const watchDate = watch("date");

    useEffect(() => {    
        if (watchDate) {
            const [year, month, day] = watchDate.split("-");
            setValue("date", `${year}-${month}-${day}`, { shouldValidate: true });
        }
    }, [watchDate, setValue]);

    const pronadjiTuruZaKliniku = (
        userId: number,
        dostavneTure: DostavnaTura[]
    ): DostavnaTura | null => {
        if (!Array.isArray(dostavneTure)) return null;
        
        for (const tura of dostavneTure) {
            if (tura.klinike && Array.isArray(tura.klinike) && tura.klinike.includes(userId)) {
                return tura;
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Učitaj klinike
                const klinikeData = await window.electronApp.readJsonFile("klinike.json");
                // console.log("klinike", klinikeData);
                
                // Učitaj dostavne ture
                const tureData = await window.electronApp.readJsonFile("dostavneTure.json");
                // console.log("dostavneTure", tureData);

                // Učitaj polja
                const fieldsData = await window.electronApp.readJsonFile("fields.json")
                setFields(fieldsData)
                // console.log("fields", fieldsData)

                const windowInfoData = await window.electronApp.readJsonFile("window.json")
                setwindowInfo(windowInfoData)
                // console.log("windowInfoData", windowInfoData)
                
                // Proveri i setuj klinike
                if (Array.isArray(klinikeData)) {
                    setKlinike(klinikeData);
                } else {
                    console.error("klinike.json nije niz:", klinikeData);
                    setKlinike([]);
                }
                
                // Proveri i setuj ture (važno: tvoj fajl ima strukturu { ture: [...] })
                let tureArray = [];
                if (tureData && tureData.ture && Array.isArray(tureData.ture)) {
                    tureArray = tureData.ture;
                } else if (Array.isArray(tureData)) {
                    tureArray = tureData;
                } else {
                    console.error("dostavneTure.json nije u očekivanom formatu:", tureData);
                    tureArray = [];
                }
                setDostavneTure(tureArray);
                
            } catch (error) {
                console.log("Greška prilikom učitavanja podataka", error);
                setKlinike([]);
                setDostavneTure([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        // Ne radi ništa dok se podaci ne učitaju ili ako nema podataka
        if (loading) return;
        if (!klinike.length && !dostavneTure.length && !fields.length) return;
        if (!Array.isArray(klinike) || !Array.isArray(dostavneTure)) return;
        
        // console.log("Obrada podataka - klinike:", klinike.length, "ture:", dostavneTure.length);
        
        try {
            const data: KlinikaSaLinijom[] = klinike.map((klinika: Klinika) => {
                const linija = pronadjiTuruZaKliniku(klinika.id, dostavneTure);
                return { ...klinika, linija }; // linija može biti DostavnaTura | undefined
            });
            
            // Sortiranje - klinike sa linijom idu prve, sortirane po linija.id
            const sortirano = data.sort((a, b) => {
                // Proveri da li postoje linije
                const aHasLinija = a.linija !== undefined;
                const bHasLinija = b.linija !== undefined;
                
                // Ako obe nemaju liniju, ostaju na istom mestu
                if (!aHasLinija && !bHasLinija) return 0;
                // Ako samo a nema liniju, a ide posle b
                if (!aHasLinija) return 1;
                // Ako samo b nema liniju, b ide posle a
                if (!bHasLinija) return -1;
                
                // Obe imaju liniju, sortiraj po id-u
                return a.linija!.id - b.linija!.id;
            });
            
            // console.log("Sortirano uspešno:", sortirano);
            setKlinikeSaLinijama(sortirano);
            
        } catch (error) {
            console.error("Greška pri obradi podataka:", error);
        }
        
    }, [klinike, dostavneTure, windowInfo, loading]);

    const sendData = async (data: KlinikaSaLinijom) => {
        try {
            //Konzologuj datum i kategorije
            //Napravi nova polja (date, category) za to i Probaj da šalješ kao fields.date.value, fields.category.value...
            const date = form.getValues("date")
            const category = form.getValues("category")
            const shift = form.getValues("shift")
            setClickedClinics(prev => [...prev,data.id])
            
            
            if(fields.bolnica){
                fields.bolnica.value = data.bolnica;
                if(fields.itemOrdinal){
                    fields.itemOrdinal.value = data.itemOrdinal?.toString();
                }
            }
            if(fields.klinike){
                fields.klinike.value = JSON.stringify(data.klinika)
            }
            if(fields.date){
                fields.date.value = date;
            }
            if(fields.category){
                fields.category.value = category.toString();
            }
            if(fields.vozac){
                if (shift === 1) {
                    const vozac = data.linija?.vozaci?.["1"];
                    if (fields.vozac) {
                        fields.vozac.value = vozac !== undefined ? `${vozac.ime} ${vozac.prezime}` : "";
                    }
                } else {
                    const vozac = data.linija?.vozaci?.["2"];
                    if (fields.vozac) {
                        fields.vozac.value = vozac !== undefined ? `${vozac.ime} ${vozac.prezime}` : "";
                    }
                }
            }
            if(fields.vozilo){
                fields.vozilo.value = data.linija?.vozilo
            }
            
            console.log("fields", fields)
            
            await window.electronApp.fillABsoftForm(windowInfo?.title || "", fields);


        } catch (error) {
            console.log("error", error);
        }
    };

    const getEvenOddTura = (id:number, dostavneTure:DostavnaTura[]) => {
        const tura = pronadjiTuruZaKliniku(id,dostavneTure);
        if(tura) 
            return Number(tura.id) % 2
     }


    
    // Prikaz loading state-a
    if (loading) {
        return <div>Učitavanje podataka...</div>;
    }

    return(
    <>
    <h1>Autofill</h1>
    
    {/* Opciono: prikaz podataka za debugging */}
    <div className="m-3">
        <select
            id="category"
            className={`form-select ${errors.category ? 'is-invalid' : ''}`}
            {...register('category', {
                required: 'Izaberi obrok',
                valueAsNumber: true,
                validate: (value) =>
                [1, 2, 3].includes(value) || 'Izaberi validan obrok',
            })}
        >
            <option value="">-- Izaberi obrok --</option>
            <option value={1}>Doručak</option>
            <option value={2}>Ručak</option>
            <option value={3}>Večera</option>
        </select>
        {errors.category && (<div className="invalid-feedback">{errors.category.message}</div>)}
    </div>
    <div>
        {/* Datum */}
        <div className="mb-2">
        <input
            type="date"
            id="date"
            {...register('date', {required: 'Selektuj datum'})}
        />
        {errors.date && (
            <div className="invalid-feedback">{errors.date.message}</div>
        )}
        </div>
    </div>
    <div className="mb-2">
        <select 
            id="shift"
            className={`form-select ${errors.shift ? 'is-invalid' : ''}`}
            {...register('shift', {
                required: 'Izaberi smenu', 
                valueAsNumber: true,
                validate: (value) => [1,2].includes(value) || 'Izaberi validnu smenu'
            })}
        >
            <option value="">-- Izaberi smenu --</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
        </select>
    </div>

      <ul className="list-group mt-4">
        {klinikeSaLinijama.map((klinika) => (
            <li key={klinika.id} 
                className={`
                    ${getEvenOddTura(klinika.id, dostavneTure) ? "darker-background" : "lighter-background" } 
                    ${!clickedClinics.includes(klinika.id) ? "" : "lighter-color"}
                    lista-klinika list-group-item mb-2
                    `} 
                onClick={()=>sendData(klinika)}
            >
                {klinika.naziv.toUpperCase()}
            </li>
        ))}
      </ul>
    </>
    );
};

export default AutomationForm;