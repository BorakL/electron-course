// ConfirmContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type ConfirmOptions = {
  message: string;
  onConfirm?: () => void;
  inform?: boolean;
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => void;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setVisible(true);
  };

  const handleConfirm = () => {
    if(options?.onConfirm){
      options.onConfirm();
    }
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const showText = (tekst:string) => {
    return tekst.split('\n').map((line, i) => (
      <p key={i}>{line}</p>))
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {visible && options && (
        <>
        <div className="modal-backdrop fade show"></div>
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Potvrda</h5>
              </div>
              <div className="modal-body">
                <p>{showText(options.message)}</p>
              </div>
              {!options.inform ? 
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Otkaži
                </button>
                <button className="btn btn-danger" onClick={handleConfirm}>
                  Obriši
                </button>
              </div> :
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Ok
                </button> 
              </div>
              }
              
            </div>
          </div>
        </div>
        </>
      )}
    </ConfirmContext.Provider>
  );
};
