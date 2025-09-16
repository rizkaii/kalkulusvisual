import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SpecializedToolsProps {
  mode: string;
  limitTarget: number;
  limitResult: any;
  integralBounds: { lower: number; upper: number };
  integralValue: number;
  integralMethod: string;
  subdivisions: number;
  onLimitTargetChange: (target: number) => void;
  onIntegralBoundsChange: (lower: number, upper: number) => void;
  onIntegralMethodChange: (method: 'riemann' | 'trapezoidal' | 'simpson') => void;
  onSubdivisionsChange: (subdivisions: number) => void;
}

export function SpecializedTools({
  mode,
  limitTarget,
  limitResult,
  integralBounds,
  integralValue,
  integralMethod,
  subdivisions,
  onLimitTargetChange,
  onIntegralBoundsChange,
  onIntegralMethodChange,
  onSubdivisionsChange
}: SpecializedToolsProps) {
  return (
    <section className="mb-16">
      <h3 className="swiss-subtitle mb-8" data-testid="specialized-tools-title">SPECIALIZED TOOLS</h3>
      
      <div className="swiss-grid">
        {/* Limit Explorer */}
        <div className="col-span-6">
          <div className="swiss-card">
            <h4 className="text-xl font-bold mb-4" data-testid="limit-explorer-title">LIMIT EXPLORER</h4>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2" data-testid="limit-value-label">
                  Approach Value (a)
                </Label>
                <Input
                  type="number"
                  value={limitTarget}
                  step={0.1}
                  onChange={(e) => onLimitTargetChange(parseFloat(e.target.value) || 0)}
                  className="function-input w-full px-3 py-2 rounded-sm"
                  data-testid="limit-target-input"
                />
              </div>
              
              {limitResult && (
                <div className="bg-muted p-3 rounded-sm">
                  <div className="text-sm space-y-1">
                    <div data-testid="left-limit">
                      Left Limit: <span className="font-medium">
                        {limitResult.leftLimit !== null ? limitResult.leftLimit.toFixed(3) : '∞'}
                      </span>
                    </div>
                    <div data-testid="right-limit">
                      Right Limit: <span className="font-medium">
                        {limitResult.rightLimit !== null ? limitResult.rightLimit.toFixed(3) : '∞'}
                      </span>
                    </div>
                    <div className="font-bold" data-testid="limit-value">
                      Limit: <span>
                        {limitResult.exists 
                          ? limitResult.limit?.toFixed(3) 
                          : limitResult.limit !== null 
                            ? limitResult.limit.toFixed(3)
                            : 'DNE'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integral Calculator */}
        <div className="col-span-6">
          <div className="swiss-card">
            <h4 className="text-xl font-bold mb-4" data-testid="integral-calculator-title">INTEGRAL CALCULATOR</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="block text-sm font-medium mb-2" data-testid="lower-bound-label">
                    Lower Bound (a)
                  </Label>
                  <Input
                    type="number"
                    value={integralBounds.lower}
                    onChange={(e) => onIntegralBoundsChange(parseFloat(e.target.value) || 0, integralBounds.upper)}
                    className="function-input w-full px-3 py-2 rounded-sm"
                    data-testid="lower-bound-input"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2" data-testid="upper-bound-label">
                    Upper Bound (b)
                  </Label>
                  <Input
                    type="number"
                    value={integralBounds.upper}
                    onChange={(e) => onIntegralBoundsChange(integralBounds.lower, parseFloat(e.target.value) || 0)}
                    className="function-input w-full px-3 py-2 rounded-sm"
                    data-testid="upper-bound-input"
                  />
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2" data-testid="method-label">Method</Label>
                <Select 
                  value={integralMethod} 
                  onValueChange={(value: 'riemann' | 'trapezoidal' | 'simpson') => onIntegralMethodChange(value)}
                >
                  <SelectTrigger className="function-input w-full" data-testid="method-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riemann">Riemann Sum</SelectItem>
                    <SelectItem value="trapezoidal">Trapezoidal Rule</SelectItem>
                    <SelectItem value="simpson">Simpson's Rule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium mb-2" data-testid="subdivisions-label">
                  Number of Subdivisions
                </Label>
                <div className="slider-container">
                  <Slider
                    min={4}
                    max={1000}
                    step={4}
                    value={[subdivisions]}
                    onValueChange={([value]) => onSubdivisionsChange(value)}
                    className="w-full"
                    data-testid="subdivisions-slider"
                  />
                  <div className="text-center text-sm mt-1">
                    <span data-testid="subdivisions-value">{subdivisions}</span> subdivisions
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-3 rounded-sm">
                <div className="text-sm">
                  <div data-testid="integral-result">
                    Integral Value: <span className="font-bold text-accent">
                      {isFinite(integralValue) ? integralValue.toFixed(3) : 'undefined'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Area under curve from{' '}
                    <span data-testid="integral-lower">{integralBounds.lower}</span> to{' '}
                    <span data-testid="integral-upper">{integralBounds.upper}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
