import React, { useEffect, useState } from "react";

export default function InstallAppGuide() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const installApp = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
        } else {
            setShowHelp(true);
        }
    };

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    return (
        <>
            <button
                onClick={installApp}
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#5a3e2b",
                    color: "#fff",
                    padding: "14px 22px",
                    borderRadius: 30,
                    border: "none",
                    fontWeight: 600,
                    zIndex: 9999,
                    boxShadow: "0 6px 16px rgba(0,0,0,.25)",
                    cursor: "pointer",
                }}
            >
                📲 Instalar App Carmo+
            </button>

            {showHelp && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.6)",
                        zIndex: 10000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 20,
                            maxWidth: 360,
                            textAlign: "center",
                        }}
                    >
                        <h3>Instalar Carmo+ Ultra</h3>

                        {isIOS ? (
                            <p>
                                No iPhone:
                                <br />
                                Toque em <b>Compartilhar</b> ⤴️
                                <br />
                                Depois <b>Adicionar à Tela de Início</b>
                            </p>
                        ) : (
                            <p>
                                No Android:
                                <br />
                                Toque nos <b>três pontinhos ⋮</b>
                                <br />
                                Selecione <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>
                            </p>
                        )}

                        <button
                            onClick={() => setShowHelp(false)}
                            style={{
                                marginTop: 12,
                                padding: "8px 14px",
                                borderRadius: 8,
                                border: "none",
                                background: "#ddd",
                                cursor: "pointer",
                            }}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
