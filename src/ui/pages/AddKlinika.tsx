import { useForm } from "react-hook-form";
import { ClinicItem, Klinika } from "../../ui/types.ts";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


const AddKlinika = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Klinika>();
  const navigate = useNavigate();

  const [allKlinike, setAllKlinike] = useState<Klinika[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userIds, setUserIds] = useState<number[]>([]);

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
    const duplicate = allKlinike.find(k =>
      k.naziv === data.naziv ||
      userIds.some(u =>
        k.clinics.some(obj => Number(Object.keys(obj)[0]) === u)
      )
    );

    if (duplicate) {
      setErrorMessage("Klinika sa ovim user ID-jem ili nazivom već postoji.");
      return;
    }

    // 👇 transformacija u oblik [{132:"Zgrada"}, ...]
    const klinikeObjekti = clinics.map(c => ({
      [c.userId]: c.name
    }));

    const newKlinika: Klinika = {
      ...data,
      id: Date.now(),
      clinics: klinikeObjekti
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

  const handleRemoveUserId = (u: number) => {
    setUserIds(prev => prev.filter(id => id !== u));
  };

  const handleAddClinic = () => {
    if (!newClinicUserId || !newClinicName) return;

    const exists = clinics.some(c => c.userId === Number(newClinicUserId));
    if (exists) {
      alert("Ovaj userId već postoji!");
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

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Dodaj novu kliniku</h2>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

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


        {/* USER ID LIST */}
        {userIds.map(u => (
          <div key={u} className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-secondary">{u}</span>
            <button type="button" className="btn btn-sm btn-danger" onClick={() => handleRemoveUserId(u)}>
              Remove
            </button>
          </div>
        ))}

        {/* CLINIC OBJECTS */}
        <h5>Klinike</h5>

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
