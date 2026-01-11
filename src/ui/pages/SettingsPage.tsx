import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Settings } from "../types";

export default function SettingsForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid }
  } = useForm<Settings>({
    mode: "onChange"
  });

  const [settings, setSettings] = useState<Settings | null>(null);


  useEffect(() => {
    const loadSettings = async () => {
      const data = await window.electronApp.readJsonFile("settings.json");
      setSettings(data);
      reset(data); // 👈 populate RHF
    };

    loadSettings();
  }, [reset]);

  const onSubmit = (data: Settings) => {
    window.electronApp.writeJsonFile("settings.json", data);
  };

  // ⛔ Prevent rendering before data is loaded
  if (!settings) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mt-4">
      {/* URLs */}
      <h4>URLs</h4>

      {(Object.keys(settings.urls) as (keyof Settings["urls"])[]).map(key => (
        <div key={key} className="mb-2">
          <label className="form-label">{key}</label>
          <input
            className="form-control"
            {...register(`urls.${key}`, { required: true })}
          />
        </div>
      ))}

      {/* Lista za pakovanje */}
      <h4 className="mt-4">Lista za pakovanje</h4>

      {(Object.keys(settings.listaZaPakovanje) as (keyof Settings["listaZaPakovanje"])[]).map(
        key => (
          <div key={key} className="mb-2">
            <label className="form-label">{key}</label>
            <input
              type={key.includes("CELL") ? "text" : "number"}
              className="form-control"
              {...register(`listaZaPakovanje.${key}`, {
                valueAsNumber: !key.includes("CELL"),
                required: true
              })}
            />
          </div>
        )
      )}

      {/* Otpremnica */}
      <h4 className="mt-4">Otpremnica</h4>

      <input
        className="form-control mb-2"
        {...register("otpremnica.DIET_COLUMN")}
        placeholder="Diet column"
      />

      <input
        className="form-control mb-2"
        {...register("otpremnica.QUANTITY_COLUMN")}
        placeholder="Quantity column"
      />

      <input
        type="number"
        className="form-control mb-2"
        {...register("otpremnica.FIRST_DIET_ROW", {
          valueAsNumber: true
        })}
      />

      <input
        className="form-control mb-2"
        {...register("otpremnica.LAST_ROW_TITLE")}
      />

      <input
        type="number"
        step="0.01"
        className="form-control mb-2"
        {...register("otpremnica.COL_WIDTH", {
          valueAsNumber: true
        })}
      />

      <input
        type="number"
        step="0.01"
        className="form-control mb-2"
        {...register("otpremnica.COL_HEIGHT", {
          valueAsNumber: true
        })}
      />

      <div>
        <button
          type="submit"
          className="btn btn-success"
          disabled={!isDirty || !isValid}
        >
          Save config
        </button>
      </div>
    </form>
  );
}
