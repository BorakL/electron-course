import { useEffect, useState } from 'react'; 
import { useForm } from 'react-hook-form';
import { useSession } from '../context/sessionContext';
import { useNavigate } from 'react-router';

const DownloadPage = ()=>{
    type FormValues = {
        category: 1 | 2 | 3;
        date: string;
      };
    
      const form = useForm<FormValues>({
        defaultValues: {
          category: 1,
          date: ""
        },
      });
      type Logs = {
        status: string;
        downloads: string[];
        failedDownloads: string[];
      };
    
      const[logs,setLogs] = useState<Logs | null>(null);
      const[loading,setLoading] = useState(false);
      const[klinike,setKlinike] = useState([]);
      const { register, handleSubmit, formState, watch, setValue } = form;
      const { errors } = formState;
      const {session} = useSession();
      const navigate = useNavigate();
    
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

      useEffect(()=> {
        const fetchData = async()=>{
          try{
            const klinikeData = await window.electronApp.readJsonFile("klinike.json")
            setKlinike(klinikeData)
          }catch(error){
            console.log("Greška pri učitavanju klinika",error)
          }
        }
        fetchData();
      },[])
    
      const onSubmit = () => {
        downloadShippingDocs();
      };
    
      const downloadShippingDocs = async () => {
        const refererUrl = "https://prochef.rs/hospital/otpremnice.php";
        const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php";
        const formattedDate = formatDate(watchDate); // Formatiran datum pre slanja
    
        try {
          setLoading(true);
          const logs = await window.electronApp.createFullFolder({
            cliniks: klinike,
            url,
            refererUrl,
            category: form.getValues("category"),
            date: formattedDate, // Slanje formatiranog datuma
            session: session
          });
          setLoading(false);
          setLogs(logs)
        } catch (error) {
          setLoading(false);
          console.error("Greška pri pozivanju createFullFolder:", error);
        }
      };

    return(
      <div className=" container-fluid mt-4">
        <h2 className="mb-4">Download otpremnica</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Obrok */}
          <div className="mb-3">
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
            {errors.category && (
              <div className="invalid-feedback">{errors.category.message}</div>
            )}
          </div>

          {/* Datum */}
          <div className="mb-3">
            <input
              type="date"
              id="date"
              {...register('date', {
                required: 'Selektuj datum',
              })}
            />
            {errors.date && (
              <div className="invalid-feedback">{errors.date.message}</div>
            )}
          </div>

          {/* PHPSESSID       
          <div className="mb-3">
            <label htmlFor="session" className="form-label">
              PHPSESSID:
            </label>
            <input
              type="text"
              id="session"
              className={`form-control ${errors.session ? 'is-invalid' : ''}`}
              {...register('session', {
                required: 'Unesi PHPSESSID',
              })}
            />
            {errors.session && (
              <div className="invalid-feedback">{errors.session.message}</div>
            )}
          </div>
          */}

          {/* Dugme za submit */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Downloaduj otpremnice
          </button>
        </form>
        <div>
          {loading && (
            <div className="mt-4">
              <p>⏳ Preuzimanje u toku...</p>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {logs && (
          <div className="mt-4">
            <h5>📋 Rezultat preuzimanja:</h5>
            <p><strong>Status:</strong> {logs.status}</p>

            {logs.downloads.length > 0 && (
              <div>
                <p><strong>✅ Uspešno preuzete klinike:</strong></p>
                <ul>
                  {logs.downloads.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

            { logs.failedDownloads && logs.failedDownloads.length > 0 &&
                <div>
                  <p className="text-danger"><strong>❌ Greška pri preuzimanju:</strong></p>
                  <ul>
                    {logs.failedDownloads.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </div>
            }

            {
              logs.status === "INVALID_SESSION" && 
              <button onClick={()=>navigate("/login")}>Prijavi se</button>
            }
          </div>
          )}
        </div>
      </div>
    )
}

export default DownloadPage