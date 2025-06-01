import { useState } from "react";

const EditPage = ()=>{
    const[folderPath, setFolderPath] = useState<string | null>(null)

    const tableParams = {
        dietColumn: 'A',
        quantityColumn: 'C',
        firstRow: 12,
        lastRowTitle: 'UKUPNO:',
    };
    // const folderPath = './24-05-2025/';

    const handleSelectFolder = async () => {
    const selectedPath = await window.electronApp.selectFolder();
    if (selectedPath) {
        console.log('Odabrani folder:', folderPath);
        setFolderPath(selectedPath)
    } else {
        console.log('Izbor foldera je otkazan.');
    }
    };


    const odvojiDijeteHanlder = async () => {
        try{
            const filteri = await window.electronApp.readJsonFile("filteriZaOtpremnice.json");
            if(typeof folderPath !== "string") return;
            await window.electronApp.processDietFiles(filteri, tableParams, folderPath)
        }catch(error){
            console.log("Greška prilikom odvajanja dijeta", error)
        }
    }

    return(
        <div className="container mt-4 text-start">
      <h2 className="m-5">Izdvoj dijete</h2>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={handleSelectFolder}>
          Selektuj folder sa otpremnicama
        </button>
        {folderPath && (
          <p className="mt-2">
            <strong>Izabrani folder:</strong> {folderPath}
          </p>
        )}
      </div>

      <button
        className="btn btn-success"
        onClick={odvojiDijeteHanlder}
        disabled={!folderPath}
      >
        Izdvoj dijete
      </button>
    </div>
    )
}

export default EditPage