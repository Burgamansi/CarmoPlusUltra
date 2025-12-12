import { useState } from "react";

type Props = {
    onSave: () => Promise<void> | void;
    confirmText?: string;
    successText?: string;
    label?: string;
};

export default function SaveButton({
    onSave,
    confirmText = "Deseja salvar as alterações?",
    successText = "Salvo com sucesso ✅",
    label = "Salvar",
}: Props) {
    const [saving, setSaving] = useState(false);

    const handleClick = async () => {
        if (saving) return;

        const ok = window.confirm(confirmText);
        if (!ok) return;

        try {
            setSaving(true);
            await onSave();
            alert(successText);
        } catch (e) {
            alert("Não foi possível salvar ❌");
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={saving}
            style={{
                background: saving ? "#9b7a63" : "#5a3e2b",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
            }}
        >
            {saving ? "Salvando..." : `💾 ${label}`}
        </button>
    );
}
