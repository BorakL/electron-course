import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useConfirm } from "../context/confirmContext";
import { Field } from "../types";

const FieldDetails = () => {
    const { id } = useParams();
    const [field, setField] = useState<Field | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const navigate = useNavigate();
    const {confirm} = useConfirm();  


    const { register, handleSubmit, reset, formState: {errors} } = useForm<Field>();

    const fetchField = async (id: string | undefined) => {
        try {
            const data: Field[] = await window.electronApp.readJsonFile("fields.json");
            const selected = data.find(f => Number(f.id) === Number(id));
            setField(selected || null);
            
            if (selected) {
                reset(selected); // popunjavamo formu default vrednostima
            }
        } catch (error) {
            console.log("Greška pri učitavanju fajla", error);
        }
    };


    const handleDelete = async (message:string, field:Field, fieldId:number) => {
      confirm({
        message: message,
        onConfirm: async()=>{
          if (!field) return;
          try {
              await window.electronApp.deleteJsonItemById("fields.json", Number(fieldId), "id");
              navigate("/fields");
          } catch (error) {
              console.error("Greška pri brisanju klinike:", error);
          }
        }
      })

    };


    useEffect(() => {
        fetchField(id);
    }, []);

const onSubmit = async (formData: Field) => {
  try {
    const data: Field[] = await window.electronApp.readJsonFile("fields.json");

    const finalData: Field = {
      ...formData
    };

    const updatedData = data.map(f =>
      Number(f.id) === Number(id) ? finalData : f
    );

    await window.electronApp.writeJsonFile("fields.json", updatedData);

    setField(finalData);
    setIsEditing(false);
  } catch (error) {
    console.log("Greška pri snimanju fajla", error);
  }
};


    if (!field) return <div>Učitavanje...</div>;

    return (
    <div className="container mt-5">
      <h2 className="mb-4">{field.title?.toUpperCase()}</h2>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Title */}
            <div className="row mb-2 align-items-center">
                <label className="col-sm-2 col-form-label">Title:</label>
                <div className="col-sm-10">
                    <input
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    {...register('title', { 
                            required: true,
                            pattern: {
                            value: /^[a-zA-Z0-9čćžšđČĆŽŠĐ]+$/,
                            message: "Dozvoljeni su samo alfanumerički karakteri bez razmaka i specijalnih znakova."
                            }  
                        })}
                    />
                </div>
            </div>

            {/* Name */}
            <div className="row mb-2 align-items-center">
                <label className="col-sm-2 col-form-label">Name</label>
                <div className="col-sm-10">
                    <input
                    className="form-control"
                    {...register("name")}
                    />
                </div>
            </div>

        {/* Type */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Type</label>
          <div className="col-sm-10">
            <select
              id="category"
              className="form-select"
              {...register('type', {
                required: 'Izaberi tip polja'
              })}
            >
              <option value="">-- Izaberi tip polja --</option>
              <option value="TextBox">TextBox</option>
              <option value="Number">Number</option>
              <option value="Date">Date</option>
              <option value="Checkbox">Checkbox</option>
              <option value="RadioButton">RadioButton</option>
              <option value="ComboBox">ComboBox</option>
              <option value="Dropdown">Dropdown</option>
              <option value="Button">Button</option>
            </select>
          </div>
        </div>

        {/* Ordinal */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Ordinal</label>
          <div className="col-sm-10">
            <input
              type="number"
              className="form-control"
              {...register("ordinal")}
            />
          </div>
        </div>

        {/* ItemOrdinal */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">ItemOrdinal</label>
          <div className="col-sm-10">
            <input
              type="number"
              className="form-control"
              {...register("itemOrdinal")}
            />
          </div>
        </div>

        {/* DelayAfter */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">DelayAfter</label>
          <div className="col-sm-10">
            <input
              type="number"
              className="form-control"
              {...register("delayAfter")}
            />
          </div>
        </div>

        {/* Mode */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Mode</label>
          <div className="col-sm-10">
            <select
              id="category"
              className="form-select"
              {...register("mode")}
            >
              <option value="">-- Izaberi Mod --</option>
              <option value="keyboard">Keyboard</option>
              <option value="uia">UIA</option>
            </select>
          </div>
        </div>

          <button type="submit" className="btn btn-success me-2">
            Sačuvaj
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsEditing(false)}
          >
            Otkaži
          </button>
        </form>
      ) : (
        <div className="container mt-4">
            <div className="card p-4">
            <p><strong>Title:</strong> {field.title}</p>
            <button
                className="btn btn-primary me-2 mb-2"
                onClick={() => setIsEditing(true)}
            >
                Izmeni
            </button>
            <button className="btn btn-danger" onClick={()=>handleDelete("Da li ste sigurni da želite da obrišete ovu kliniku?",field,Number(field.id))}>
                Obriši
            </button>
            </div>
        </div>
    )
    }
    </div>);
}

export default FieldDetails;
