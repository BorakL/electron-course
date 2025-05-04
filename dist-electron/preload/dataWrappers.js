import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFolder = path.join(__dirname, "..", "..", "data");
export const getFilePath = (fileName) => {
    return path.join(dataFolder, fileName);
};
