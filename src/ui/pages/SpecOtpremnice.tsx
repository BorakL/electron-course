import { useState } from "react";

const SpecOtpremnice = ()=> {
    const[filePath, setFilePath] = useState<string>("");
    const[showMessage, setShowMessage] = useState<boolean>(false);

    const handleSelectFile = async () => {
        const selectedPath = await window.electronApp.selectFile();
        if(selectedPath){
            setFilePath(selectedPath)
            setShowMessage(true)            
            console.log('Odabrani folder:', filePath);
        }else {
            console.log("Izbor foldera je otkazan")
        }
    }

    const handleDownloadSpecDiets = async () => {
        
    }

    return(
        <div className="container m-4">
            <h2 className="m-5">Otpremnice za specijalne obroke</h2>
            <button className="btn btn-primary me-2 m-4" onClick={handleSelectFile}>
                Odaberi excel fajl
            </button>
            <button className="btn btn-primary me-2 m-4" onClick={handleDownloadSpecDiets}>
                Downloaduj spec obroke
            </button>
            {
              filePath ? <p className="mt-2"> <strong>Izabrani excel fajl: </strong> {filePath} </p> :
              showMessage ? <p className="mt-2"> <strong className="text-danger">Prvo selektuj fajl sa listom za pakovanje!</strong> </p> : ""
            }
        </div>
    )
}

export default SpecOtpremnice;