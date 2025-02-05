import { useEffect } from 'react';
import './App.css';
import klinike from "./../../data/klinike.json";
import { useForm } from 'react-hook-form';

function App() {
  type FormValues = {
    category: 1 | 2 | 3;
    date: string;
    session: string;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      category: 1,
      date: "",
      session: "",
    },
  });

  const { register, handleSubmit, formState, watch, setValue } = form;
  const { errors } = formState;

  const watchDate = watch("date");

  // Funkcija za formatiranje datuma u DD-MM-YYYY format
  const formatDate = (date: string) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`; // YYYY-MM-DD ➝ DD-MM-YYYY
  };

  // Kad se datum promeni, ažuriraj format prikaza u input polju
  useEffect(() => {
    if (watchDate) {
      const [year, month, day] = watchDate.split("-");
      setValue("date", `${year}-${month}-${day}`, { shouldValidate: true });
    }
  }, [watchDate, setValue]);

  const onSubmit = () => {
    downloadShippingDocs();
  };

  const downloadShippingDocs = async () => {
    const refererUrl = "https://prochef.rs/hospital/otpremnice.php";
    const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php";
    const formattedDate = formatDate(watchDate); // Formatiran datum pre slanja

    try {
      await window.electronApp.createFullFolder({
        cliniks: klinike,
        url,
        refererUrl,
        category: form.getValues("category"),
        date: formattedDate, // Slanje formatiranog datuma
        session: form.getValues("session"),
      });
    } catch (error) {
      console.error("Greška pri pozivanju createFullFolder:", error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="category">Obrok: </label>
          <select
            {...register("category", {
              required: { value: true, message: "Izaberi obrok" },
              valueAsNumber: true,
              validate: (value) => [1, 2, 3].includes(value) || "Izaberi validan obrok",
            })}
          >
            <option value={1}>Doručak</option>
            <option value={2}>Ručak</option>
            <option value={3}>Večera</option>
          </select>
          <p>{errors.category?.message}</p>
        </div>

        <div>
          <label htmlFor="date">Datum: </label>
          <input
            type="date"
            id="date"
            {...register("date", { required: { value: true, message: "Selektuj datum" } })}
          />
          <p>{errors.date?.message}</p>
        </div>

        <div>
          <label htmlFor="session">PHPSESSID: </label>
          <input
            type="text"
            id="session"
            {...register("session", { required: { value: true, message: "Unesi PHPSESSID" } })}
          />
          <p>{errors.session?.message}</p>
        </div>

        <div>
          <button type="submit">Downloaduj otpremnice</button>
        </div>
      </form>
    </div>
  );
}

export default App;
