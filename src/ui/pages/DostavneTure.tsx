import { useEffect, useState } from "react";

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

  const removeClinickHandler = async (tourId:number,clinickId:number) => {
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


  if (loading || !tureData) return <p>Učitavanje...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Dostavne Ture</h2>

      {tureData.ture.map(tura => (
        <div key={tura.id} className="mb-5 border rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-2">Tura #{tura.id}</h3>
          <ul className="list-disc pl-6">
            {tura.klinike.length > 0 ? (
              tura.klinike.map(id => (
                <li key={id}>{getNazivKlinike(id)} <button onClick={()=>removeClinickHandler(tura.id,id)}>Obriši</button></li>
              ))
            ) : (
              <li className="italic text-gray-500">Tura je prazna</li>
            )}
          </ul>
          <select
            className="mt-2 border rounded px-2 py-1"
            onChange={e => {
              const selectedId = Number(e.target.value);
              if (selectedId) {
                handleAddClinicToTour(tura.id, selectedId);
                e.target.value = "";
              }
            }}
          >
            <option value="">Dodaj kliniku u ovu turu...</option>
            {tureData.nerasporedjeneKlinike.map(id => (
              <option key={id} value={id}>
                {getNazivKlinike(id)}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-2 text-red-600">Neraspoređene klinike</h3>
        <ul className="list-disc pl-6">
          {tureData.nerasporedjeneKlinike.length > 0 ? (
            tureData.nerasporedjeneKlinike.map(id => (
              <li key={id}>{getNazivKlinike(id)}</li>
            ))
          ) : (
            <li className="italic text-gray-500">Nema neraspoređenih klinika</li>
          )}
        </ul>
      </div>
    </div>
  );
}
