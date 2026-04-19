import { Bell, Search, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function Topbar({ onMenu, title, subtitle }: { onMenu: () => void; title: string; subtitle?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur border-b border-border flex items-center gap-3 px-4 sm:px-6">
      <button
        onClick={onMenu}
        className="lg:hidden p-2 rounded-md hover:bg-secondary ring-focus"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="label-mono">Admin Console</div>
        <h1 className="font-display text-lg sm:text-xl font-bold leading-tight truncate">
          {title}
          {subtitle && <span className="text-muted-foreground font-normal text-sm ml-2">{subtitle}</span>}
        </h1>
      </div>

      <div className="hidden md:flex items-center h-10 px-3 gap-2 rounded-md bg-input border border-border w-72 ring-focus focus-within:border-primary/60">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Tezkor qidiruv..."
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground">⌘K</kbd>
      </div>

      <button
        onClick={toggle}
        className="p-2 rounded-md hover:bg-secondary ring-focus"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <button className="relative p-2 rounded-md hover:bg-secondary ring-focus" aria-label="Bildirishnomalar">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
      </button>

      <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-border h-10">
        <img
          src="https://api.dicebear.com/7.x/initials/svg?seed=Aziz&backgroundColor=FF6633"
          alt="Admin"
          className="h-8 w-8 rounded-full"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold">Aziz K.</div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Super Admin</div>
        </div>
      </div>
    </header>
  );
}
