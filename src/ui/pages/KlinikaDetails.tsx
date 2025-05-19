import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export type Klinika = {
    naziv:string,
    bolnicaApp: string,
    klinikaApp: string,
    bolnica: string,
    klinika: string,
    firm: number,
    user: number
}

const KlinikaDetails = () => {
    const { id } = useParams();
    const [klinika, setKlinika] = useState<Klinika | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const navigate = useNavigate();

    const { register, handleSubmit, reset } = useForm<Klinika>();

    const fetchKlinika = async (id: string | undefined) => {
        try {
            const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
            const selected = data.find(k => k.user === Number(id));
            setKlinika(selected || null);
            if (selected) {
                reset(selected); // popunjavamo formu default vrednostima
            }
        } catch (error) {
            console.log("Greška pri učitavanju fajla", error);
        }
    };


    const handleDelete = async () => {
        if (!klinika) return;
        try {
            await window.electronApp.deleteJsonItemById("klinike.json", Number(klinika.user), "user");
            // await window.electronApp.ocistiNevazecuKlinikuIzTura(Number(klinika.user));
            navigate("/klinike");
        } catch (error) {
            console.error("Greška pri brisanju klinike:", error);
            alert("Greška pri brisanju klinike.");
        }
    };


    useEffect(() => {
        fetchKlinika(id);
    }, []);

    const onSubmit = async (formData: Klinika) => {
        try {
            const data: Klinika[] = await window.electronApp.readJsonFile("klinike.json");
            const updatedData = data.map(k => (k.user === Number(id) ? formData : k));
            await window.electronApp.writeJsonFile("klinike.json", updatedData);
            setKlinika(formData);
            setIsEditing(false);
        } catch (error) {
            console.log("Greška pri snimanju fajla", error);
        }
    };

    if (!klinika) return <div>Učitavanje...</div>;

    return (
        <div>
            <h2>Klinika: {klinika.naziv}</h2>

            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label>Naziv: </label>
                        <input {...register("naziv")} />
                    </div>
                    <div>
                        <label>Bolnica: </label>
                        <input {...register("bolnica")} />
                    </div>
                    <div>
                        <label>Klinika: </label>
                        <input {...register("klinika")} />
                    </div>
                    <div>
                        <label>Firm: </label>
                        <input type="number" {...register("firm")} />
                    </div>
                    <div>
                        <label>User: </label>
                        <input type="number" {...register("user")} />
                    </div>
                    <div>
                        <label>Bolnica App: </label>
                        <input {...register("bolnicaApp")} />
                    </div>
                    <div>
                        <label>Klinika App: </label>
                        <input {...register("klinikaApp")} />
                    </div>
                    <button type="submit">Sačuvaj</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Otkaži</button>
                </form>
            ) : (
                <div>
                    <p><strong>Bolnica:</strong> {klinika.bolnica}</p>
                    <p><strong>Klinika:</strong> {klinika.klinika}</p>
                    <p><strong>Bolnica App:</strong> {klinika.bolnicaApp}</p>
                    <p><strong>Klinika App:</strong> {klinika.klinikaApp}</p>
                    <p><strong>Firm:</strong> {klinika.firm}</p>
                    <p><strong>User:</strong> {klinika.user}</p>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={handleDelete} style={{ marginLeft: '1rem', backgroundColor: 'red', color: 'white' }}>Obriši</button>
                </div>
            )}
        </div>
    );
};

export default KlinikaDetails;
