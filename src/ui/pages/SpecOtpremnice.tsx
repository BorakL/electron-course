// import { useState } from "react";

// const SpecOtpremnice = ()=> {
//     const[filePath, setFilePath] = useState<string>("");
//     const[showMessage, setShowMessage] = useState<boolean>(false);

//     const handleSelectFile = async () => {
//         const selectedPath = await window.electronApp.selectFile();
//         if(selectedPath){
//             setFilePath(selectedPath)
//             setShowMessage(true)            
//             console.log('Odabrani folder:', filePath);
//         }else {
//             console.log("Izbor foldera je otkazan")
//         }
//     }

//     const handleDownloadSpecDiets = async () => {
//         try{
//             const filteri = await window.electronApp.readJsonFile("filteriZaOtpremnice.json");
//             const clinicsWithSpecMeals = await window.electronApp.getClinicsWithSpecMeals(filePath,filteri);
//             console.log("clinicsWithSpecMeals", clinicsWithSpecMeals)
//         }catch(error){
//             console.error("Došlo je do greške", error)
//         }
//     }

//     return(
//         <div className="container m-4">
//             <h2 className="m-5">Otpremnice za specijalne obroke</h2>
//             <div className="mb-3">
//                 <button className="btn btn-primary me-2 m-4" onClick={handleSelectFile}>
//                     Odaberi excel fajl
//                 </button>
//             </div>
//             <div className="mb-3">
//                 <button className="btn btn-primary me-2 m-4" onClick={handleDownloadSpecDiets}>
//                     Downloaduj spec obroke
//                 </button>
//             </div>
//             {
//               filePath ? <p className="mt-2"> <strong>Izabrani excel fajl: </strong> {filePath} </p> :
//               showMessage ? <p className="mt-2"> <strong className="text-danger">Prvo selektuj fajl sa listom za pakovanje!</strong> </p> : ""
//             }
//         </div>
//     )
// }

// export default SpecOtpremnice;




import { useState } from "react";
import { turnUsersToClinics } from "../util";

const SpecOtpremnice = ()=> {
    const[filePaths, setFilePaths] = useState<string[]>([]);
    const[showMessage, setShowMessage] = useState<boolean>(false);
    const[isFileWritten, setIsFileWritten] = useState<boolean>(false);

    const handleSelectFile = async () => {
        const selectedPath = await window.electronApp.selectFiles();
        if(selectedPath){
            setFilePaths(selectedPath)
            setIsFileWritten(false)
            setShowMessage(false)            
            console.log('Odabrani folder:', filePaths);
        }else {
            console.log("Izbor foldera je otkazan")
        }
    }

    const handleSaveSpecDiets = async () => {
        if(!haveFilePaths){
            setShowMessage(true)
            return;
        }
        try{
            const clinicsWithOrderedProducts = await window.electronApp.getClinicsWithOrderedProducts(filePaths);
            const clinicsData = await window.electronApp.readJsonFile("klinike.json");
            const specMealsAllDay = turnUsersToClinics(clinicsWithOrderedProducts, clinicsData)
            await window.electronApp.writeJsonFile("klinikeProizvodi.json", specMealsAllDay)
            setFilePaths([]);
            setIsFileWritten(true);
        }catch(error){
            console.error("Došlo je do greške", error)
        }
    }

    const paths = filePaths.map(p => <li key={p}>{p}</li>)
    const haveFilePaths = filePaths && filePaths.length>0

    return(
        <div className="container m-4">
            <h2 className="m-5">Otpremnice za specijalne obroke</h2>
            <div className="mb-3">
                <button className="btn btn-primary me-2 m-4" disabled={haveFilePaths} onClick={handleSelectFile}>
                    Odaberi excel fajlove
                </button>
            </div>
            <div className="mb-3">
                <button className="btn btn-primary me-2 m-4" disabled={!haveFilePaths || showMessage} onClick={handleSaveSpecDiets}>
                    Sačuvaj
                </button>
            </div>
            {
              haveFilePaths ? <div className="mt-2"> <strong>Izabrani excel fajlovi: </strong><ul>{paths}</ul></div> :
              showMessage ? <p className="mt-2"> <strong className="text-danger">Prvo selektuj fajl sa listom za pakovanje!</strong> </p> : ""
            }
            {
                isFileWritten && <strong>Fajl je uspešno sačuvan!</strong>
            }
        </div>
    )
}

export default SpecOtpremnice;