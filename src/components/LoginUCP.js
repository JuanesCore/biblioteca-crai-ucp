import { useState } from "react";
import "./LoginUCP.css"; // estilos que vamos a crear
import data from "../data.json"; // tu JSON con usuarios

export default function LoginUCP({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = data.users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <img src={require("../components/imagen")} alt="UCP Logo" />
      </div>

      <div className="login-box">
        <h2>Login Administrador</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Ingresar</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
