"use client";

interface ComingSoonProps {
    title: string;
    emoji: string;
    subtitle?: string;
}

export default function ComingSoon({
    title,
    emoji,
    subtitle = "Próximamente — Tanda 2",
}: ComingSoonProps) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 16,
                color: "var(--text-muted)",
            }}
        >
            <span style={{ fontSize: 64 }}>{emoji}</span>
            <h2
                style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-ui)",
                    margin: 0,
                }}
            >
                {title}
            </h2>
            <p style={{ fontSize: 14, fontFamily: "var(--font-ui)" }}>{subtitle}</p>
        </div>
    );
}
