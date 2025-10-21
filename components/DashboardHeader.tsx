"use client";
export default function DashboardHeader({ title, subtitle }:{title:string; subtitle?:string}) {
  return (
    <header className="my-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </header>
  );
}
