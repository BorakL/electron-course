import { useEffect, useState } from "react";
import { useConfirm } from "../context/confirmContext";
import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { FaTruck } from "react-icons/fa";


type Klinika = {
  user: number;
  naziv: string;
};

type TureData = {
  ture: {
    id: number;
    klinike: number[];
  }[];
  nerasporedjeneKlinike: number[];
};

export default function ListaDostavnihTura() {
  const [tureData, setTureData] = useState<TureData | null>(null);
  const [klinike, setKlinike] = useState<Klinika[]>([]);
  const [loading, setLoading] = useState(true);
  const {confirm} = useConfirm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tureJson, klinikeJson] = await Promise.all([
          window.electronApp.readJsonFile("dostavneTure.json") as Promise<TureData>,
          window.electronApp.readJsonFile("klinike.json") as Promise<Klinika[]>,
        ]);

        setTureData(tureJson);
        setKlinike(klinikeJson);
      } catch (error) {
        console.error("Greška pri učitavanju podataka:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getNazivKlinike = (id: number): string =>
    klinike.find(k => k.user === id)?.naziv || `Nepoznata klinika (${id})`;

  const removeClinickHandler = async (message: string, tourId:number, clinickId:number) => {
    confirm({
      message: message,
      onConfirm: async()=>{
        try {
              await window.electronApp.ukloniKlinikuIzTure(tourId, clinickId);

          // Ažuriraj lokalni state bez direktne modifikacije
          setTureData(prev => {
            if (!prev) return prev;

            const updatedTure = prev.ture.map(t => {
                if (t.id === tourId) {
                  return {
                    ...t,
                    klinike: t.klinike.filter(k => k !== clinickId),
                  };
                }
                return t;
              });

              return {
                ...prev,
                ture: updatedTure,
                nerasporedjeneKlinike: [...prev.nerasporedjeneKlinike, clinickId],
              };
            });
          } catch (error) {
            console.error("Greška pri uklanjanju klinike:", error);
          }
      }
    })
  }

  const handleAddClinicToTour = async (tourId: number, klinikaId: number) => {
  try {
    await window.electronApp.dodajKlinikuUTuru(tourId, klinikaId);

    setTureData(prev => {
      if (!prev) return prev;

      const updatedTure = prev.ture.map(t => {
        if (t.id === tourId) {
          return {
            ...t,
            klinike: [...t.klinike, klinikaId],
          };
        }
        return t;
      });

      const updatedNerasporedjene = prev.nerasporedjeneKlinike.filter(id => id !== klinikaId);

      return {
        ...prev,
        ture: updatedTure,
        nerasporedjeneKlinike: updatedNerasporedjene,
      };
    });
  } catch (error) {
    console.error("Greška pri dodavanju klinike u turu:", error);
  }
};

const removeTuraHandler = async (message:string, id:number) => 
  confirm({
    message: message,
    onConfirm: async() => {
      try{
        await window.electronApp.obrisiTuru(id)
        setTureData(prev => {
          if (prev === null) return null;
          const tura = prev.ture.find(t=>t.id===id)
          return  {
            ...prev,
            ture: prev.ture.filter(t => t.id!==id),
            nerasporedjeneKlinike: [...prev.nerasporedjeneKlinike, ...(tura?.klinike || []) ]
          }
        })
      }catch(error){
        console.log("Greška pri brisanju linije za razvoz: ", error)
      }
    }  
  })

const addTuraHandler = async () => {
  try{
    const id = await window.electronApp.dodajNovuTuru();
    setTureData(prev => {
      if(prev===null) return null;
      return { ture: [...prev.ture,{id,klinike:[]}], nerasporedjeneKlinike: prev.nerasporedjeneKlinike }
    })
  }catch(error){
    console.log("Greška pri dodavanju ture: ", error)
  }
}


  if (loading || !tureData) return <p>Učitavanje...</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Linije za razvoz</h2>

      <div className="row">
        {tureData.ture.map((tura) => (
          <div key={tura.id} className="col-md-6 mb-4">
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><FaTruck/></h5>
                <div>
                  <button 
                    className="btn btn-sm btn-danger"
                    title="Obriši liniju za razvoz"
                    onClick={()=>removeTuraHandler("Da li ste sigurni da želite da obrišete ovu liniju za razvoz?", tura.id)}>
                      <FaRegTrashAlt/>
                  </button>
                </div>
              </div>
              <div className="card-body">
                {tura.klinike.length > 0 ? (
                  <ul className="list-group mb-3">
                    {tura.klinike.map((id) => (
                      <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                        {getNazivKlinike(id)}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Izbaci kliniku"
                          onClick={() => removeClinickHandler("Da li ste sigurni da želite da izbacite ovu kliniku iz navedene linije za razvoz?", tura.id, id)}
                        >
                          <IoIosLogOut/>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted fst-italic">Tura je prazna</p>
                )}

                <select
                  className="form-select"
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    if (selectedId) {
                      handleAddClinicToTour(tura.id, selectedId);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Dodaj kliniku u ovu turu...</option>
                  {tureData.nerasporedjeneKlinike.map((id) => (
                    <option key={id} value={id}>
                      {getNazivKlinike(id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div>
          <button className="btn btn-primary m-3" onClick={addTuraHandler}>Dodaj novu liniju za razvoz</button>
        </div>
        <h4 className="text-danger">Neraspoređene klinike</h4>
        {tureData.nerasporedjeneKlinike.length > 0 ? (
          <ul className="list-group mt-2">
            {tureData.nerasporedjeneKlinike.map((id) => (
              <li key={id} className="list-group-item">
                {getNazivKlinike(id)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted fst-italic mt-2">Nema neraspoređenih klinika</p>
        )}
      </div>
    </div>
  );
}
