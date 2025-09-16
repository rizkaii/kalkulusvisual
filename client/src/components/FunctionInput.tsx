import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MathParser } from '@/lib/mathParser';

interface FunctionInputProps {
  expression: string;
  mode: 'derivative' | 'integral' | 'limit';
  onExpressionChange: (expression: string) => void;
  onModeChange: (mode: 'derivative' | 'integral' | 'limit') => void;
  onLoadPreset: (expression: string) => void;
  isValidExpression: boolean;
}

export function FunctionInput({
  expression,
  mode,
  onExpressionChange,
  onModeChange,
  onLoadPreset,
  isValidExpression
}: FunctionInputProps) {
  const presets = MathParser.getPresetFunctions();

  return (
    <section className="mb-16">
      <div className="swiss-grid">
        <div className="col-span-6">
          <h3 className="swiss-subtitle mb-6" data-testid="function-input-title">FUNCTION INPUT</h3>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2" data-testid="function-input-label">
                Enter Function <span className="math-expression">f(x)</span>
              </Label>
              <Input
                type="text"
                className={`function-input w-full px-4 py-3 text-lg ${!isValidExpression ? 'border-destructive' : ''}`}
                placeholder="x^2 + 3*x - 5"
                value={expression}
                onChange={(e) => onExpressionChange(e.target.value)}
                data-testid="function-input"
              />
              {!isValidExpression && (
                <p className="text-destructive text-sm mt-1" data-testid="error-message">
                  Invalid expression. Please check your syntax.
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                className={`control-button ${mode === 'derivative' ? 'active' : ''}`}
                onClick={() => onModeChange('derivative')}
                data-testid="button-derivative"
              >
                DERIVATIVE
              </Button>
              <Button
                className={`control-button ${mode === 'integral' ? 'active' : ''}`}
                onClick={() => onModeChange('integral')}
                data-testid="button-integral"
              >
                INTEGRAL
              </Button>
              <Button
                className={`control-button ${mode === 'limit' ? 'active' : ''}`}
                onClick={() => onModeChange('limit')}
                data-testid="button-limit"
              >
                LIMIT
              </Button>
            </div>
          </div>
        </div>
        <div className="col-span-6">
          <h3 className="swiss-subtitle mb-6" data-testid="presets-title">PRESETS</h3>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                className="border-2 border-border hover:border-accent p-3 rounded-sm text-left transition-colors h-auto"
                onClick={() => onLoadPreset(preset.expression)}
                data-testid={`preset-${index}`}
              >
                <div className="font-medium math-expression">{preset.description}</div>
                <div className="text-xs text-muted-foreground mt-1">{preset.name}</div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
