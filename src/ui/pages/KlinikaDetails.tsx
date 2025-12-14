import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useConfirm } from "../context/confirmContext";
import { ClinicItem, Klinika, KlinikaItem } from "../types";
import UserIds from "../components/userIds";

const KlinikaDetails = () => {
    const { id } = useParams();
    const [klinika, setKlinika] = useState<Klinika | null>(null);
    const [clinics, setClinics] = useState<ClinicItem[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const navigate = useNavigate();
    const {confirm} = useConfirm();  


    const { register, handleSubmit, reset, formState: {errors} } = useForm<Klinika>();

    const fetchKlinika = async (id: string | undefined) => {
        try {
            const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
            const selected = data.find(k => Number(k.id) === Number(id));
            setKlinika(selected || null);

            setClinics(converObject(selected?.klinika || []))
            
            if (selected) {
                reset(selected); // popunjavamo formu default vrednostima
            }
        } catch (error) {
            console.log("Greška pri učitavanju fajla", error);
        }
    };


    const handleDelete = async (message:string, klinika:Klinika, klinikaId:number) => {
      confirm({
        message: message,
        onConfirm: async()=>{
          if (!klinika) return;
          try {
              await window.electronApp.deleteJsonItemById("klinike.json", Number(klinikaId), "id");
              await window.electronApp.ocistiNevazecuKlinikuIzTura(Number(klinikaId));
              navigate("/klinike");
          } catch (error) {
              console.error("Greška pri brisanju klinike:", error);
          }
        }
      })

    };


    useEffect(() => {
        fetchKlinika(id);
    }, []);

const onSubmit = async (formData: Klinika) => {
  try {
    const data: Klinika[] =
      await window.electronApp.readJsonFile("klinike.json");

    const klinikaObject = clinicsArrayToObject(clinics);

    const finalData: Klinika = {
      ...formData,
      klinika: klinikaObject, // 👈 OVO JE POENTA
    };

    const updatedData = data.map(k =>
      k.id === Number(id) ? finalData : k
    );

    await window.electronApp.writeJsonFile("klinike.json", updatedData);

    setKlinika(finalData);
    setIsEditing(false);
  } catch (error) {
    console.log("Greška pri snimanju fajla", error);
  }
};


    function converObject(map: Record<number, string>): KlinikaItem[] {
      return Object.entries(map).map(([userId, name]) => ({
        userId: +userId,
        name,
      }));
    };

    function clinicsArrayToObject(
      clinics: { userId: number; name: string }[]
    ): Record<number, string> {
      return clinics.reduce((acc, c) => {
        acc[c.userId] = c.name;
        return acc;
      }, {} as Record<number, string>);
    }



    if (!klinika) return <div>Učitavanje...</div>;

    return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">{klinika.naziv?.toUpperCase()}</h2>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Naziv:</label>
            <div className="col-sm-8">
                <input
                className={`form-control ${errors.naziv ? 'is-invalid' : ''}`}
                {...register('naziv', { 
                      required: true,
                      pattern: {
                        value: /^[a-zA-Z0-9čćžšđČĆŽŠĐ]+$/,
                        message: "Dozvoljeni su samo alfanumerički karakteri bez razmaka i specijalnih znakova."
                      }  
                 })}
                />
                {errors.naziv && <div className="text-danger">{errors.naziv.message || "Ovo polje je obavezno."}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Bolnica:</label>
            <div className="col-sm-8">
                <input
                className={`form-control ${errors.bolnica ? 'is-invalid' : ''}`}
                {...register('bolnica', { required: 'Bolnica je obavezna' })}
                />
                {errors.bolnica && (
                <div className="invalid-feedback">{errors.bolnica.message}</div>
                )}
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Firm:</label>
            <div className="col-sm-8">
                <input
                type="number"
                className={`form-control ${errors.firm ? 'is-invalid' : ''}`}
                {...register('firm', { required: 'Firm je obavezan' })}
                />
                {errors.firm && (
                <div className="invalid-feedback">{errors.firm.message}</div>
                )}
            </div>
          </div>

          <UserIds clinics={clinics} setClinics={setClinics} isEditing={true}/>

          <button type="submit" className="btn btn-success me-2">
            Sačuvaj
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditing(false)}
          >
            Otkaži
          </button>
        </form>
      ) : (
    <div className="container mt-4">
      <div className="card p-4">
          <p><strong>Bolnica:</strong> {klinika.bolnica}</p>
          <p><strong>Firm:</strong> {klinika.firm}</p>
          <div>
            <UserIds clinics={clinics} setClinics={setClinics} isEditing={false}/>
          </div>
          <div className="mt-3">
          <button
              className="btn btn-primary me-2"
              onClick={() => setIsEditing(true)}
          >
              Izmeni
          </button>
          <button className="btn btn-danger" onClick={()=>handleDelete("Da li ste sigurni da želite da obrišete ovu kliniku?",klinika,klinika.id)}>
              Obriši
          </button>
          </div>
      </div>
    </div>
    )}
    </div>
    );
};

export default KlinikaDetails;
