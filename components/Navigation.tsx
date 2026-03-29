"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ListMusic, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ROUTES = [
  { name: "Accueil", path: "/", icon: Home },
  { name: "Recherche", path: "/search", icon: Search },
  { name: "Playlists", path: "/playlists", icon: ListMusic },
  { name: "Paramètres", path: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around z-50">
        {ROUTES.map((route) => {
          const isActive = pathname === route.path;
          const Icon = route.icon;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{route.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Musicords</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {ROUTES.map((route) => {
            const isActive = pathname === route.path;
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{route.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
