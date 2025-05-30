import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useConfirm } from "../context/confirmContext";

export type Klinika = {
    naziv:string,
    bolnicaApp: string,
    klinikaApp: string,
    bolnica: string,
    klinika: string,
    firm: number,
    user: number
}

const KlinikaDetails = () => {
    const { id } = useParams();
    const [klinika, setKlinika] = useState<Klinika | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const navigate = useNavigate();
    const {confirm} = useConfirm();  


    const { register, handleSubmit, reset, formState: {errors} } = useForm<Klinika>();

    const fetchKlinika = async (id: string | undefined) => {
        try {
            const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
            const selected = data.find(k => k.user === Number(id));
            setKlinika(selected || null);
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
              await window.electronApp.deleteJsonItemById("klinike.json", Number(klinikaId), "user");
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
            const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
            const updatedData = data.map(k => (k.user === Number(id) ? formData : k));
            await window.electronApp.writeJsonFile("klinike.json", updatedData);
            setKlinika(formData);
            setIsEditing(false);
        } catch (error) {
            console.log("Greška pri snimanju fajla", error);
        }
    };

    if (!klinika) return <div>Učitavanje...</div>;

    return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Klinika: {klinika.naziv}</h2>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Naziv:</label>
            <div className="col-sm-8">
                <input
                className={`form-control ${errors.naziv ? 'is-invalid' : ''}`}
                {...register('naziv', { required: 'Naziv je obavezan' })}
                />
                {errors.naziv && (
                <div className="invalid-feedback">{errors.naziv.message}</div>
                )}
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
            <label className="col-sm-4 col-form-label">Klinika:</label>
            <div className="col-sm-8">
                <input
                className={`form-control ${errors.klinika ? 'is-invalid' : ''}`}
                {...register('klinika', { required: 'Klinika je obavezna' })}
                />
                {errors.klinika && (
                <div className="invalid-feedback">{errors.klinika.message}</div>
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

          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">User:</label>
            <div className="col-sm-8">
                <input
                type="number"
                className={`form-control ${errors.user ? 'is-invalid' : ''}`}
                {...register('user', { required: 'User je obavezan' })}
                />
                {errors.user && (
                <div className="invalid-feedback">{errors.user.message}</div>
                )}
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Bolnica App:</label>
            <div className="col-sm-8">
                <input
                className={`form-control ${errors.bolnicaApp ? 'is-invalid' : ''}`}
                {...register('bolnicaApp', { required: 'Bolnica App je obavezna' })}
                />
                {errors.bolnicaApp && (
                <div className="invalid-feedback">{errors.bolnicaApp.message}</div>
                )}
            </div>
          </div>

          <div className="row mb-3">
            <label className="col-sm-4 col-form-label">Klinika App:</label>
            <div className="col-sm-8">
                <input
                className={`form-control ${errors.klinikaApp ? 'is-invalid' : ''}`}
                {...register('klinikaApp', { required: 'Klinika App je obavezna' })}
                />
                {errors.klinikaApp && (
                <div className="invalid-feedback">{errors.klinikaApp.message}</div>
                )}
            </div>
          </div>

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
          <h4 className="mb-3">Detalji o klinici</h4>
          <p><strong>Bolnica:</strong> {klinika.bolnica}</p>
          <p><strong>Klinika:</strong> {klinika.klinika}</p>
          <p><strong>Bolnica App:</strong> {klinika.bolnicaApp}</p>
          <p><strong>Klinika App:</strong> {klinika.klinikaApp}</p>
          <p><strong>Firm:</strong> {klinika.firm}</p>
          <p><strong>User:</strong> {klinika.user}</p>
          <div className="mt-3">
          <button
              className="btn btn-primary me-2"
              onClick={() => setIsEditing(true)}
          >
              Izmeni
          </button>
          <button className="btn btn-danger" onClick={()=>handleDelete("Da li ste sigurni da želite da obrišete ovu kliniku?",klinika,klinika.user)}>
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
