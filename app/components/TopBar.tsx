'use client';

interface TopBarProps {
  title: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps) {
  return (
    <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}
