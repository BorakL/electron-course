import fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import os from 'os';
import { Klinika } from './types.js';
// import {wrapper} from 'axios-cookiejar-support';


export function isDev(): boolean {
    return process.env.NODE_ENV === 'development'
}

// Funkcija za preuzimanje fajla
export async function downloadFile(url:string, filePath:string, refererUrl: string|undefined, firm:number, user:number, date:string, session:string): Promise<void> {
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
        }else{
            return new Promise((resolve, reject) => {
                response.data.pipe(writer)
                writer.on("finish", () => resolve());
                writer.on("error", (error) => reject(error));
            })
        }
    }catch(error){
        writer.close(); // Close file stream to prevent leaks
        throw error;
    } 
};

export function createFullFolder(klinike: Klinika[], url:string|undefined, refererUrl:string|undefined, kategorija: number, date:string, session:string): void{
    const today = date;
    const desktopPath = path.join(os.homedir(), "Desktop");
    const saveFolder = path.join(desktopPath, today); 
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }
    // Prolazak kroz niz i preuzimanje fajlova
    downloadMoreFiles(klinike, url, refererUrl, kategorija, date, saveFolder, session);
}

const downloadMoreFiles = async (klinike: Klinika[], url:string|undefined, refererUrl:string|undefined, kategorija:number, date:string, saveFolder:string, session:string) => {
    for (const klinika of klinike) {
        const fileName = `${klinika.naziv}.xlsx`; // Naziv fajla
        const filePath = path.join(saveFolder, fileName);
        const fileUrl = `${url}?kategorija=${kategorija}&date=${date}&firm=${klinika.firm}&user=${klinika.user}`;         
        try {
            console.log(`Preuzimam: ${fileUrl} -> ${filePath}`);
            await downloadFile(fileUrl, filePath, refererUrl, klinika.firm, klinika.user, date, session);
            console.log(`✅ Preuzet: ${filePath}`);
        } catch (error) {
            console.error(`❌ Greška pri preuzimanju ${fileUrl}:`, (error as Error).message);
        }
    }
}