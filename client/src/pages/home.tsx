import { Header } from '@/components/Header';
import { FunctionInput } from '@/components/FunctionInput';
import { GraphVisualization } from '@/components/GraphVisualization';
import { SpecializedTools } from '@/components/SpecializedTools';
import { GradientVisualizer } from '@/components/GradientVisualizer';
import { MathematicalReference } from '@/components/MathematicalReference';
import { Footer } from '@/components/Footer';
import { useMathFunction } from '@/hooks/useMathFunction';

export default function Home() {
  const {
    state,
    functionPoints,
    derivativePoints,
    functionValue,
    derivativeValue,
    integralValue,
    limitResult,
    tangentLine,
    normalLine,
    riemannData,
    isValidExpression,
    updateExpression,
    updateMode,
    updatePointOfInterest,
    updateZoom,
    updateXRange,
    updateIntegralBounds,
    updateLimitTarget,
    updateSubdivisions,
    updateIntegralMethod,
    loadPreset
  } = useMathFunction();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <FunctionInput
          expression={state.expression}
          mode={state.mode}
          onExpressionChange={updateExpression}
          onModeChange={updateMode}
          onLoadPreset={loadPreset}
          isValidExpression={isValidExpression}
        />

        <GraphVisualization
          functionPoints={functionPoints}
          derivativePoints={derivativePoints}
          functionValue={functionValue}
          derivativeValue={derivativeValue}
          pointOfInterest={state.pointOfInterest}
          xMin={state.xMin}
          xMax={state.xMax}
          zoom={state.zoom}
          mode={state.mode}
          tangentLine={tangentLine}
          riemannData={riemannData}
          onPointChange={updatePointOfInterest}
          onZoomChange={updateZoom}
          onXRangeChange={updateXRange}
        />

        <SpecializedTools
          mode={state.mode}
          limitTarget={state.limitTarget}
          limitResult={limitResult}
          integralBounds={state.integralBounds}
          integralValue={integralValue}
          integralMethod={state.integralMethod}
          subdivisions={state.subdivisions}
          onLimitTargetChange={updateLimitTarget}
          onIntegralBoundsChange={updateIntegralBounds}
          onIntegralMethodChange={updateIntegralMethod}
          onSubdivisionsChange={updateSubdivisions}
        />

        <GradientVisualizer
          functionPoints={functionPoints}
          pointOfInterest={state.pointOfInterest}
          tangentLine={tangentLine}
          normalLine={normalLine}
          derivativeValue={derivativeValue}
          functionValue={functionValue}
          xMin={state.xMin}
          xMax={state.xMax}
          onPointChange={updatePointOfInterest}
        />

        <MathematicalReference />
      </main>

      <Footer />
    </div>
  );
}
