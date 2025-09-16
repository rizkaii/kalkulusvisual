export function MathematicalReference() {
  const mathConcepts = [
    {
      title: 'DERIVATIVE',
      definition: "f'(x) = lim[h→0] [f(x+h) - f(x)] / h",
      interpretation: 'Rate of change of function at a point; slope of tangent line.'
    },
    {
      title: 'INTEGRAL',
      definition: '∫[a→b] f(x)dx = lim[n→∞] Σ f(xi)Δx',
      interpretation: 'Area under curve between bounds; accumulated change.'
    },
    {
      title: 'LIMIT',
      definition: 'lim[x→a] f(x) = L',
      interpretation: 'Value function approaches as input approaches specific value.'
    }
  ];

  return (
    <section className="mb-16">
      <h3 className="swiss-subtitle mb-8" data-testid="math-reference-title">MATHEMATICAL REFERENCE</h3>
      <div className="swiss-grid">
        {mathConcepts.map((concept, index) => (
          <div key={index} className="col-span-4">
            <div className="swiss-card h-full" data-testid={`concept-${index}`}>
              <h4 className="text-lg font-bold mb-3" data-testid={`concept-title-${index}`}>
                {concept.title}
              </h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Definition:</div>
                  <div className="math-expression text-xs" data-testid={`concept-definition-${index}`}>
                    {concept.definition}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">Interpretation:</div>
                  <p className="text-xs text-muted-foreground" data-testid={`concept-interpretation-${index}`}>
                    {concept.interpretation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
