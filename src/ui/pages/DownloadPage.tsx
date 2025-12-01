import { useEffect, useState } from 'react'; 
import { useForm } from 'react-hook-form';
import { useSession } from '../context/sessionContext';
import { useNavigate } from 'react-router';
import { DostavnaTura, DownloadShippingDocsParams } from '../types';
import ConfirmModal from '../components/confirmModal';

const DownloadPage = ()=>{
    type FormValues = {
        groupId:number,
        category: 1 | 2 | 3;
        date: string;
      };
    
      const form = useForm<FormValues>({
        defaultValues: {
          category: 1,
          groupId: 0,
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
      const[klinikeVanRfzo,setKlinikeVanRfzo] = useState([]);
      const[klinikeVanRfzoDate, setKlinikeVanRfzoDate] = useState<string | null>(null);
      const[dostavneTure,setDostavneTure] = useState<DostavnaTura[]|null>(null);
      const[showMessage,setShowMessage] = useState<boolean>(false);
      const { register, handleSubmit, formState, watch, setValue } = form;
      const { errors } = formState;
      const {session} = useSession();
      const navigate = useNavigate();
    
      const watchDate = watch("date");
    
      // Funkcija za formatiranje datuma u DD-MM-YYYY format
      const formatDate = (date: string | null) => {
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
            const dostavneTure = await window.electronApp.readJsonFile("dostavneTure.json")
            const vrfzoKlinikeData = await window.electronApp.readJsonFile("klinikeVanRfzo.json")
            setKlinike(klinikeData)
            setKlinikeVanRfzo(vrfzoKlinikeData.clinics ?? [])
            setKlinikeVanRfzoDate(vrfzoKlinikeData.date ?? null)
            setDostavneTure(dostavneTure?.ture || [])
          }catch(error){
            console.log("Greška pri učitavanju klinika",error)
          }
        }
        fetchData();
      },[])
    
      const downloadShippingDocs = async ({cliniks, url, refererUrl, suffix}:DownloadShippingDocsParams) => {
        // const refererUrl = "https://prochef.rs/hospital/otpremnice.php";
        // const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php";
        const formattedDate = formatDate(watchDate); // Formatiran datum pre slanja
    
        try {
          setLoading(true);
          const logs = await window.electronApp.createFullFolder({
            cliniks,
            url,
            refererUrl,
            category: form.getValues("category"),
            date: formattedDate, // Slanje formatiranog datuma
            session: session,
            groupId: form.getValues("groupId"),
            suffix
          });
          setLoading(false);
          setLogs(logs)
        } catch (error) {
          setLoading(false);
          console.error("Greška pri pozivanju createFullFolder:", error);
        }
      };

    const downloadShippingDocsVrfzo = ()=>{
      const formattedDate = formatDate(watchDate); // Formatiran datum pre slanja
      const klinikeVanRfzoFormattedDate = formatDate(klinikeVanRfzoDate)
      if(formattedDate!==klinikeVanRfzoFormattedDate){
        setShowMessage(true);
      }else{
        downloadShippingDocs({
            cliniks: klinikeVanRfzo,
            url: "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_van_rfzo_v1.php",
            refererUrl: "https://prochef.rs/hospital/otpremnice_van_rfzo.php",
            suffix: "vanRfzo"
        })
      }
    }

    const downloadShippingDocsSpecMeals = async() => {
      const formattedDate = formatDate(watchDate);
      const category = form.getValues("category");
      const specMealsClinicsNames = await window.electronApp.getClinicsWithMeals({
        url: `https://www.prochef.rs/hospital/trebovanje_za_pakovanje.php?date=${formattedDate}&category_id=${category}&firm=-1&user=-1&dk_id=2&poizvod_cat_id=1&order_type=3&print_file_no=-1&stampa=stampa`,
        // refererUrl: "https://prochef.rs/hospital/otpremnice_van_rfzo.php",
        session
      })
      console.log("specMealsClinicsNames",specMealsClinicsNames)
      // const specMealsClinics = getClinicsWithSpecMeals(klinike,specMealsClinicsNames) 
        // downloadShippingDocs({
        //     cliniks: specMealsClinics,
        //     url: "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_van_rfzo_v1.php",
        //     refererUrl: "https://prochef.rs/hospital/otpremnice_van_rfzo.php",
        //     suffix: "Specijalni obrok"
        // }) 
    }

    return(
      <div className=" container-fluid mt-4">
        <h2 className="mb-4">Preuzimanje otpremnica</h2>
        <form noValidate>
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

          <div className="mb-3">
            <select
              id="groupId"
              {...register('groupId', {
                valueAsNumber: true
              })}
            >
              <option value={0}>-- Sve linije --</option>
              {dostavneTure?.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}
            </select>            
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


          {/* Dugme za submit */}
          <div className="mb-3">
            <button 
              type="button" 
              className="btn btn-primary" 
              disabled={loading}
              onClick={handleSubmit(() => downloadShippingDocs({
                cliniks: klinike,
                url: "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php",
                refererUrl: "https://prochef.rs/hospital/otpremnice.php"
              }))}
            >
              Preuzmi otpremnice
            </button>
          </div>
          <div className="mb-3">
            <button 
              type="button" 
              className="btn btn-primary" 
              disabled={loading}
              onClick={handleSubmit(() => downloadShippingDocsVrfzo())}
            >
              Preuzmi van rfzo otpremnice
            </button>
          </div>

          <div className="mb-3">
            <button 
              type="button" 
              className="btn btn-primary" 
              disabled={loading}
              onClick={handleSubmit(() => downloadShippingDocsSpecMeals())}
            >
              Preuzmi specijalni obrok otpremnice
            </button>
          </div>

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

        <ConfirmModal
          show={showMessage}
          onClose={()=>setShowMessage(false)}
          onConfirm={() => downloadShippingDocs({
            cliniks: klinikeVanRfzo,
            url: "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_van_rfzo_v1.php",
            refererUrl: "https://prochef.rs/hospital/otpremnice_van_rfzo.php",
            suffix: "vanRfzo"
          })}
          inform={true}
          message="Datum za dijete van rfzo-a se ne poklapa sa odabranim datumom za preuzimanje otpremnica van rfzo-a! Da li ste sigurni da želite da nastavite?"
        />
      </div>
    )
}

export default DownloadPage