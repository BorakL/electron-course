import fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import os from 'os';
import { CreateFullFolderParams, DostavnaTura, DownloadFileParams, ExcelApplication, Klinika } from './types/types.js';
import { promises as fsp } from 'fs';
import winax from "winax";
// type ActiveXConstructor<T> = new (progId: string) => T;

// Napravi konstruktor za Excel.Application
// const ExcelApp = winax as unknown as ActiveXConstructor<ExcelApplication>;

export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

type Logs = {
    status:string, 
    downloads:string[],
    failedDownloads:string[]
}
interface FilterGroup {
  title: string;
  keywords: string[];
}

// Funkcija za preuzimanje fajla (koristi `arraybuffer`)
export async function downloadFile({
    fileUrl, 
    filePath, 
    refererUrl, 
    firm, 
    user, 
    date, 
    session
}: DownloadFileParams): Promise<void> {
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
                "Referer": `${refererUrl}?firm=${firm}&user=${user}&date=${date}`,
                "Cookie": `PHPSESSID=${session}`
            }
        });
        const serverResponse = response.data?.toString();
        if (response.status !== 200 ) {
            throw new Error("❌ Server errro");
        }else if(!response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') && serverResponse.includes("Prijavi se") || serverResponse.includes("Prijavite se")){
            throw new Error("INVALID_SESSION")
        }else if(!response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')){
            throw new Error ("Neispravan odgovor - fajl nije Excel")
        }
        
        fs.writeFileSync(filePath, response.data);
        console.log(`✅ Fajl uspešno preuzet: ${filePath}`);
    } catch (error) {
        console.error(`⚠️ Greška pri preuzimanju fajla ${filePath}:`, error);
        throw error;
    }
}

// Funkcija za kreiranje foldera i preuzimanje fajlova sa retry mehanizmom
// export function createFullFolder(cliniks: Klinika[], url: string | undefined, refererUrl: string | undefined, category: number, date: string, session: string): void {
    export async function createFullFolder({
        cliniks,
        url,
        refererUrl,
        category,
        date,
        session
    }: CreateFullFolderParams): Promise<Logs | undefined> {
    const today = date;
    const desktopPath = path.join(os.homedir(), "Desktop");
    const saveFolder = path.join(desktopPath, today);

    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    let currentIndex = 0;
    const failedDownloads: string[] = [];
    const logs:Logs = {
        status: "",
        downloads: [],
        failedDownloads: []
    }

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
        const fileName = `${klinika.naziv?.toUpperCase()}.xlsx`;
        const filePath = path.join(saveFolder, fileName);
        const fileUrl = `${url}?kategorija=${category}&date=${date}&firm=${klinika.firm}&user=${klinika.user}`;

        console.log(`📥 Preuzimam: ${fileUrl} -> ${filePath} (Pokušaji preostali: ${attemptsLeft})`);

        try {
            // await downloadFile(fileUrl, filePath, refererUrl, klinika.firm, klinika.user, date, session);
            await downloadFile({
                fileUrl,
                filePath,
                refererUrl,
                firm: klinika.firm,
                user: klinika.user,
                date,
                session
            })
            console.log(`✅ Preuzet: ${filePath}`);
            logs.downloads.push(filePath)
            currentIndex++; 
            await sleep(1000);
            return await downloadNext();
        } catch (error) {
            if (error instanceof Error) {
                console.log("Greška:", error.message); // ✅ radi
                logs.status = error.message;
                return logs;
            } 
            if (attemptsLeft > 1) {
                console.log(`🔄 Pokušavam ponovo za ${fileUrl}...`);
                await sleep(3000);
                return await downloadNext(attemptsLeft - 1);
            } else {
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



export async function printDostavnaTura(
  folderPath: string,
  dostavneTure: DostavnaTura[],
  klinike: Klinika[],
  turaId: number
): Promise<void> {
  const tura = dostavneTure.find(t => t.id === turaId);
  if (!tura) {
    console.error("Tura nije pronađena.");
    return;
  }

  let allFiles: string[];
  try { 
    const files = await fsp.readdir(folderPath);
    allFiles = files.filter(f =>
      f.toLowerCase().endsWith('.xlsx') || f.toLowerCase().endsWith('.xls')
    );
  } catch (err) {
    console.error("Greška pri čitanju fajlova iz foldera:", err);
    return;
  }

  const klinikeZaStampu = klinike.filter(k => tura.klinike.includes(k.user));

const excel = new winax.Object('Excel.Application') as ExcelApplication;


  excel.Visible = false;

  for (const klinika of klinikeZaStampu) {
    const naziv = klinika.naziv.trim().toLowerCase();

    const matchingFiles = allFiles.filter(file =>
      file.toLowerCase().includes(naziv)
    );

    for (const fileName of matchingFiles) {
      const fullPath = path.join(folderPath, fileName);
      console.log(`Štampam za kliniku "${klinika.naziv}": ${fileName}`);

      try {
        const workbook = excel.Workbooks.Open(fullPath);
        const sheet = workbook.Sheets.Item(1);

        // Podešavanja štampe
        sheet.PageSetup.CenterHorizontally = true; 
        sheet.PageSetup.FitToPagesWide = 1;
        sheet.PageSetup.FitToPagesTall = 1;

        // Štampanje
        await new Promise<void>((resolve, reject) => {
          try {
            sheet.PrintOut();
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        workbook.Close(false);
      } catch (err) {
        console.error(`Greška pri štampi fajla ${fileName}:`, err);
      }
    }
  }

  excel.Quit();
  console.log("Završena štampa za turu:", turaId);
}


const forbiddenChars = ['[', '\\', '/', '$', '(', ')', ']'];

export const isRegexKeyword = (keyword: string): boolean =>
  forbiddenChars.some(char => keyword.includes(char));


export const hasKeyword = (filterGroup:FilterGroup, dietName:string):boolean => {
  return filterGroup.keywords?.some(keyword => {
    if (typeof dietName !== 'string') return false;
    if (isRegexKeyword(keyword)) {
      try {
        const regex = new RegExp(keyword, 'i'); // i = case-insensitive
        return regex.test(dietName);
      } catch {
        return false; // ako regex nije validan, preskoči ga  
      }
    } else {
      return dietName.toUpperCase().includes(keyword.toUpperCase());
    }
  });
} 