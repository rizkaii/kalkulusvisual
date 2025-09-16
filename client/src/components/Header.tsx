export function Header() {
  return (
    <header className="border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="swiss-grid">
          <div className="col-span-8">
            <h1 className="swiss-title mb-2" data-testid="main-title">CALCULUS</h1>
            <h2 className="swiss-title text-accent" data-testid="sub-title">VISUAL EXPLORER</h2>
          </div>
          <div className="col-span-4 flex items-end justify-end">
            <p className="text-muted-foreground font-medium" data-testid="description">
              Interactive Mathematical Visualization
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
