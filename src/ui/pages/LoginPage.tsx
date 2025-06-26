import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/sessionContext";
import { useState } from "react";

type LoginFormInputs = {
  username: string;
  password: string;
};

type ManualSessionFormInputs = {
  manualSession: string;
};

export default function LoginPage() {
  const loginForm = useForm<LoginFormInputs>({
  defaultValues: {
    username: localStorage.getItem("username") || "",
    password: localStorage.getItem("password") || ""
  }
});
  const manualForm = useForm<ManualSessionFormInputs>();

  const { setSession } = useSession();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLoginSubmit = async (data: LoginFormInputs) => {
    try {
      const session = await window.electronApp.loginAndGetSession(
        data.username,
        data.password
      );
      if (session) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("password", data.password);
        setSession(session);
        navigate("/download");
      } else {
        setLoginError("Neuspešno logovanje. Proverite korisničko ime i lozinku.");
      }
    } catch {
      setLoginError("Greška pri komunikaciji sa serverom.");
    }
  };

  const handleManualSessionSubmit = (data: ManualSessionFormInputs) => {
    const trimmed = data.manualSession.trim();
    if (trimmed) {
      setSession(trimmed);
      navigate("/download");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Prijava</h2>

      {/* Login forma */}
      <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="mt-4">
        <div className="mb-3">
          <input
            {...loginForm.register("username", { required: true })}
            placeholder="Korisničko ime"
            className="form-control"
          />
          {loginForm.formState.errors.username && (
            <small className="text-danger">Obavezno korisničko ime</small>
          )}
        </div>
        <div className="mb-3">
          <input
            type="password"
            {...loginForm.register("password", { required: true })}
            placeholder="Lozinka"
            className="form-control"
          />
          {loginForm.formState.errors.password && (
            <small className="text-danger">Obavezna lozinka</small>
          )}
        </div>
        {loginError && <div className="alert alert-danger">{loginError}</div>}
        <button type="submit" className="btn btn-primary">
          Prijavi se
        </button>
      </form>

      <hr className="my-4" />

      {/* Direktni unos PHPSESSID */}
      <form onSubmit={manualForm.handleSubmit(handleManualSessionSubmit)}>
        <div className="mb-3">
          <input
            {...manualForm.register("manualSession", { required: true })}
            placeholder="Unesi PHPSESSID ručno"
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-secondary">
          Nastavi sa PHPSESSID
        </button>
      </form>
    </div>
  );
}
