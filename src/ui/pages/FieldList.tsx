import { FormEvent, useEffect, useState } from "react";
import { Link } from 'react-router-dom'; 
import { Field, WindowInfo } from "../types";


const FieldList = ()=>{
    const [fields,setFields] = useState<Field[]>([]);
    const [windowInfo, setwindowInfo] = useState<WindowInfo>();
    const [windowName, setWindowName] = useState("");

    const fetchFields = async() => {
        try{
            const data = await window.electronApp.readJsonFile("fields.json");
            const windowData = await window.electronApp.readJsonFile("window.json");
            setFields(data);
            setwindowInfo(windowData)
        }catch(error){
            console.log("Greška pri čitanju fajla:",error)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if(windowInfo && windowName)await window.electronApp.writeJsonFile("window.json",{...windowInfo, title: windowName})
      setWindowName("");
      console.log("windowTitle: ", windowInfo?.title)
    }

    useEffect(()=>{
        fetchFields();
    }, [])

    return(
    <div className="container py-4">
      <h2 className="mb-4">Fields</h2>
      <div className="mb-4">
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={windowName}
            required 
            onChange={(e) => setWindowName(e.target.value)}
            placeholder="Window Title"
          />
          <button type="submit">Sačuvaj</button>
        </form>

      </div>

      <ul className="list-group mb-4">
        {Object.entries(fields).map(([key, field]) => (
          <li key={key} className="list-group-item mb-2">
            <Link to={`/fields/${key}`} className="text-decoration-none">
              {field.title.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>

      {/* Object.entries(allFields).map(([key, field]) => (
        <div key={key}>{field.title}</div>
      )); */}

      <Link to="/addField" className="btn btn-primary">
        Dodaj novo polje
      </Link>
    </div>
    )
}

export default FieldList;