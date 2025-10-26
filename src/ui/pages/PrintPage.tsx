import { useEffect, useState } from "react"; 
import { Klinika } from "../types";
import { LuPrinter, LuPrinterCheck } from "react-icons/lu"; 
import { useConfirm } from "../context/confirmContext";

type TureData = {
  ture: {
    id: number;
    klinike: number[];
  }[];
  nerasporedjeneKlinike: number[];
};

export default function PrintPage() {
  const [tureData, setTureData] = useState<TureData | null>(null);
  const [klinike, setKlinike] = useState<Klinika[]>([]);
  const [loading, setLoading] = useState(true); 
  const[folderPath, setFolderPath] = useState<string>("");
  const[showMessage,setShowMessage] = useState<boolean>(false);
  const[printedTours, setPrintedTours] = useState<number[]>([]);
  const[isPrinting, setIsPrinting] = useState<boolean>(false);
  const {confirm} = useConfirm()

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

  useEffect(() => {
    if(folderPath!=="") {
      confirm({
        message: 
        `Pre štampanja, u odabranom folderu:\n ${folderPath}: \n - Za ručak/večeru obriši sve dnevne bolnice \n - Za doručak saberi iznose dnevnih bolnica za ceo dan, za klinike: Valjevo, Nefrologija, B Blok Urologija`,
        inform: true 
      })
    }
  },[folderPath])

  const getNazivKlinike = (id: number): string =>
    klinike.find(k => k.id === id)?.naziv || `Nepoznata klinika (${id})`;

    const handleSelectFolder = async () => {
        const selectedPath = await window.electronApp.selectFolder();
        if (selectedPath) {
            console.log('Odabrani folder:', folderPath);
            setFolderPath(selectedPath)
            setShowMessage(false)
        } else {
            console.log('Izbor foldera je otkazan.');
        }
    };

const handlePrint = async (turaId: number) => {
  try {
    if (folderPath === "") {
      setShowMessage(true);
    } else if (tureData?.ture && klinike) {
      setShowMessage(false);
      setIsPrinting(true); // 🔒 Zaključaj sve štampe
      setPrintedTours(prev => [...prev, turaId]);

      await window.electronApp.printDostavnaTura(folderPath, tureData.ture, klinike, turaId);

      // ⏱ Pauza dok se ne dozvoli novo štampanje
      setIsPrinting(false); // 🔓 Otključaj sve

    }
  } catch (error) {
    console.log("Greška prilikom pokretanja štampe:", error);
    setIsPrinting(false); // U slučaju greške - otključaj
  }
};



  if (loading || !tureData) return <p>Učitavanje...</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Štampanje otpremnica</h2>
        <div className="mb-3">
            <button className="btn btn-primary me-2 m-4" onClick={handleSelectFolder}>
                Selektuj folder
            </button>
            {
              folderPath ? <p className="mt-2"> <strong>Izabrani folder: </strong> {folderPath} </p> :
              showMessage ? <p className="mt-2"> <strong className="text-danger">Prvo selektuj folder sa otpremnicama za štampanje!</strong> </p> : ""
            }
        </div>

      <div className="row">
        {tureData.ture.map((tura) => (
          <div key={tura.id} className="col-md-4 mb-4">
            <button 
              disabled={isPrinting}
              onClick={()=>handlePrint(tura.id)} 
              className={`btn btn-light ${printedTours.includes(tura.id) ? "border border-2" : null}`}
            >
              <div className="mb-2 font">
                {!printedTours.includes(tura.id) ? <LuPrinter/> : <LuPrinterCheck color="red"/>}
              </div>
              <ul className="list-group mb-3">
                {tura.klinike.map((id) => (
                  <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                    {getNazivKlinike(id)?.toUpperCase()}
                  </li>
                ))}
              </ul>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
