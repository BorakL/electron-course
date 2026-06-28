import { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { AktivnaVrednost, AktivnaVrednostVozac, AktivnaVrednostVozilo, DostavnaLinijaSaIzmenama, getAktivnaVrednostProperty, getTransportData, Izmena, VozacFromDb, VoziloFromDb } from "../types";

interface TransportContextType {
    vozaciFromDb: VozacFromDb[],
    vozilaFromDb: VoziloFromDb[],
    linijeSaIzmenama: DostavnaLinijaSaIzmenama[],
    loading: boolean,
    getTransportData: (g:getTransportData)=>void,
    formatirajDanMesecTekst: (s:string)=>string,
    getAktivnaVrednost: (g: getAktivnaVrednostProperty)=>AktivnaVrednost

}

const TransportContext = createContext<TransportContextType | null>(null)

export const TransportProvider = ({ children }: { children: React.ReactNode }) => {
    const [vozilaFromDb, setVozilaFromDb] = useState<VoziloFromDb[]>([]);
    const [vozaciFromDb, setVozaciFromDb] = useState<VozacFromDb[]>([]);
    const [linijeSaIzmenama, setLinijeSaIzmenama] = useState<DostavnaLinijaSaIzmenama[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async()=> {
            //Fečujemo podatke iz baze
            try{
                // VOZAČI
                const vozaciSnapshot = await getDocs(collection(db, "vozaci"))
                const vozaciData: VozacFromDb[] = vozaciSnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        ime: data.ime,
                        prezime: data.prezime
                    }
                })
                vozaciData.sort((a:VozacFromDb,b:VozacFromDb) => a.prezime.localeCompare(b.prezime) )
                setVozaciFromDb(vozaciData)
                
                // VOZILA
                const vozilaSnapshot = await getDocs(collection(db, "vozila"));
                const vozilaData: VoziloFromDb[] = vozilaSnapshot.docs.map(doc => {
                    const data = doc.data()
                    return {
                        id: doc.id,
                        tablice: data.tablice
                    }
                })
                setVozilaFromDb(vozilaData);

                // LINIJE
                const linijeSnapshot = await getDocs(collection(db, "linije"));
                const linijeData: DostavnaLinijaSaIzmenama[] = linijeSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        broj: data.broj,
                        klinike: data.klinike,
                        vozilo: data.vozilo,
                        smene: data.smene,
                        izmene: data.izmene
                    }
                })
                setLinijeSaIzmenama(linijeData);

            } catch(error){
                console.log("Greška pri učitavanju podataka: ", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    },[])


    const getDefaultId = (
    linija: DostavnaLinijaSaIzmenama,
    target: "vozilo" | "vozac",
    smena?: 1|2
    ) => {
    if(target === "vozilo"){
        return linija.vozilo
    }else if(target === "vozac" && smena){
        return linija.smene[smena]
    }else{
        return ""
    }
    };


    //OVDE POSTOJI PROBLEM!!! MORAŠ NAPRAVITI U FIND FUNKCIJI KOD TRAŽENJA DANAS IZMENA I PERIOD IZMENA, DA LI SPOSTOJI I.SMENA, 
    //Ako postoij to znači da se izmena odnosi na vozača. Možda je bolje promeniti u bazi umesto target: vozač | vozilo, da bude vozac1/vozac2/vozilo
    const getAktivnaVrednost = ({
    linija,
    target,
    vozilaMap,
    vozaciMap,
    smena
    }: getAktivnaVrednostProperty): AktivnaVrednost => {

        const today = new Date().toISOString().split("T")[0];
        let danasIzmena:Izmena|undefined;
        let periodIzmena:Izmena|undefined;
        let defaultId:string;

        if(smena){
            danasIzmena = linija.izmene?.find(
            i =>
            i.smena === smena &&
            i.target === target &&
            i.tip === "danas" &&
            i.od <= today &&
            i.do >= today
        );

        periodIzmena = linija.izmene?.find(
            i =>
            i.smena === smena &&
            i.target === target &&
            i.tip === "period" &&
            i.od <= today &&
            i.do >= today
        );

        defaultId = getDefaultId(
            linija,
            target,
            smena
        );
        } else{
            danasIzmena = linija.izmene?.find(
            i =>
                i.target === target &&
                i.tip === "danas" &&
                i.od <= today &&
                i.do >= today
            );

            periodIzmena = linija.izmene?.find(
            i =>
                i.target === target &&
                i.tip === "period" &&
                i.od <= today &&
                i.do >= today
            );

            defaultId = getDefaultId(
            linija,
            target
            );
        }

        const getValue = (id: string) => {
            if (target === "vozilo" && vozilaMap) { 
                return {tablice: vozilaMap[id]?.tablice || ""}
            }else if(vozaciMap){
                const vozac = vozaciMap[id];
                return {ime: vozac.ime || "", prezime: vozac.prezime || ""}
            }
        };

        if (danasIzmena) {
            return {
                aktivnaVrednost: getValue(danasIzmena.vrednostId),
                defaultVrednost: getValue(defaultId),
                izvor: "danas"
            };
        }

        if (periodIzmena) {
            return {
                aktivnaVrednost: getValue(periodIzmena.vrednostId),
                defaultVrednost: getValue(defaultId),
                izvor: periodIzmena.do
            };
        }

        console.log("danasIzmena", danasIzmena);
        console.log("periodIzmena", periodIzmena);

        return {
            aktivnaVrednost: undefined,
            defaultVrednost: getValue(defaultId),
            izvor: "default"
        };
    };


    const formatirajDanMesecTekst = (datum:string) => {
        if(datum === "danas") return datum;
        const date = new Date(datum);
        const dan = date.getDate().toString().padStart(2, '0');
        const mesec = date.toLocaleString('sr-Latn-RS', { month: 'short' }); // "jun"
        // ili 'long' za "jun"
        
        return `${dan}. ${mesec}`; // "05 jun"
    };


    const getTransportData = ({linijeSaIzmenama,vozaciFromDb,vozilaFromDb,smena}:getTransportData) => {
        const vozaciMap = Object.fromEntries(
            vozaciFromDb.map((v:VozacFromDb) => [v.id, v])
        )
        const vozilaMap = Object.fromEntries(
            vozilaFromDb.map((v:VoziloFromDb) => [v.id, v])
        )

        const transportData: Record<number, {
            vozilo: AktivnaVrednostVozilo | AktivnaVrednostVozac | undefined, 
            vozac: AktivnaVrednostVozilo | AktivnaVrednostVozac  | undefined} > = {};

        linijeSaIzmenama.forEach(linija => {
            const vozacVrednost = getAktivnaVrednost({linija, target:"vozac", vozaciMap, smena});
            const voziloVrednost = getAktivnaVrednost({linija, target:"vozilo", vozilaMap, smena});
            transportData[Number(linija.broj)] = {
                vozac: vozacVrednost.aktivnaVrednost || vozacVrednost.defaultVrednost,
                vozilo: voziloVrednost.aktivnaVrednost || voziloVrednost.defaultVrednost
            }
        })
        return transportData;
    }


    return(
        <TransportContext.Provider
            value={{
                vozaciFromDb,
                vozilaFromDb,
                linijeSaIzmenama,
                loading,
                getTransportData,
                formatirajDanMesecTekst,
                getAktivnaVrednost
            }}
        >
            {children}
        </TransportContext.Provider>
    )
}

export const useTransportData = () => {
  const context = useContext(TransportContext)

  if (!context) {
    throw new Error(
      "useData mora biti unutar DataProvider"
    )
  }

  return context
}