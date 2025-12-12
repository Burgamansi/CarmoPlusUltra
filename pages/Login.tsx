import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const {
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        user,
    } = useAuth();

    const navigate = useNavigate();

    // Se já estiver logado, redireciona
    if (user) {
        navigate("/dashboard");
    }

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [modo, setModo] = useState<"login" | "register">("login");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    const entrarGoogle = async () => {
        try {
            setLoading(true);
            await loginWithGoogle();
            navigate("/dashboard");
        } catch (e) {
            setErro("Falha ao conectar com Google.");
        } finally {
            setLoading(false);
        }
    };

    const entrarEmail = async () => {
        try {
            setLoading(true);
            setErro("");
            await loginWithEmail(email, senha);
            navigate("/dashboard");
        } catch (e) {
            setErro("Credenciais inválidas. Verifique email e senha.");
        } finally {
            setLoading(false);
        }
    };

    const registrar = async () => {
        try {
            setLoading(true);
            setErro("");
            await registerWithEmail(email, senha);
            navigate("/dashboard");
        } catch (e) {
            setErro("Erro ao criar conta. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
                padding: 20,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    padding: 30,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
                    {modo === "login" ? "Entrar no Carmo+ Ultra" : "Criar Conta"}
                </h2>

                {erro && (
                    <p style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                        {erro}
                    </p>
                )}

                {/* Campo de email */}
                <input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: "100%",
                        padding: 12,
                        marginBottom: 10,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        boxSizing: "border-box",
                        color: "#333"
                    }}
                />

                {/* Campo de senha */}
                <input
                    type="password"
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={{
                        width: "100%",
                        padding: 12,
                        marginBottom: 20,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        boxSizing: "border-box",
                        color: "#333"
                    }}
                />

                {/* Botão principal */}
                <button
                    onClick={modo === "login" ? entrarEmail : registrar}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        borderRadius: 8,
                        background: "#0066ff",
                        border: "none",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: 15,
                    }}
                >
                    {loading
                        ? "Carregando..."
                        : modo === "login"
                            ? "Entrar"
                            : "Criar Conta"}
                </button>

                {/* Botão Google */}
                <button
                    onClick={entrarGoogle}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        borderRadius: 8,
                        background: "#db4437",
                        border: "none",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: 20,
                    }}
                >
                    Entrar com Google
                </button>

                {/* Trocar modo */}
                <p style={{ textAlign: "center", color: "#666" }}>
                    {modo === "login" ? (
                        <>
                            Não tem conta?{" "}
                            <span
                                style={{ color: "#0066ff", cursor: "pointer" }}
                                onClick={() => setModo("register")}
                            >
                                Criar agora
                            </span>
                        </>
                    ) : (
                        <>
                            Já possui conta?{" "}
                            <span
                                style={{ color: "#0066ff", cursor: "pointer" }}
                                onClick={() => setModo("login")}
                            >
                                Fazer login
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};
