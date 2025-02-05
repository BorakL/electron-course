import { useEffect } from 'react' 
import './App.css'
import klinike from "./../../data/klinike.json";
import {useForm} from 'react-hook-form';

function App() {
  type FormValues = {
    category: 1 | 2 | 3,
    date: string,
    session: string
  }
  const form = useForm<FormValues>({
    defaultValues: {
      category: 1,
      date: "",
      session: ""
    }
  });
  const {register, handleSubmit, formState, getValues} = form;
  const {errors} = formState;

  const onSubmit = () => {
    downloadShippingDocs()
  }
 
  useEffect(()=>{
    
  },[])

  const downloadShippingDocs = async () => {
    const refererUrl = "https://prochef.rs/hospital/otpremnice.php"
    const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php" 
    const {category, date, session} = getValues();
    try{
      await window.electronApp.createFullFolder({
          cliniks: klinike,
          url,
          refererUrl,
          category,
          date,
          session
        })
    }catch(error){
      console.error("Greška pri pozivanju createFullFolder:", error)
    }
  }

  return (
    <div className='App'>
      <div>
        <form onSubmit = {handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="category">Obrok: </label> 
            <select {...register("category", {
                required: {
                  value: true,
                  message: "Izaberi obrok"
                },
                valueAsNumber: true,
                validate: value => [1,2,3].includes(value)  || 'Izaberi validan obrok'
              })}
            >
              <option value={1}>Doručak</option>
              <option value={2}>Ručak</option>
              <option value={3}>Večera</option>
            </select>
            <p>{errors.category?.message}</p>
          </div>
          <div>
            <label htmlFor="data">Datum: </label>
            <input 
              type="date" 
              id="date" 
              {...register("date", {
                required: {
                  value: true,
                  message: "Selektujt datum"
                }
              })} />
              <p>{errors.date?.message}</p> 
          </div>      
          <div>
            <label htmlFor="session">PHPSESSID: </label>
            <input 
              type="text" 
              id="session" 
              {...register("session", {
                required: {
                  value: true,
                  message: "Unesi PHPSESSID"
                }
              })} />
              <p>{errors.session?.message}</p>
          </div>
          <div>
            <button>Downloaduj otpremnice</button>
          </div>
        </form>
      </div> 
    </div>
  )
}

export default App
