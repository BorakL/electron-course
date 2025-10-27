import fs from 'fs';
import axios from 'axios';
import https from 'https';
import path from 'path';
import os from 'os';
import { CreateFullFolderParams, DostavnaTura, DostavnaTuraObject, DownloadFileParams, Klinika } from './types/types.js';
import { promises as fsp } from 'fs';
import winax from "winax";
import { readJsonFile } from './fsHelpers/jsonUtils.js';


interface ExcelSheet {
  PageSetup: {
    Zoom: boolean | number;
    FitToPagesWide: number;
    FitToPagesTall: number;
  };
  PrintOut: (from?: number, to?: number, copies?: number) => void;
}



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
                "Referer": `${refererUrl}?firm=${firm}&user[]=${user.join("&user[]=")}&date=${date}`,
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


export async function loginAndGetSession(username: string, password: string) {
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
  } catch (error) {
    console.error("Login error:", error);
    return null;
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
        session,
        groupId
    }: CreateFullFolderParams): Promise<Logs | undefined> {
    const mealMap: Record<number, string>  = {
      1: "D",
      2: "R",
      3: "V"
    }
    const dostavneTure: DostavnaTuraObject = await readJsonFile("dostavneTure.json")
    const ture: DostavnaTura[] = dostavneTure?.ture;
    let tura:DostavnaTura | undefined;
    if(groupId){
      tura = ture.find(tura => tura.id===groupId);
      if(tura && tura.klinike && tura.klinike.length > 0){
        cliniks = cliniks.filter(clinik => tura?.klinike.some(k => k===clinik.id))    
      }
    }
    const mealCategory = mealMap[category] || "";
    const today = groupId>0 ? `${groupId} ${date}-${mealCategory}` : `${date}-${mealCategory}`;
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
        const turaID = pronadjiTuruZaKliniku(klinika.id,ture)
        const fileName = `${turaID || ""} ${klinika.naziv?.toUpperCase()}.xlsx`;
        const filePath = path.join(saveFolder, fileName);
        const fileUrl = `${url}?kategorija=${category}&date=${date}&firm=${klinika.firm}&user[]=${klinika.user.join("&user[]=")}`;

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

  const klinikeZaStampu = klinike.filter(k => tura.klinike.includes(k.id));
  const excel = new winax.Object('Excel.Application');
  excel.Visible = false;
  
  try {

    for (const klinika of klinikeZaStampu) {
      const naziv = klinika.naziv.trim().toLowerCase().replace(/\s+/g, ' ');
      const fileRegex = new RegExp(`^(?:\\d{1,2}\\s*)?${naziv}(?: - .+)?\\.xls[x]?$`, 'i');
      const matchingFiles = allFiles.filter(file =>
        fileRegex.test(file.toLowerCase())
      );
      const alreadyPrinted = new Set<string>();

      for (const fileName of matchingFiles) {
        
        if (!excel || typeof excel.Workbooks?.Open !== 'function') {
          console.error("Excel nije dostupan ili nije pravilno instaliran.");
          return;
        }

        if (alreadyPrinted.has(fileName)) continue;
        const fullPath = path.join(folderPath, fileName);
        console.log(`Štampam za kliniku "${klinika.naziv}": ${fileName}`);

        let workbook = null;
        let sheet: ExcelSheet;

        try {
          workbook = excel.Workbooks.Open(fullPath);
          const sheetCount = workbook.Sheets.Count;
          console.log("Sheet count:", sheetCount);
          sheet = workbook.Sheets.Item(1);

          // Podešavanja štampe
          sheet.PageSetup.Zoom = false;
          sheet.PageSetup.FitToPagesWide = 1;
          sheet.PageSetup.FitToPagesTall = 1;

          // Štampanje
          await new Promise<void>((resolve, reject) => {
            try {
              sheet.PrintOut(1, 1, 2);
              resolve();
            } catch (err) {
              reject(err);
            }
          });

          workbook.Close(false);
          alreadyPrinted.add(fileName);
        } catch (err) {
          console.error(`Greška pri štampi fajla ${fileName}:`, err);
        }
      }
    }
    excel.Quit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    if(global.gc){
      global.gc()
    }
  } catch (err) {
    console.error("Excel COM objekat nije mogao da se koristi:", err);
  }
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


export function pronadjiTuruZaKliniku(
  userId: number,
  dostavneTure: DostavnaTura[]
): number | null {
  for (const tura of dostavneTure) {
    if (tura.klinike.includes(userId)) {
      return tura.id;
    }
  }
  return null; // ako nije pronađena
}