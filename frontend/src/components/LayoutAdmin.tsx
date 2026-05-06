import { Outlet } from 'react-router-dom';
import { BarraLateralAdmin } from './BarraLateralAdmin';
import { BarraSuperiorAdmin } from './BarraSuperiorAdmin';
import { ToastsAdmin } from './ToastsAdmin';

export function LayoutAdmin() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <BarraLateralAdmin />
      <ToastsAdmin />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
        <BarraSuperiorAdmin />
        <main className="flex-1 pt-24 px-8 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
