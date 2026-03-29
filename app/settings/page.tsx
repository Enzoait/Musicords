"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useMusicStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { name: "Clair", value: "light", icon: Sun },
    { name: "Sombre", value: "dark", icon: Moon },
    { name: "Système", value: "system", icon: Monitor },
  ];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Paramètres
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Personnalisez votre expérience Musicords.
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Thème de l'application
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                    isActive 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{t.name}</span>
                  {isActive && <Check className="w-4 h-4 absolute top-2 right-2" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Zone de danger
          </h2>
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
            <h3 className="font-bold text-red-600 dark:text-red-400 mb-2">Tout supprimer</h3>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-6">
              Cette action supprimera définitivement toutes vos playlists, votre historique d'écoute et vos réglages.
            </p>
            <button
              onClick={() => useMusicStore.getState().clearAllData()}
              className="px-6 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg active:scale-95"
            >
              Tout supprimer maintenant
            </button>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">À propos</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Musicords v0.1.0 - Lecteur audio YouTube premium.
          </p>
        </section>
      </div>
    </div>
  );
}
