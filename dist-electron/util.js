import fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import os from 'os';
const klinike = [{
        naziv: "gak",
        ostaliNazivi: ["gak", "ginekologija"],
        bolnicaApp: "GINEKOLOGIJA I AKUŠERSTVO",
        klinikaApp: "GAK",
        bolnica: "UNIVERZITETSKI KLINIČKI CENTAR SRBIJE",
        klinika: "KLINIKA ZA GINEKOLOGIJU I AKUŠERSTVO",
        firm: 69,
        user: 704
    },
    {
        naziv: "palmotićeva",
        ostaliNazivi: ["palmotićeva", "palmoticeva"],
        bolnicaApp: "INSTITUT ZA MENTALNO ZDRAVLJE",
        klinikaApp: "PALMOTIĆEVA",
        bolnica: "INSTITUT ZA MENTALNO ZDRAVLJE",
        klinika: "INSTITUT ZA MENTALNO ZDRAVLJE",
        firm: 70,
        user: 705
    },
    {
        naziv: "onkologija",
        ostaliNazivi: ["onkologija"],
        bolnicaApp: "INSTITUT ZA ONKOLOGIJU I RADIOLOGIJU",
        klinikaApp: "ONKOLOGIJA",
        bolnica: "INSTITUT ZA ONKOLOGIJU I RADIOLOGIJU SRBIJE",
        klinika: "INSTITUT ZA ONKOLOGIJU I RADIOLOGIJU SRBIJE",
        firm: 71,
        user: 706
    },
    // {
    // naziv: "s palanka",
    // ostaliNazivi: ["s palanka", "s. palanka", "smederevska palanka", "stefan visoki"],
    // bolnicaApp: 'OPŠTA BOLNICA:"STEFAN VISOKI"',
    // klinikaApp: "STEFAN",
    // bolnica: 'OPŠTA BOLNICA:"STEFAN VISOKI" SMEDEREVSKA PALANKA',
    // klinika: 'OPŠTA BOLNICA:"STEFAN VISOKI"',
    // firm: 72,
    // user: 707
    // },
    // {
    // naziv: "blok a interna",
    // ostaliNazivi: ["blok a interna", "misovic interna", "mišović interna"],
    // bolnicaApp: "DRAGIŠA MIŠOVIĆ BLOK A",
    // klinikaApp: "INTERNA KLINIKA",
    // bolnica: 'KBC "DR DRAGIŠA MIŠOVIĆ" - DEDINJE',
    // klinika: "INTERNA KLINIKA",
    // firm: 51,
    // user: 670
    // }
];
export function isDev() {
    return process.env.NODE_ENV === 'development';
}
const refererUrl = "https://prochef.rs/hospital/otpremnice.php";
const url = "https://prochef.rs/hospital/create_pdf_invoice_otpremnica_v1.php";
const date = "16-01-2025";
const kategorija = 1;
const session = "hbrfabuet9addee1ir1c43e3iua";
// Funkcija za preuzimanje fajla
export async function downloadFile(url, filePath, refererUrl, firm, user, date) {
    const writer = fs.createWriteStream(filePath);
    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
                "Referer": `${refererUrl}?firm=${firm}&user=${user}&date=${date}`,
                "Cookie": `PHPSESSID=${session}`
            }
        });
        if (response.status === 401 || response.status === 403 || !response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            console.log("❌ Sesija je istekla ili je nevažeća.");
            writer.close(); // Zatvori writer odmah
            throw new Error("Sesija je istekla ili je nevažeća."); // Prekida preuzimanje fajla jer je sesija istekla
        }
        else {
            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                writer.on("finish", () => resolve());
                writer.on("error", (error) => reject(error));
            });
        }
    }
    catch (error) {
        writer.close(); // Close file stream to prevent leaks
        throw error;
    }
    finally {
        writer.close(); // Uvek zatvori writer, čak i ako dođe do greške
    }
}
;
export function createFullFolder() {
    const today = new Date().toISOString().split("T")[0];
    const desktopPath = path.join(os.homedir(), "Desktop");
    const saveFolder = path.join(desktopPath, today);
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }
    // Prolazak kroz niz i preuzimanje fajlova
    downloadMoreFiles(klinike, url, kategorija, date, saveFolder);
}
const downloadMoreFiles = async (klinike, url, kategorija, date, saveFolder) => {
    for (const klinika of klinike) {
        const fileName = `${klinika.naziv}.xlsx`; // Naziv fajla
        const filePath = path.join(saveFolder, fileName);
        const fileUrl = `${url}?kategorija=${kategorija}&date=${date}&firm=${klinika.firm}&user=${klinika.user}`;
        try {
            console.log(`Preuzimam: ${fileUrl} -> ${filePath}`);
            await downloadFile(fileUrl, filePath, refererUrl, klinika.firm, klinika.user, date);
            console.log(`✅ Preuzet: ${filePath}`);
        }
        catch (error) {
            console.error(`❌ Greška pri preuzimanju ${fileUrl}:`, error.message);
        }
    }
};
