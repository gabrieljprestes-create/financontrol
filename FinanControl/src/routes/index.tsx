import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LineChart, Target, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/Brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinanControl — Sua vida financeira sob controle" },
      {
        name: "description",
        content:
          "Plataforma simples e elegante para gerenciar receitas, despesas e metas pessoais. Tudo em um só lugar.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
            Sua vida financeira sob controle.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-xl">
            Plataforma simples e elegante para gerenciar receitas, despesas e metas
            pessoais. Tudo em um só lugar.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Comece grátis <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <DashboardPreview />
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<LineChart className="h-6 w-6 text-primary" />}
          title="Dashboard intuitivo"
          text="Saldo, receitas e despesas em tempo real."
        />
        <FeatureCard
          icon={<Target className="h-6 w-6 text-primary" />}
          title="Metas personalizadas"
          text="Acompanhe seu progresso."
        />
        <FeatureCard
          icon={<ShieldCheck className="h-6 w-6 text-primary" />}
          title="Seguro e privado"
          text="Seus dados ficam no seu navegador."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-slate-600 text-sm">{text}</p>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <Brand className="scale-90 origin-left" />
        <div className="flex items-center gap-2 text-slate-500">
          <div className="h-7 w-7 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Saldo atual", value: "R$ 5.280,75", color: "text-emerald-600" },
          { label: "Receitas", value: "R$ 8.750,00", color: "text-emerald-600" },
          { label: "Despesas", value: "R$ 3.469,25", color: "text-rose-600" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-100 p-3">
            <div className="text-slate-500">{c.label}</div>
            <div className={`font-bold mt-1 ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-100 p-3 h-32 flex items-end gap-1">
          {[60, 45, 70, 55, 80, 50].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1 items-center">
              <div className="w-full rounded-sm bg-emerald-400" style={{ height: `${h}%` }} />
              <div className="w-full rounded-sm bg-rose-400" style={{ height: `${h * 0.5}%` }} />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-100 p-3 h-32 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border-[10px] border-primary border-r-emerald-400 border-b-amber-400 border-l-rose-400" />
        </div>
      </div>
    </div>
  );
}
