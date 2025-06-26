import { createContext, useContext, useState } from "react";

const SessionContext = createContext<{
  session: string | null;
  setSession: (s: string | null) => void;
}>({ session: null, setSession: () => {} });

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<string | null>(null);
  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);