import path from 'path';
import { app } from 'electron';
export function getPreloadPath() {
    return app.isPackaged
        ? path.join(process.resourcesPath, "dist-electron", "preload.cjs")
        : path.join(process.cwd(), "dist-electron", "preload.cjs");
}
