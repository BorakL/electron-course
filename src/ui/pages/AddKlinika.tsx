import { useForm } from "react-hook-form";
import { Klinika } from "../../ui/types.ts";
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
      await window.electronApp.dodajKlinikuUNerasporedjene(newKlinika.user)
      navigate(`/klinike`);
    } catch (err) {
      console.error("Greška pri čuvanju nove klinike:", err);
    }
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
    {/* Polje: Naziv */}
    <div className="row mb-2 align-items-center">
      <label className="col-sm-2 col-form-label">Naziv</label>
      <div className="col-sm-10">
        <input
          className="form-control"
          {...register("naziv", { required: true })}
        />
        {errors.naziv && <div className="text-danger">Ovo polje je obavezno.</div>}
      </div>
    </div>

    {/* Polje: Bolnica App */}
    <div className="row mb-2 align-items-center">
      <label className="col-sm-2 col-form-label">Bolnica App</label>
      <div className="col-sm-10">
        <input
          className="form-control"
          {...register("bolnicaApp", { required: true })}
        />
        {errors.bolnicaApp && <div className="text-danger">Ovo polje je obavezno.</div>}
      </div>
    </div>

    {/* Polje: Klinika App */}
    <div className="row mb-2 align-items-center">
      <label className="col-sm-2 col-form-label">Klinika App</label>
      <div className="col-sm-10">
        <input
          className="form-control"
          {...register("klinikaApp", { required: true })}
        />
        {errors.klinikaApp && <div className="text-danger">Ovo polje je obavezno.</div>}
      </div>
    </div>

    {/* Polje: Bolnica */}
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

    {/* Polje: Klinika */}
    <div className="row mb-2 align-items-center">
      <label className="col-sm-2 col-form-label">Klinika</label>
      <div className="col-sm-10">
        <input
          className="form-control"
          {...register("klinika", { required: true })}
        />
        {errors.klinika && <div className="text-danger">Ovo polje je obavezno.</div>}
      </div>
    </div>

    {/* Polje: Firm */}
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

    {/* Polje: User */}
    <div className="row mb-2 align-items-center">
      <label className="col-sm-2 col-form-label">User ID</label>
      <div className="col-sm-10">
        <input
          type="number"
          className="form-control"
          {...register("user", { required: true, valueAsNumber: true })}
        />
        {errors.user && <div className="text-danger">Ovo polje je obavezno.</div>}
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
