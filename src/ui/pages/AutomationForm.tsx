import { useEffect, useState } from "react";
import { DostavnaTura, Klinika, KlinikaSaLinijom } from "../types";
import { Field } from "react-hook-form";

const AutomationForm = () => {
    const [klinike, setKlinike] = useState<Klinika[]>([]);
    const [dostavneTure, setDostavneTure] = useState<DostavnaTura[]>([]);
    const [fields, setFields] = useState<Field[]>([]);
    const [klinikeSaLinijama, setKlinikeSaLinijama] = useState<(KlinikaSaLinijom | Klinika)[]>([]);
    const [loading, setLoading] = useState(true); // Dodaj loading state

    const pronadjiTuruZaKliniku = (
        userId: number,
        dostavneTure: DostavnaTura[]
    ): DostavnaTura | null => {
        if (!Array.isArray(dostavneTure)) return null;
        
        for (const tura of dostavneTure) {
            if (tura.klinike && Array.isArray(tura.klinike) && tura.klinike.includes(userId)) {
                return tura;
            }
        }
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Učitaj klinike
                const klinikeData = await window.electronApp.readJsonFile("klinike.json");
                console.log("klinike", klinikeData);
                
                // Učitaj dostavne ture
                const tureData = await window.electronApp.readJsonFile("dostavneTure.json");
                console.log("dostavneTure", tureData);

                // Učitaj polja
                const fieldsData = await window.electronApp.readJsonFile("fields.json")
                setFields(fieldsData)
                console.log("fields", fields)
                
                // Proveri i setuj klinike
                if (Array.isArray(klinikeData)) {
                    setKlinike(klinikeData);
                } else {
                    console.error("klinike.json nije niz:", klinikeData);
                    setKlinike([]);
                }
                
                // Proveri i setuj ture (važno: tvoj fajl ima strukturu { ture: [...] })
                let tureArray = [];
                if (tureData && tureData.ture && Array.isArray(tureData.ture)) {
                    tureArray = tureData.ture;
                } else if (Array.isArray(tureData)) {
                    tureArray = tureData;
                } else {
                    console.error("dostavneTure.json nije u očekivanom formatu:", tureData);
                    tureArray = [];
                }
                setDostavneTure(tureArray);
                
            } catch (error) {
                console.log("Greška prilikom učitavanja podataka", error);
                setKlinike([]);
                setDostavneTure([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    useEffect(() => {
        // Ne radi ništa dok se podaci ne učitaju ili ako nema podataka
        if (loading) return;
        if (!klinike.length && !dostavneTure.length && !fields.length) return;
        if (!Array.isArray(klinike) || !Array.isArray(dostavneTure)) return;
        
        console.log("Obrada podataka - klinike:", klinike.length, "ture:", dostavneTure.length);
        
        try {
            const data: (KlinikaSaLinijom | Klinika)[] = klinike.map((klinika: Klinika) => {
                const linija = pronadjiTuruZaKliniku(klinika.id, dostavneTure);
                if (linija) {
                    return { ...klinika, linija };
                } else {
                    return klinika;
                }
            });
            
            // Sortiranje
            const sortirano = data.sort((a, b) => {
                const aHasLinija = 'linija' in a;
                const bHasLinija = 'linija' in b;
                
                if (!aHasLinija && !bHasLinija) return 0;
                if (!aHasLinija) return 1;
                if (!bHasLinija) return -1;
                
                return (a as KlinikaSaLinijom).linija.id - (b as KlinikaSaLinijom).linija.id;
            });
            
            console.log("Sortirano uspešno:", sortirano);
            setKlinikeSaLinijama(sortirano);
            
        } catch (error) {
            console.error("Greška pri obradi podataka:", error);
        }
        
    }, [klinike, dostavneTure, loading]);

    const sendData = async () => {
        try {
            await window.electronApp.fillABsoftForm("AB Soft", fields);
        } catch (error) {
            console.log("error", error);
        }
    };

    
//Ovde bi sad treba da napravim funkiju koja se poziva klikom na neki od itema klinika sa linijama. Funkcija šalje podatke serveru (programu pisanom u C# koji vrši popunjavanje forme, koristi Window.Automation). Prihvata request u sledećem obliku: public class FillFormRequest
// {
//     public string WindowTitle { get; set; } = "";
// 	public Dictionary<string, FormField>? Fields { get; set; }
// }
//Dakle funkcija trebad da pošalje serveru naziv prozora, i polja forme, koja izgledaju recimo ovako:
// {
//   "proba": {
//     "title": "proba",
//     "name": "asdf",
//     "type": "Dropdown",
//     "ordinal": "",
//     "itemOrdinal": "",
//     "delayAfter": "",
//     "mode": ""
//   },
//   "proba2": {
//     "title": "proba2",
//     "name": "asdfxc",
//     "type": "Dropdown",
//     "ordinal": "",
//     "itemOrdinal": "",
//     "delayAfter": "",
//     "mode": ""
//   }
// }
//Samo što sad u ove objekte treba da umetnemo value i ponegde ako treba itemOrdinal vrednosti. A njih uzimamo iz objekata klinika koji izgleda recimo ovako:
//  {
//     "id": 1761158260580,
//     "naziv": "VALJEVO",
//     "bolnica": "ZDRAVSTVENI CENTAR VALJEVO",
//     "klinika": {
//       "694": "OPŠTA"
//     },
//     "firm": 60,
//     "linija":{
//       "id": 1,
//       "klinike": [
//         1761158260580
//       ],
//       "broj": "1",
//       "vozilo": {
//         "registracija":"BG234",
//         "model":"asdf"
//       },
//       "vozači": {
//         "1": "Pera Peric",
//         "2": "Marko Maric"
//       }
//     }
//   }

    
    // Prikaz loading state-a
    if (loading) {
        return <div>Učitavanje podataka...</div>;
    }

    return(
    <>
    <h1>AutomationForm</h1>
    
    {/* Opciono: prikaz podataka za debugging */}
      <ul className="list-group mb-4">
        {klinikeSaLinijama.map((klinika) => (
          <li key={klinika.id} className="list-group-item mb-2" onClick={()=>sendData()}>
              {klinika.naziv.toUpperCase()}
          </li>
        ))}
      </ul>
    </>
    );
};

export default AutomationForm;