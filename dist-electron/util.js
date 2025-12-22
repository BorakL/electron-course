import fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import { readJsonFile } from './fsHelpers/jsonUtils.js';
import ExcelJS from 'exceljs';
// type ActiveXConstructor<T> = new (progId: string) => T;
// Napravi konstruktor za Excel.Application
// const ExcelApp = winax as unknown as ActiveXConstructor<ExcelApplication>;
export function isDev() {
    return process.env.NODE_ENV === 'development';
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Funkcija za preuzimanje fajla (koristi `arraybuffer`)
export async function downloadFile({ fileUrl, filePath, refererUrl, firm, user, date, session }) {
    try {
        const response = await axios({
            url: fileUrl,
            method: "GET",
            responseType: "arraybuffer",
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
                "Referer": `${refererUrl}?firm=${firm}&user[]=${user.join("&user[]=")}&date=${date}`,
                "Cookie": `PHPSESSID=${session}`
            }
        });
        const serverResponse = response.data?.toString();
        if (response.status !== 200) {
            throw new Error("❌ Server errro");
        }
        else if (!response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && serverResponse.includes("Prijavi se") || serverResponse.includes("Prijavite se")) {
            throw new Error("INVALID_SESSION");
        }
        else if (!response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            throw new Error("Neispravan odgovor - fajl nije Excel");
        }
        fs.writeFileSync(filePath, response.data);
        console.log(`✅ Fajl uspešno preuzet: ${filePath}`);
    }
    catch (error) {
        console.error(`⚠️ Greška pri preuzimanju fajla ${filePath}:`, error);
        throw error;
    }
}
export async function loginAndGetSession(username, password) {
    const loginUrl = "https://www.prochef.rs/hospital/admin_login.php";
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    try {
        const response = await axios.post(loginUrl, formData.toString(), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            maxRedirects: 0, // Ne sledi 302 redirect
            validateStatus: (status) => status >= 200 && status < 400,
        });
        const { status, headers } = response;
        const location = headers["location"];
        const setCookie = headers["set-cookie"];
        const isRedirectToMenu = status === 302 && location === "menu_creation.php";
        const sessionCookie = setCookie?.find((cookie) => cookie.startsWith("PHPSESSID="));
        if (isRedirectToMenu && sessionCookie) {
            const phpSessionId = sessionCookie.split(";")[0].split("=")[1];
            return phpSessionId; // uspešan login
        }
        // Ako nije redirektovano na menu ili nema cookie
        return null;
    }
    catch (error) {
        console.error("Login error:", error);
        return null;
    }
}
// Funkcija za kreiranje foldera i preuzimanje fajlova sa retry mehanizmom
// export function createFullFolder(cliniks: Klinika[], url: string | undefined, refererUrl: string | undefined, category: number, date: string, session: string): void {
export async function createFullFolder({ cliniks, url, refererUrl, category, date, session, groupId, suffix }) {
    const mealMap = {
        1: "D",
        2: "R",
        3: "V"
    };
    const dostavneTure = await readJsonFile("dostavneTure.json");
    const ture = dostavneTure?.ture;
    let tura;
    if (groupId) {
        tura = ture.find(tura => tura.id === groupId);
        if (tura && tura.klinike && tura.klinike.length > 0) {
            cliniks = cliniks.filter(clinik => tura?.klinike.some(k => k === clinik.id));
        }
    }
    const mealCategory = mealMap[category] || "";
    const today = groupId && groupId > 0 ? `${groupId} ${date}-${mealCategory}` : `${date}-${mealCategory}`;
    const desktopPath = path.join(os.homedir(), "Desktop");
    const saveFolder = path.join(desktopPath, today);
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }
    let currentIndex = 0;
    const failedDownloads = [];
    const logs = {
        status: "",
        downloads: [],
        failedDownloads: []
    };
    async function downloadNext(attemptsLeft = 3) {
        if (currentIndex >= cliniks.length) {
            console.log("✅ Preuzimanje fajlova je završeno.");
            logs.status = "✅ Preuzimanje fajlova je završeno.";
            if (failedDownloads.length > 0) {
                console.log("⚠️ Sledeći fajlovi nisu preuzeti:");
                console.log(failedDownloads.join("\n"));
                logs.failedDownloads = failedDownloads;
            }
            return logs;
        }
        const klinika = cliniks[currentIndex];
        const klinikaUser = Object.keys(klinika.klinika);
        const turaID = pronadjiTuruZaKliniku(klinika.id, ture);
        const fileName = `${turaID || ""} ${klinika.naziv?.toUpperCase()} ${suffix ? ` - ${suffix}` : ""}.xlsx`;
        const filePath = path.join(saveFolder, fileName);
        const fileUrl = `${url}?kategorija=${category}&date=${date}&firm=${klinika.firm}&user[]=${klinikaUser.join("&user[]=")}`;
        console.log(`📥 Preuzimam: ${fileUrl} -> ${filePath} (Pokušaji preostali: ${attemptsLeft})`);
        try {
            // await downloadFile(fileUrl, filePath, refererUrl, klinika.firm, klinika.user, date, session);
            await downloadFile({
                fileUrl,
                filePath,
                refererUrl,
                firm: klinika.firm,
                user: klinikaUser.map(Number),
                date,
                session
            });
            console.log(`✅ Preuzet: ${filePath}`);
            logs.downloads.push(filePath);
            currentIndex++;
            await sleep(1000);
            return await downloadNext();
        }
        catch (error) {
            if (error instanceof Error) {
                console.log("Greška:", error.message); // ✅ radi
                logs.status = error.message;
                return logs;
            }
            if (attemptsLeft > 1) {
                console.log(`🔄 Pokušavam ponovo za ${fileUrl}...`);
                await sleep(3000);
                return await downloadNext(attemptsLeft - 1);
            }
            else {
                console.error(`🚨 Neuspešno preuzimanje ${fileUrl} posle 3 pokušaja. Preskačem.`);
                failedDownloads.push(fileUrl);
                currentIndex++;
                await sleep(1000);
                return await downloadNext();
            }
        }
    }
    return await downloadNext();
}
export async function printDostavnaTura(folderPath, dostavneTure, klinike, turaId) {
    const tura = dostavneTure.find(t => t.id === turaId);
    if (!tura) {
        console.error("Tura nije pronađena.");
        return;
    }
    let allFiles;
    try {
        const files = await fsp.readdir(folderPath);
        allFiles = files.filter(f => f.toLowerCase().endsWith('.xlsx') || f.toLowerCase().endsWith('.xls'));
    }
    catch (err) {
        console.error("Greška pri čitanju fajlova iz foldera:", err);
        return;
    }
    const klinikeZaStampu = klinike.filter(k => tura.klinike.includes(k.id));
    try {
        for (const klinika of klinikeZaStampu) {
            const naziv = klinika.naziv.trim().toLowerCase().replace(/\s+/g, ' ');
            const fileRegex = new RegExp(`^(?:\\d{1,2}\\s*)?${naziv}(?: - .+)?\\.xls[x]?$`, 'i');
            const matchingFiles = allFiles.filter(file => fileRegex.test(file.toLowerCase()));
            const alreadyPrinted = new Set();
            for (const fileName of matchingFiles) {
                if (alreadyPrinted.has(fileName))
                    continue;
                // const fullPath = path.join(folderPath, fileName);
                console.log(`Štampam za kliniku "${klinika.naziv}": ${fileName}`);
                try {
                    //Evo ovo je kod u kojeg bi ti sada trebao da umetneš štampanje excel fajlova pomoću VBA koda.
                    alreadyPrinted.add(fileName);
                }
                catch (err) {
                    console.error(`Greška pri štampi fajla ${fileName}:`, err);
                }
            }
        }
    }
    catch (err) {
        console.error("Excel COM objekat nije mogao da se koristi:", err);
    }
    console.log("Završena štampa za turu:", turaId);
}
const forbiddenChars = ['[', '\\', '/', '$', '(', ')', ']'];
export const isRegexKeyword = (keyword) => forbiddenChars.some(char => keyword.includes(char));
export const hasKeyword = (filterGroup, dietName) => {
    return filterGroup.keywords?.some(keyword => {
        if (typeof dietName !== 'string')
            return false;
        if (isRegexKeyword(keyword)) {
            try {
                const regex = new RegExp(keyword, 'i'); // i = case-insensitive
                return regex.test(dietName);
            }
            catch {
                return false; // ako regex nije validan, preskoči ga  
            }
        }
        else {
            return dietName.toUpperCase().includes(keyword.toUpperCase());
        }
    });
};
export function pronadjiTuruZaKliniku(userId, dostavneTure) {
    for (const tura of dostavneTure) {
        if (tura.klinike.includes(userId)) {
            return tura.id;
        }
    }
    return null; // ako nije pronađena
}
export async function getClinicsWithSpecMeals(filePath, dietFilters) {
    const workbook = new ExcelJS.Workbook();
    //Otvaramo excel fajl na datoj putanji
    try {
        await workbook.xlsx.readFile(filePath);
    }
    catch (error) {
        console.error("Greška prilikom čitanja Excel fajla", error);
        throw new Error(`Ne mogu da otvorim fajl: ${filePath}`);
    }
    const sheet = workbook.worksheets[0];
    const FIRST_CLINIC_ROW = 2;
    const FIRST_CLINIC_COL = 3;
    const DIET_COL = 2; // B
    const FIRST_DIET_ROW = 4;
    const CLINIC_ROW = 2;
    let col = FIRST_CLINIC_COL;
    let lastClinicCol;
    // Pronalazimo zadnju kolonu klinke (lastClinicCol)
    while (true) {
        const cell = sheet.getRow(FIRST_CLINIC_ROW).getCell(col).value;
        if (!cell || cell.toString().trim() === "" || cell.toString().trim() === "0") {
            lastClinicCol = col;
            break; // kraj klinika
        }
        col++;
    }
    let row = FIRST_DIET_ROW;
    const specDietsClinics = [];
    while (true) {
        const dietName = sheet.getRow(row).getCell(DIET_COL).value?.toString();
        let hasKeywordData = false;
        if (!dietName || dietName.toString().trim() === "" || dietName.toString().trim() === "0") {
            break; // kraj dijeta
        }
        // Promveravamo da li naziv dijete sadrži neki od filtera za specijalne obroke
        for (const filter of dietFilters) {
            if (!filter?.title || !Array.isArray(filter.keywords))
                continue;
            if (hasKeyword(filter, dietName)) {
                hasKeywordData = true;
            }
            break;
        }
        // Ako u datom redu naziv dijete ima ključnu reč (filter za spec obrok), onda prođi kroz sve kolone (brojke) tog reda (te dijete)
        if (hasKeywordData) {
            let col = FIRST_CLINIC_COL;
            while (true) {
                const cell = sheet.getRow(row).getCell(col).value;
                if (col === lastClinicCol) {
                    break; // kraj klinika
                }
                // Ako postoji neka vrednost (veća od 0) za datu dijetu sa specijalnim obrokom, vidi za koju kliniku se odnosi i ubaci je u niz specDietsClinics
                if (cell && Number(cell) > 0) {
                    const clinicName = sheet.getRow(CLINIC_ROW).getCell(col).value?.toString();
                    if (clinicName) {
                        specDietsClinics.push(clinicName);
                    }
                }
                col++;
            }
        }
        row++;
    }
    return [...new Set(specDietsClinics)];
}
export async function getClinicsWithOrderedProducts(filePaths) {
    const result = {
        "1": { date: "", clinics: [] },
        "2": { date: "", clinics: [] },
        "3": { date: "", clinics: [] }
    };
    for (const filePath of filePaths) {
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.readFile(filePath);
            console.log("Opened:", filePath);
        }
        catch (error) {
            console.error("Greška prilikom čitanja Excel fajla", error);
            throw new Error(`Ne mogu da otvorim fajl: ${filePath}`);
        }
        // const FIRST_CLINIC_ROW = 2;
        const FIRST_CLINIC_COL = 3;
        const DIET_COL = 2; // B
        const FIRST_DIET_ROW = 4;
        const CLINIC_ROW = 2;
        const DATE_CELL = "B3";
        let col = FIRST_CLINIC_COL;
        const sheet = workbook.worksheets[0];
        let lastClinicCol;
        // Pronalazimo zadnju kolonu klinke (lastClinicCol)
        while (true) {
            const cell = sheet.getRow(CLINIC_ROW).getCell(col).value;
            if (!cell || cell.toString().trim() === "" || cell.toString().trim() === "0") {
                lastClinicCol = col;
                break; // kraj klinika
            }
            col++;
        }
        console.log("lastClinicCol", lastClinicCol);
        // Pronalazimo red za ukupne iznose 
        let totalAmountsRow;
        let row = FIRST_DIET_ROW;
        while (true) {
            const cell = sheet.getCell(row, DIET_COL).value;
            if (cell === null ||
                cell === undefined ||
                cell.toString().trim() === "" ||
                cell.toString().trim() === "0") {
                totalAmountsRow = row;
                break;
            }
            row++;
        }
        console.log("totalAmountsRow", totalAmountsRow);
        const clinicNames = [];
        for (let i = FIRST_CLINIC_COL; i <= lastClinicCol; i++) {
            const cell = sheet.getRow(totalAmountsRow).getCell(i).value;
            if (cell && Number(cell) > 0) {
                const clinicName = sheet.getRow(CLINIC_ROW).getCell(i).value;
                if (clinicName && clinicName !== "") {
                    clinicNames.push(clinicName.toString());
                }
            }
        }
        console.log("clinicNames", clinicNames);
        const dateCell = sheet.getCell(DATE_CELL)?.toString();
        let dateMeal;
        if (dateCell && dateCell !== "") {
            dateMeal = parseDateAndMeal(dateCell);
        }
        else {
            throw new Error("Nema informacije o datumu i obroku");
        }
        if (dateMeal && clinicNames) {
            if (dateMeal.meal === "Doručak") {
                result["1"] = {
                    date: dateMeal.date,
                    clinics: clinicNames
                };
            }
            else if (dateMeal.meal === "Ručak") {
                result["2"] = {
                    date: dateMeal.date,
                    clinics: clinicNames
                };
            }
            else if (dateMeal.meal === "Večera") {
                result["3"] = {
                    date: dateMeal.date,
                    clinics: clinicNames
                };
            }
        }
    }
    return result;
}
export function parseDateAndMeal(input) {
    const regex = /(\d{2}[./-]\d{2}[./-]\d{4})\s*-\s*(Doručak|Ručak|Večera)/i;
    const match = input.match(regex);
    if (!match)
        return null;
    const [, date, meal] = match;
    return {
        date,
        meal: meal
    };
}
