import { useEffect, useState } from "react";
import { useForm, useFieldArray, UseFormReturn } from "react-hook-form";
import { Klinika } from "../types";

export type vanRfzoDiets = { [dietName: string]: number };
export type VanRfzo = { [clinicName: string]: vanRfzoDiets };
export type VanRfzoData = { datum: string; vanRfzo: VanRfzo };

type FormDiet = {
  dietName: string;
  quantity: number;
};

type FormClinic = {
  clinicName: string;
  diets: FormDiet[];
};

type FormValues = {
  datum: string;
  clinics: FormClinic[];
};

// ------------------ CHILD COMPONENT ------------------
function ClinicFieldItem({
  form,
  index,
  removeClinic,
}: {
  form: UseFormReturn<FormValues>;
  index: number;
  removeClinic: (i: number) => void;
}) {
  const { register, control } = form;
  const[clinicsJson,setClinicsJson] = useState<Klinika[]>([])

  const {
    fields: dietFields,
    append: appendDiet,
    remove: removeDiet,
  } = useFieldArray({
    control,
    name: `clinics.${index}.diets`,
  });

  useEffect(() => {
    const fetchKlinike = async () => {
      try {
        const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
        setClinicsJson(data);
      } catch (err) {
        console.error("Greška pri učitavanju klinika:", err);
      }
    };
    fetchKlinike();
  }, []);

  return (
    <div className="card mb-3">
      <div className="card-body">

        <div className="row mb-3">
          <div className="col-9">
            <label className="form-label">Naziv klinike</label>
            <select
              className="form-select"
              {...register(`clinics.${index}.clinicName`, { required: true })}
            >
              <option value="">-- Izaberi kliniku --</option>
              {clinicsJson.map((c) => (
                <option key={c.id} value={c.naziv}>
                  {c.naziv.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="col-3 d-flex justify-content-end align-items-end">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => removeClinic(index)}
            >
              Ukloni kliniku
            </button>
          </div>
        </div>

        <table className="table table-sm table-bordered mb-2">
          <thead>
            <tr>
              <th>Dijeta</th>
              <th style={{ width: 120 }}>Količina</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {dietFields.map((diet, dietIndex) => (
              <tr key={diet.id}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    {...register(`clinics.${index}.diets.${dietIndex}.dietName`)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    {...register(`clinics.${index}.diets.${dietIndex}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeDiet(dietIndex)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => appendDiet({ dietName: "", quantity: 1 })}
        >
          + Dodaj dijetu
        </button>
      </div>
    </div>
  );
}

// ------------------ MAIN FORM ------------------
export default function VanRfzoForm() {
  const form = useForm<FormValues>({
    defaultValues: { datum: "", clinics: [] },
  });
  const { register, control, handleSubmit } = form;

  const { fields: clinicFields, append: appendClinic, remove: removeClinic } =
    useFieldArray({
      control,
      name: "clinics",
    });

  const onSubmit = (data: FormValues) => {
    const vanRfzo: VanRfzo = {};

    data.clinics.forEach((c) => {
      const clinicKey = c.clinicName.toUpperCase();
      const dietsObj: vanRfzoDiets = {};
      c.diets.forEach((d) => {
        if (d.dietName.trim()) dietsObj[d.dietName.trim()] = Number(d.quantity);
      });
      if (Object.keys(dietsObj).length > 0) vanRfzo[clinicKey] = dietsObj;
    });

    const result: VanRfzoData = {
      datum: data.datum,
      vanRfzo,
    };

    console.log("✅ Rezultat forme:", result);
  };

  return (
    <form className="container p-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label className="form-label">Datum</label>
        <input type="date" className="form-control" {...register("datum", { required: true })} />
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>Klinike</h5>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => appendClinic({ clinicName: "", diets: [] })}
        >
          + Dodaj kliniku
        </button>
      </div>

      {clinicFields.map((_, index) => (
        <ClinicFieldItem
          key={clinicFields[index].id}
          form={form}
          index={index}
          removeClinic={removeClinic}
        />
      ))}

      <button type="submit" className="btn btn-success w-100">
        Sačuvaj
      </button>
    </form>
  );
}
