import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FilterForm from "../components/filterForm";
import { useConfirm } from "../context/confirmContext";
import { FaRegTrashAlt } from "react-icons/fa";
import { MdFilterListAlt } from "react-icons/md";


type FilteriZaOtpremnice = {
  title: string;
  keywords: string[];
};

const IzdvajanjeDijeta = () => {
  const [grupeFiltera, setGrupeFiltera] = useState<FilteriZaOtpremnice[]>([]);
  const FILE = "filteriZaOtpremnice.json";

  // useForm instance for adding new group
  const {
    register: registerGroup,
    handleSubmit: handleSubmitGroup,
    reset: resetGroupForm,
  } = useForm<{ novaGrupa: string }>();

  const {confirm} = useConfirm();

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

const removeFilterHandler = async (message:string, group: string, filter: string ) => 
  confirm({
    message: message,
    onConfirm: async() => { 
        try {
          const data = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
          const updatedData = data.map((grupa) =>
            grupa.title === group
              ? { ...grupa, keywords: grupa.keywords.filter((f) => f !== filter) }
              : grupa
          );
          await window.electronApp.writeJsonFile(FILE, updatedData);
          setGrupeFiltera(updatedData);
        } catch (error) {
          console.log("Greška pri brisanju filtera iz grupe: ", error);
        }
    },
  });

const removeGroupHandler = async (message: string, groupName: string ) => 
  confirm({
    message: message,
    onConfirm: async () => {
      try {
        const data = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
        const updatedData = data.filter((grupa) => grupa.title !== groupName);
        await window.electronApp.writeJsonFile(FILE, updatedData);
        setGrupeFiltera(updatedData);
      } catch (error) {
        console.log("Greška pri brisanju grupe filtera: ", error);
      }
    },
  });

const onSubmitGroup = async (data: { novaGrupa: string }) => {
  const groupName = data.novaGrupa.trim();
  if (!groupName) return;

  try {
    const existingData = (await window.electronApp.readJsonFile(FILE)) as FilteriZaOtpremnice[];
    const groupExists = existingData.some((grupa) => grupa.title === groupName);
    if (groupExists) {
      console.log("Grupa već postoji.");
      return;
    }
    const updatedData = [...existingData, { title: groupName, keywords: [] }];
    await window.electronApp.writeJsonFile(FILE, updatedData);
    setGrupeFiltera(updatedData);
    resetGroupForm();
  } catch (error) {
    console.log("Greška pri dodavanju nove grupe: ", error);
  }
};


  return (
  <div className="container mt-4">
  <h2>Izdvajanje Dijeta</h2>
  <div className="row">
    {grupeFiltera.map((grupaFiltera) => (
      <div className="col-md-6 mb-4" key={grupaFiltera.title}>
        <div className="card h-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><MdFilterListAlt/> {grupaFiltera.title}</h5>
            <button
              className="btn btn-sm btn-danger"
              title="Obriši grupu"
              onClick={() => removeGroupHandler("Da li ste sigurni da želite da obrišete ovu grupu filtera?", grupaFiltera.title)}
            >
              <FaRegTrashAlt/> 
            </button>
          </div>
          <ul className="list-group list-group-flush">
            {grupaFiltera.keywords.map((f) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={f}>
                {f} 
                <button 
                  title="Obriši filter"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeFilterHandler("Da li ste sigurni da želie da obrišete ovaj filter?", grupaFiltera.title, f )}
                >
                  <FaRegTrashAlt/> 
                </button>
              </li>
            ))}
          </ul>
          <div className="card-body">
            <FilterForm
              groupName={grupaFiltera.title}
              onAddFilter={(groupName, filterName) => {
                const updatedData = grupeFiltera.map((grupa) =>
                  grupa.title === groupName
                    ? { ...grupa, keywords: [...grupa.keywords, filterName] }
                    : grupa
                );
                setGrupeFiltera(updatedData);
                window.electronApp.writeJsonFile(FILE, updatedData);
              }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
  <hr />
  <form onSubmit={handleSubmitGroup(onSubmitGroup)} className="mt-4">
    <div className="input-group">
      <input
        {...registerGroup("novaGrupa")}
        className="form-control"
        placeholder="Nova grupa filtera"
      />
      <button type="submit" className="btn btn-primary">
        Dodaj grupu
      </button>
    </div>
  </form>
</div>


);

};

export default IzdvajanjeDijeta;
