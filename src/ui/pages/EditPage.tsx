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
        <div>
            <h1>Edit Page</h1>
            <button onClick={handleSelectFolder}>Izaberi folder</button>
            { folderPath && <p>Izabrani folder: {folderPath} </p>}
            <button onClick={odvojiDijeteHanlder} disabled={!folderPath}>Odvoji dijete</button>
        </div>
    )
}

export default EditPage