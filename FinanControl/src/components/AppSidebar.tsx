import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, ArrowLeftRight, Target, LogOut } from "lucide-react";
import { Brand } from "./Brand";
import { useAuth } from "@/hooks/useAuth";
import { resetStore } from "@/lib/store";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { to: "/metas", label: "Metas", icon: Target },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    resetStore();
    navigate({ to: "/login" });
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="p-6">
        <Brand />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <div className="px-3 py-2 text-xs text-slate-500 truncate" title={user?.email ?? ""}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
