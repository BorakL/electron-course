import { useForm } from "react-hook-form";
import { Klinika } from "../../shared/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AddKlinika = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Klinika>();
  const navigate = useNavigate();
  const [allKlinike, setAllKlinike] = useState<Klinika[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    const duplicate = allKlinike.find(k => k.user === data.user || k.naziv === data.naziv);

    if (duplicate) {
      setErrorMessage("Klinika sa ovim korisničkim ID-jem ili nazivom već postoji.");
      return; // prekini submit
    }

    const newKlinika: Klinika = { ...data };
    const updated = [...allKlinike, newKlinika];

    try {
      await window.electronApp.writeJsonFile("klinike.json", updated);
      navigate(`/klinike`);
    } catch (err) {
      console.error("Greška pri čuvanju nove klinike:", err);
    }
  };

  return (
    <div>
      <h2>Dodaj novu kliniku</h2>

      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Naziv</label>
          <input {...register("naziv", { required: true })} />
          {errors.naziv && <span>Ovo polje je obavezno.</span>}
        </div>

        <div>
          <label>Bolnica App</label>
          <input {...register("bolnicaApp", { required: true })} />
          {errors.bolnicaApp && <span>Ovo polje je obavezno.</span>}
        </div>

        <div>
          <label>Klinika App</label>
          <input {...register("klinikaApp", { required: true })} />
          {errors.klinikaApp && <span>Ovo polje je obavezno.</span>}
        </div>

        <div>
          <label>Bolnica</label>
          <input {...register("bolnica", { required: true })} />
          {errors.bolnica && <span>Ovo polje je obavezno.</span>}
        </div>

        <div>
          <label>Klinika</label>
          <input {...register("klinika", { required: true })} />
          {errors.klinika && <span>Ovo polje je obavezno.</span>}
        </div>

        <div>
          <label>Firm</label>
          <input type="number" {...register("firm", { required: true, valueAsNumber: true })} />
          {errors.firm && <span>Ovo polje je obavezno.</span>}
        </div>

        <div>
          <label>User ID</label>
          <input type="number" {...register("user", { required: true, valueAsNumber: true })} />
          {errors.user && <span>Ovo polje je obavezno.</span>}
        </div>

        <button type="submit">Sačuvaj</button>
      </form>
    </div>
  );
};

export default AddKlinika;
