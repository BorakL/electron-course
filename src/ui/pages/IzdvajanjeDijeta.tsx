import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type FilteriZaOtpremnice = {
  grupa: string;
  filteri: string[];
};

const IzdvajanjeDijeta = () => {
  const [grupeFiltera, setGrupeFiltera] = useState<FilteriZaOtpremnice[]>([]);
  const FILE = "filteriZaOtpremnice.json";

  // useForm instance for adding new filter to existing group
  const {
    register: registerFilter,
    handleSubmit: handleSubmitFilter,
    reset: resetFilterForm,
  } = useForm<{ [key: string]: string }>();

  // useForm instance for adding new group
  const {
    register: registerGroup,
    handleSubmit: handleSubmitGroup,
    reset: resetGroupForm,
  } = useForm<{ novaGrupa: string }>();

  const fetchData = async () => {
    try {
      const filteri = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
      setGrupeFiltera(filteri);
    } catch (error) {
      console.log("Greška pri učitavanju filtera za otpremnice: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const removeFilterHandler = async (group: string, filter: string) => {
    try {
      const data = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
      const updatedData = data.map((grupa) =>
        grupa.grupa === group
          ? { ...grupa, filteri: grupa.filteri.filter((f) => f !== filter) }
          : grupa
      );
      await window.electronApp.writeJsonFile(FILE, updatedData);
      setGrupeFiltera(updatedData);
    } catch (error) {
      console.log("Greška pri brisanju filtera iz grupe: ", error);
    }
  };

  const removeGroupHandler = async (groupName: string) => {
  try {
    const data = await window.electronApp.readJsonFile(FILE) as FilteriZaOtpremnice[];
    const updatedData = data.filter(grupa => grupa.grupa !== groupName);
    await window.electronApp.writeJsonFile(FILE, updatedData);
    setGrupeFiltera(updatedData);
  } catch (error) {
    console.log("Greška pri brisanju grupe filtera: ", error);
  }
};

  const onSubmitFilter = async (data: { [key: string]: string }) => {
    const groupName = Object.keys(data)[0];
    const filterName = data[groupName].trim();
    if (!filterName) return;

    try {
      const existingData = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
      const updatedData = existingData.map((grupa) =>
        grupa.grupa === groupName
          ? { ...grupa, filteri: [...grupa.filteri, filterName] }
          : grupa
      );
      await window.electronApp.writeJsonFile(FILE, updatedData);
      setGrupeFiltera(updatedData);
      resetFilterForm();
    } catch (error) {
      console.log("Greška pri dodavanju filtera: ", error);
    }
  };

  const onSubmitGroup = async (data: { novaGrupa: string }) => {
    const groupName = data.novaGrupa.trim();
    if (!groupName) return;

    try {
      const existingData = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
      const groupExists = existingData.some((grupa) => grupa.grupa === groupName);
      if (groupExists) {
        console.log("Grupa već postoji.");
        return;
      }
      const updatedData = [...existingData, { grupa: groupName, filteri: [] }];
      await window.electronApp.writeJsonFile(FILE, updatedData);
      setGrupeFiltera(updatedData);
      resetGroupForm();
    } catch (error) {
      console.log("Greška pri dodavanju nove grupe: ", error);
    }
  };

  return (
    <div>
      <h2>Izdvajanje Dijeta</h2>
        {grupeFiltera.map(grupaFiltera => (
        <div key={grupaFiltera.grupa}>
            <div>
            {grupaFiltera.grupa}
            <button onClick={() => removeGroupHandler(grupaFiltera.grupa)}>Obriši grupu</button>
            </div>
            <ul>
            {grupaFiltera.filteri.map(f => (
                <li key={f}>
                {f} <button onClick={() => removeFilterHandler(grupaFiltera.grupa, f)}>X</button>
                </li>
            ))}
            </ul>
            <form onSubmit={handleSubmitFilter(onSubmitFilter)}>
            <input
                {...registerFilter(grupaFiltera.grupa)}
                placeholder={`Dodaj filter u grupu ${grupaFiltera.grupa}`}
            />
            <button type="submit">Dodaj filter</button>
            </form>
        </div>
    ))}

      <hr />
      <form onSubmit={handleSubmitGroup(onSubmitGroup)}>
        <input {...registerGroup("novaGrupa")} placeholder="Nova grupa filtera" />
        <button type="submit">Dodaj grupu</button>
      </form>
    </div>
  );
};

export default IzdvajanjeDijeta;
