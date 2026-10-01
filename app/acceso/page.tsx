"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        : null;

export default function Acceso() {
    const router = useRouter();
    const [modo, setModo] = useState<"login" | "registro">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    async function enviar(e: React.FormEvent) {
        e.preventDefault();
        setCargando(true);
        setMensaje("");

        if (!supabase) {
            setMensaje("Falta la configuración de Supabase en las variables de entorno.");
            setCargando(false);
            return;
        }

        try {
            if (modo === "registro") {
                const { error } = await supabase.auth.signUp({ email, password });
                setMensaje(
                    error
                        ? error.message
                        : "Cuenta creada. Revisa tu email para confirmarla y luego inicia sesión."
                );
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    setMensaje(error.message);
                } else {
                    router.push("/");
                    router.refresh();
                }
            }
        } catch (error) {
            const message =
                error && typeof error === "object" && "message" in error
                    ? String((error as { message?: string }).message)
                    : "No se pudo completar la operación.";
            setMensaje(message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <form
                onSubmit={enviar}
                className="w-full max-w-sm space-y-4 rounded-xl border border-gray-300 p-6"
            >
                <h1 className="text-2xl font-bold">
                    {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </h1>

                <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-gray-400 bg-transparent p-2"
                />
                <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded border border-gray-400 bg-transparent p-2"
                />

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full rounded bg-orange-500 p-2 font-semibold text-white disabled:opacity-50"
                >
                    {cargando ? "Un momento..." : modo === "login" ? "Entrar" : "Registrarme"}
                </button>

                {mensaje && <p className="text-sm">{mensaje}</p>}

                <button
                    type="button"
                    onClick={() => setModo(modo === "login" ? "registro" : "login")}
                    className="text-sm underline"
                >
                    {modo === "login"
                        ? "¿No tienes cuenta? Regístrate"
                        : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
            </form>
        </main>
    );
}