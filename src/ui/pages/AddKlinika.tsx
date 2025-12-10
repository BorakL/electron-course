import { useForm } from "react-hook-form";
import { ClinicItem, Klinika } from "../../ui/types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


const AddKlinika = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Klinika>();
  const navigate = useNavigate();
  const initialErrorObject = {naziv:"",firm:"",userId:"",clinics:""}
  const [allKlinike, setAllKlinike] = useState<Klinika[]>([]);
  const [errorObject, setErrorObject] = useState<{naziv:string,firm:string,userId:string}>(initialErrorObject);

  // ✅ lista klinika {userId, name}
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [newClinicUserId, setNewClinicUserId] = useState("");
  const [newClinicName, setNewClinicName] = useState("");

  useEffect(() => {
    const fetchKlinike = async () => {
      try {
        const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
        setAllKlinike(data);
      } catch (err) {
        console.error("Greška pri učitavanju klinika:", err);
      }
    };
    fetchKlinike();
  }, []);

  const onSubmit = async (data: Klinika) => {
    setErrorObject(initialErrorObject)
    for (const k of allKlinike) {
      if (data.naziv === k.naziv) {
        setErrorObject(prev => ({
          ...prev,
          naziv: "Klinika sa ovim nazivom već postoji u bazi"
        }));
        return; // ✔ stops entire onSubmit function
      }

      if (data.firm === k.firm) {
        setErrorObject(prev => ({
          ...prev,
          firm: "Klinika sa ovim firm-om već postoji u bazi"
        }));
        return;
      }

      if (clinics.some(c => k.klinika.some(obj => Number(Object.keys(obj)[0]) === c.userId))) {
        setErrorObject(prev => ({
          ...prev,
          userId: "Klinika sa ovim user-om već postoji u bazi"
        }));
        return;
      }

      if (clinics.length===0) {
        setErrorObject(prev => ({
          ...prev,
          clinics: "Morate imati minimum jedan user za svaku kliniku"
        }));
        return;
      }
    }

    // 👇 transformacija u oblik [{132:"Zgrada"}, ...]
    const klinikeObjekti = clinics.map(c => ({
      [c.userId]: c.name
    }));

    const newKlinika: Klinika = {
      ...data,
      id: Date.now(),
      klinika: klinikeObjekti
    };

    const updated = [...allKlinike, newKlinika];

    try {
      await window.electronApp.writeJsonFile("klinike.json", updated);
      await window.electronApp.dodajKlinikuUNerasporedjene(newKlinika.id);
      navigate(`/klinike`);
    } catch (err) {
      console.error("Greška pri čuvanju nove klinike:", err);
    }
  };

  const handleAddClinic = () => {
    if (!newClinicUserId || !newClinicName) return;

    const exists = clinics.some(c => c.userId === Number(newClinicUserId));
    if (exists) {
      return;
    }

    setClinics(prev => [
      ...prev,
      {
        userId: Number(newClinicUserId),
        name: newClinicName
      }
    ]);
    setNewClinicUserId("");
    setNewClinicName("");
  };

  const handleRemoveClinic = (userId: number) => {
    setClinics(prev => prev.filter(c => c.userId !== userId));
  };

const errorMessages = Object.keys(errorObject)
  .map((key) => {
    const k = key as keyof typeof errorObject;
    const value = errorObject[k];

    if (!value) return null;

    return (
      <div key={key} className="alert alert-danger" role="alert">
        {value}
      </div>
    );
  });


  return (
    <div className="container mt-5">
      <h2 className="mb-4">Dodaj novu kliniku</h2>
      {
        errorMessages
      }

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Naziv */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Naziv</label>
          <div className="col-sm-10">
            <input
              className="form-control"
              {...register("naziv", {
                required: true,
                pattern: {
                  value: /^[a-zA-Z0-9čćžšđČĆŽŠĐ\s]+$/,
                  message: "Dozvoljeni su samo razmak i slova/brojevi."
                }
              })}
            />
            {errors.naziv && <div className="text-danger">{errors.naziv.message}</div>}
          </div>
        </div>

        {/* Bolnica */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Bolnica</label>
          <div className="col-sm-10">
            <input
              className="form-control"
              {...register("bolnica", { required: true })}
            />
            {errors.bolnica && <div className="text-danger">Ovo polje je obavezno.</div>}
          </div>
        </div>

        {/* Firm */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Firm</label>
          <div className="col-sm-10">
            <input
              type="number"
              className="form-control"
              {...register("firm", { required: true, valueAsNumber: true })}
            />
            {errors.firm && <div className="text-danger">Ovo polje je obavezno.</div>}
          </div>
        </div>

        {/* CLINIC OBJECTS */}
        <h5>UserIds</h5>

        {clinics.map((c) => (
          <div key={c.userId} className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-info text-dark">
              {c.userId} — {c.name}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => handleRemoveClinic(c.userId)}
            >
              Remove
            </button>
          </div>
        ))}

        <div className="row g-2 mb-3">
          <div className="col">
            <input
              type="number"
              className="form-control"
              placeholder="User ID"
              value={newClinicUserId}
              onChange={(e) => setNewClinicUserId(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Naziv klinike"
              value={newClinicName}
              onChange={(e) => setNewClinicName(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-success"
              onClick={handleAddClinic}
            >
              + Add klinika
            </button>
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-primary">
            Sačuvaj
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddKlinika;
