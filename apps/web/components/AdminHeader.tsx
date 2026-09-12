export default function AdminHeader() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40">
      <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md flex-1 max-w-lg">
          <div className="relative w-full flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
              search
            </span>
            <input
              className="w-full pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
              placeholder="Lookup ticket ID (e.g. B-108), desk, or visitor..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-space-md shrink-0">
          <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-secondary-container/40 text-on-secondary-container">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-ui text-label-ui">
              System Online
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
