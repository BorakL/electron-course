import { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; 
import { Field } from "../types";


const FieldList = ()=>{
    const [fields,setFields] = useState<Field[]>([]);

    const fetchFields = async() => {
        try{
            const data = await window.electronApp.readJsonFile("fields.json");
            setFields(data);
        }catch(error){
            console.log("Greška pri čitanju fajla:",error)
        }
    }

    useEffect(()=>{
        fetchFields();
    }, [])

    return(
    <div className="container py-4">
      <h2 className="mb-4">Fields</h2>

      <ul className="list-group mb-4">
        {fields.map((field) => (
          <li key={field.id} className="list-group-item mb-2">
            <Link to={`/fields/${field.id}`} className="text-decoration-none">
              {field.title.toUpperCase()}
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/addField" className="btn btn-primary">
        Dodaj novo polje
      </Link>
    </div>
    )
}

export default FieldList;