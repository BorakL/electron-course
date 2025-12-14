import { useState } from "react";
import { ClinicItem } from "../types";

type UserIdsProps = {
    clinics: ClinicItem[];
    setClinics: React.Dispatch<React.SetStateAction<{userId:number,name:string}[]>>
    isEditing?: boolean
}

const UserIds = (
    {clinics,setClinics,isEditing=true}: UserIdsProps
) => {
    const [newClinicUserId, setNewClinicUserId] = useState("");
    const [newClinicName, setNewClinicName] = useState("");
    
    const handleAddClinic = (
        clinics: {userId:number, name:string}[]
    ) => {
        if (!newClinicUserId || !newClinicName) return;

        const exists = clinics.some(c => c.userId === Number(newClinicUserId));
        if (exists) {return;}

        setClinics(prev => [
        ...prev,
        {
            userId: Number(newClinicUserId),
            name: newClinicName
        }
        ]);
        setNewClinicUserId("");
        setNewClinicName("");
    };

    const handleRemoveClinic = (userId: number) => {
        setClinics(prev => prev.filter(c => c.userId !== userId));
    };

    return(
        <>
        {clinics.map((c) => (
          <div key={c.userId} className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-info text-dark">
              {c.userId} — {c.name}
            </span>
            {
                isEditing &&
                <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => handleRemoveClinic(c.userId)}
                >
                Remove
                </button>
            }

          </div>
        ))}

        {isEditing &&
        <div className="row g-2 mb-3">
            <div className="col">
                <input
                type="number"
                className="form-control"
                placeholder="User ID"
                value={newClinicUserId}
                onChange={(e) => setNewClinicUserId(e.target.value)}
                />
            </div>
            <div className="col">
                <input
                type="text"
                className="form-control"
                placeholder="Naziv klinike"
                value={newClinicName}
                onChange={(e) => setNewClinicName(e.target.value)}
                />
            </div>
            <div className="col-auto">
                <button
                type="button"
                className="btn btn-success"
                onClick={()=>handleAddClinic(clinics)}
                >
                + Add klinika
                </button>
            </div>
        </div>}
        
        </>
    )
}

export default UserIds