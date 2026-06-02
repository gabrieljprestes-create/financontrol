import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ArrowLeftRight, Target } from "lucide-react";
import { AppSidebar } from "./AppSidebar";

const mobileItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/metas", label: "Metas", icon: Target },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 z-40">
        {mobileItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${active ? "text-primary" : "text-slate-500"}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
