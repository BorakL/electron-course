import { useEffect, useState } from "react"
import { InspectResult, WindowInfo } from "../types";

const InspectForm = ()=>{
    const[windowInfo,setwindowInfo] = useState<WindowInfo>();
    const[formData, setFormData] = useState<InspectResult | null>(null);
    const[loading, setLoading] = useState(false);

    const sendRequest = async()=> {
        try{
            setLoading(true);
            const resultData = await window.electronApp.inspectForm(windowInfo?.title || "")
            setFormData(resultData )
            setLoading(false);
        }catch(error){
            console.log("Greška prilikom slanja inspectForm requesta", error)
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchWindowInfo = async ()=>{
            try{
                const windowInfoData = await window.electronApp.readJsonFile("window.json");
                setwindowInfo(windowInfoData)
            }catch(error){
                console.log("Greška prilikom fečovanja window info-a.", error)
            }
        }
        fetchWindowInfo();
    },[])

    return(
        <>
        <h1>Inspect Form</h1>
        <div>
            <button onClick={()=>sendRequest()}>Inspect Form</button>
        </div>
        {formData && (
        <div className="container mt-4">
            {Object.entries(formData).map(([type, data]) => (
            <div key={type} className="card mb-4 shadow-sm">
                
                {/* Header */}
                <div className="card-header bg-primary text-white d-flex justify-content-between">
                <span>{type}</span>
                <span className="badge bg-light text-dark">
                    {data.count}
                </span>
                </div>

                {/* Body */}
                <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                    {data.items.map((item) => (
                    <li key={item.Ordinal} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                        
                        <div>
                            <div className="fw-bold">
                            {item.Name || "(no name)"}
                            </div>

                            <small className="text-muted">
                            ID: {item.AutomationId || "nema"}
                            </small>
                        </div>

                        <span className="badge bg-secondary">
                            #{item.Ordinal}
                        </span>

                        </div>
                    </li>
                    ))}
                </ul>
                </div>

            </div>
            ))}
        </div>
        )}

        {!formData && loading && 
        <div className="mt-3 spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        }
        </>
    )
}

export default InspectForm;