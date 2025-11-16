import { useState } from "react";

export default function PrintPage() {
  const[folderPath, setFolderPath] = useState<string>("");
  const[showMessage,setShowMessage] = useState<boolean>(false);
  const[fileIsMerged,setFileIsMerged] = useState<boolean>(false);

  const handleSelectFolder = async () => {
      const selectedPath = await window.electronApp.selectFolder();
      if (selectedPath) {
          console.log('Odabrani folder:', folderPath);
          setFolderPath(selectedPath)
          setShowMessage(false)
          setFileIsMerged(false)
      } else {
          console.log('Izbor foldera je otkazan.');
      }
  };

  const handleMergeExcels = async ():Promise<void> => {
    const mergedFileName = `${folderPath}/Merged.xlsx`
    if(folderPath) await window.electronApp.mergeExcels(folderPath,mergedFileName)
    setFileIsMerged(true)
  }


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
        <div className="mb-3">
          <button 
            type="button" 
            className="btn btn-success" 
            disabled={!folderPath || fileIsMerged ? true : false}
            onClick={handleMergeExcels}
          >
            Merdžuj fajlove za štampu
          </button>
          {
            folderPath && fileIsMerged ? <p className="mt-2"> <strong className="text-success">Excel fajlovi u odabranom folderu su uspešno merdžovani u jedan fajl</strong> </p> : ""
          }
        </div>
    </div>
  );
}
