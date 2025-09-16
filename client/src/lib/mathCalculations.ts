import { MathParser } from './mathParser';

export interface CalculationResult {
  value: number;
  error?: string;
}

export class MathCalculations {
  // Calculate numerical derivative using finite differences
  static calculateDerivative(expression: string, x: number, h: number = 0.0001): CalculationResult {
    try {
      const f_x_plus_h = MathParser.evaluate(expression, x + h);
      const f_x = MathParser.evaluate(expression, x);
      const derivative = (f_x_plus_h - f_x) / h;
      
      return { value: derivative };
    } catch (error) {
      return { value: 0, error: 'Unable to calculate derivative' };
    }
  }

  // Calculate derivative points for plotting
  static calculateDerivativePoints(expression: string, xMin: number, xMax: number, steps: number = 500): Array<{x: number, y: number}> {
    const points: Array<{x: number, y: number}> = [];
    const stepSize = (xMax - xMin) / steps;

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * stepSize;
      const result = this.calculateDerivative(expression, x);
      if (!result.error && isFinite(result.value)) {
        points.push({ x, y: result.value });
      }
    }

    return points;
  }

  // Calculate definite integral using Simpson's rule
  static calculateDefiniteIntegral(expression: string, a: number, b: number, n: number = 1000): CalculationResult {
    try {
      if (n % 2 !== 0) n++; // Ensure n is even for Simpson's rule
      
      const h = (b - a) / n;
      let sum = MathParser.evaluate(expression, a) + MathParser.evaluate(expression, b);
      
      for (let i = 1; i < n; i++) {
        const x = a + i * h;
        const coefficient = i % 2 === 0 ? 2 : 4;
        sum += coefficient * MathParser.evaluate(expression, x);
      }
      
      const integral = (h / 3) * sum;
      return { value: integral };
    } catch (error) {
      return { value: 0, error: 'Unable to calculate integral' };
    }
  }

  // Calculate Riemann sum for visualization
  static calculateRiemannSum(expression: string, a: number, b: number, n: number): { value: number, rectangles: Array<{x: number, y: number, width: number, height: number}> } {
    const rectangles: Array<{x: number, y: number, width: number, height: number}> = [];
    const dx = (b - a) / n;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      const x = a + i * dx;
      try {
        const height = MathParser.evaluate(expression, x + dx/2); // Midpoint rule
        sum += height * dx;
        rectangles.push({
          x: x,
          y: Math.min(0, height),
          width: dx,
          height: Math.abs(height)
        });
      } catch {
        // Skip invalid points
      }
    }

    return { value: sum, rectangles };
  }

  // Calculate limit by approaching from both sides
  static calculateLimit(expression: string, a: number, epsilon: number = 0.001): {
    leftLimit: number | null;
    rightLimit: number | null;
    limit: number | null;
    exists: boolean;
  } {
    try {
      const steps = [0.1, 0.01, 0.001, 0.0001];
      let leftValues: number[] = [];
      let rightValues: number[] = [];

      for (const step of steps) {
        try {
          const leftVal = MathParser.evaluate(expression, a - step);
          const rightVal = MathParser.evaluate(expression, a + step);
          
          if (isFinite(leftVal)) leftValues.push(leftVal);
          if (isFinite(rightVal)) rightValues.push(rightVal);
        } catch {
          // Continue with other steps
        }
      }

      const leftLimit = leftValues.length > 0 ? leftValues[leftValues.length - 1] : null;
      const rightLimit = rightValues.length > 0 ? rightValues[rightValues.length - 1] : null;

      let limit = null;
      let exists = false;

      if (leftLimit !== null && rightLimit !== null) {
        if (Math.abs(leftLimit - rightLimit) < epsilon) {
          limit = (leftLimit + rightLimit) / 2;
          exists = true;
        }
      } else if (leftLimit !== null && rightLimit === null) {
        limit = leftLimit;
      } else if (rightLimit !== null && leftLimit === null) {
        limit = rightLimit;
      }

      return { leftLimit, rightLimit, limit, exists };
    } catch {
      return { leftLimit: null, rightLimit: null, limit: null, exists: false };
    }
  }

  // Calculate tangent line equation
  static calculateTangentLine(expression: string, x0: number): {
    slope: number;
    yIntercept: number;
    equation: string;
    point: { x: number, y: number };
  } {
    try {
      const y0 = MathParser.evaluate(expression, x0);
      const slope = this.calculateDerivative(expression, x0).value;
      const yIntercept = y0 - slope * x0;
      
      let equation = '';
      if (slope === 0) {
        equation = `y = ${y0.toFixed(2)}`;
      } else if (slope === 1) {
        equation = yIntercept >= 0 ? `y = x + ${yIntercept.toFixed(2)}` : `y = x - ${Math.abs(yIntercept).toFixed(2)}`;
      } else if (slope === -1) {
        equation = yIntercept >= 0 ? `y = -x + ${yIntercept.toFixed(2)}` : `y = -x - ${Math.abs(yIntercept).toFixed(2)}`;
      } else {
        const slopeStr = slope.toFixed(2);
        equation = yIntercept >= 0 ? `y = ${slopeStr}x + ${yIntercept.toFixed(2)}` : `y = ${slopeStr}x - ${Math.abs(yIntercept).toFixed(2)}`;
      }

      return {
        slope,
        yIntercept,
        equation,
        point: { x: x0, y: y0 }
      };
    } catch {
      return {
        slope: 0,
        yIntercept: 0,
        equation: 'y = 0',
        point: { x: x0, y: 0 }
      };
    }
  }

  // Calculate normal line (perpendicular to tangent)
  static calculateNormalLine(expression: string, x0: number): {
    slope: number;
    yIntercept: number;
    equation: string;
  } {
    try {
      const tangent = this.calculateTangentLine(expression, x0);
      const normalSlope = tangent.slope === 0 ? Infinity : -1 / tangent.slope;
      const y0 = MathParser.evaluate(expression, x0);
      
      if (!isFinite(normalSlope)) {
        return {
          slope: normalSlope,
          yIntercept: 0,
          equation: `x = ${x0.toFixed(2)}`
        };
      }

      const yIntercept = y0 - normalSlope * x0;
      const equation = yIntercept >= 0 ? 
        `y = ${normalSlope.toFixed(2)}x + ${yIntercept.toFixed(2)}` :
        `y = ${normalSlope.toFixed(2)}x - ${Math.abs(yIntercept).toFixed(2)}`;

      return { slope: normalSlope, yIntercept, equation };
    } catch {
      return { slope: 0, yIntercept: 0, equation: 'y = 0' };
    }
  }
}
