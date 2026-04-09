import { useForm } from "react-hook-form";
import { Field } from "../types.ts";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";


const AddField = () => {
  const { register, handleSubmit } = useForm<Field>();
  const [allFields, setAllFields] = useState<Record<string, Field>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await window.electronApp.readJsonFile("fields.json");
        setAllFields(data || {});
      } catch (err) {
        console.error("Greška pri učitavanju:", err);
      }
    };
    fetchFields();
  }, []);


  const onSubmit = async (data: Field) => {
    try {
      if(allFields[data.title]){
        console.log("Polje sa ovim title već postoji");
        return;
      }
      const updated = {
        ...allFields,
        [data.title]: {
          ...data
        }
      };

      console.log("updated", updated);

      await window.electronApp.writeJsonFile("fields.json", updated);
      navigate("/fields");

    } catch (err) {
      console.error("Greška pri čuvanju", err);
    }
  };


  return (
    <div className="container mt-5">
      <h2 className="mb-4">Dodaj novo polje</h2>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Title */}
        <div className="row mb-2 align-items-center">
          <label className="col-sm-2 col-form-label">Title</label>
          <div className="col-sm-10">
            <input
              className="form-control"
              {...register("title", {
                required: true,
                pattern: {
                  value: /^[a-zA-Z0-9čćžšđČĆŽŠĐ\s]+$/,
                  message: "Dozvoljeni su samo razmak i slova/brojevi."
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
              {...register("ordinal", {
                setValueAs: (value) => {
                  if (!value || value === "") return null;
                  return Number(value);
                }
              })}
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
              {...register("delayAfter", {
                setValueAs: (value) => {
                  if (!value || value === "") return null;
                  return Number(value);
                }
              })}
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

        <div className="text-end">
          <button type="submit" className="btn btn-primary">
            Sačuvaj
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddField;
