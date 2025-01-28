export {};

declare global {
    interface Window {
        electronApp: { 
            createFullFolder: () => void;
        }
    }
}