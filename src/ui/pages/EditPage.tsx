const EditPage = ()=>{
    const tableParams = {
        dietColumn: 'A',
        quantityColumn: 'C',
        firstRow: 12,
        lastRowTitle: 'UKUPNO:',
    };
    const folderPath = './24-05-2025/';

    const odvojiDijeteHanlder = async () => {
        try{
            const filteri = await window.electronApp.readJsonFile("filteriZaOtpremnice.json");
            await window.electronApp.processDietFiles(filteri, tableParams, folderPath)
        }catch(error){
            console.log("Greška prilikom odvajanja dijeta", error)
        }
    }

    return(
        <div>
            <h1>Edit Page</h1>
            <button onClick={odvojiDijeteHanlder}>Odvoji dijete</button>
        </div>
    )
}

export default EditPage