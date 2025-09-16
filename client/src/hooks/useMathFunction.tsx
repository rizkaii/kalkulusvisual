import { useState, useEffect, useCallback } from 'react';
import { MathParser } from '@/lib/mathParser';
import { MathCalculations } from '@/lib/mathCalculations';

export interface MathFunctionState {
  expression: string;
  xMin: number;
  xMax: number;
  zoom: number;
  pointOfInterest: number;
  mode: 'derivative' | 'integral' | 'limit';
  integralBounds: { lower: number; upper: number };
  limitTarget: number;
  subdivisions: number;
  integralMethod: 'riemann' | 'trapezoidal' | 'simpson';
}

export function useMathFunction() {
  const [state, setState] = useState<MathFunctionState>({
    expression: 'x^2 + 3*x - 5',
    xMin: -10,
    xMax: 10,
    zoom: 1,
    pointOfInterest: 2,
    mode: 'derivative',
    integralBounds: { lower: 0, upper: 4 },
    limitTarget: 0,
    subdivisions: 50,
    integralMethod: 'simpson'
  });

  const [functionPoints, setFunctionPoints] = useState<Array<{x: number, y: number}>>([]);
  const [derivativePoints, setDerivativePoints] = useState<Array<{x: number, y: number}>>([]);
  const [functionValue, setFunctionValue] = useState<number>(0);
  const [derivativeValue, setDerivativeValue] = useState<number>(0);
  const [integralValue, setIntegralValue] = useState<number>(0);
  const [limitResult, setLimitResult] = useState<any>(null);
  const [tangentLine, setTangentLine] = useState<any>(null);
  const [normalLine, setNormalLine] = useState<any>(null);
  const [riemannData, setRiemannData] = useState<any>(null);
  const [isValidExpression, setIsValidExpression] = useState<boolean>(true);

  // Update function points when expression or bounds change
  useEffect(() => {
    if (!isValidExpression) return;

    try {
      const points = MathParser.generatePoints(state.expression, state.xMin, state.xMax, 1000);
      setFunctionPoints(points);

      if (state.mode === 'derivative') {
        const derivPoints = MathCalculations.calculateDerivativePoints(state.expression, state.xMin, state.xMax, 500);
        setDerivativePoints(derivPoints);
      }
    } catch (error) {
      console.error('Error generating function points:', error);
      setFunctionPoints([]);
      setDerivativePoints([]);
    }
  }, [state.expression, state.xMin, state.xMax, state.zoom, state.mode, isValidExpression]);

  // Update calculations when point of interest changes
  useEffect(() => {
    if (!isValidExpression) return;

    try {
      // Calculate function value at point of interest
      const fValue = MathParser.evaluate(state.expression, state.pointOfInterest);
      setFunctionValue(fValue);

      // Calculate derivative at point of interest
      const derivResult = MathCalculations.calculateDerivative(state.expression, state.pointOfInterest);
      setDerivativeValue(derivResult.value);

      // Calculate tangent and normal lines
      const tangent = MathCalculations.calculateTangentLine(state.expression, state.pointOfInterest);
      setTangentLine(tangent);

      const normal = MathCalculations.calculateNormalLine(state.expression, state.pointOfInterest);
      setNormalLine(normal);
    } catch (error) {
      console.error('Error calculating point values:', error);
    }
  }, [state.expression, state.pointOfInterest, isValidExpression]);

  // Update integral calculation
  useEffect(() => {
    if (!isValidExpression || state.mode !== 'integral') return;

    try {
      const integralResult = MathCalculations.calculateDefiniteIntegral(
        state.expression, 
        state.integralBounds.lower, 
        state.integralBounds.upper, 
        state.subdivisions
      );
      setIntegralValue(integralResult.value);

      // Calculate Riemann rectangles for visualization
      const riemann = MathCalculations.calculateRiemannSum(
        state.expression,
        state.integralBounds.lower,
        state.integralBounds.upper,
        Math.min(state.subdivisions, 100) // Limit for performance
      );
      setRiemannData(riemann);
    } catch (error) {
      console.error('Error calculating integral:', error);
    }
  }, [state.expression, state.integralBounds, state.subdivisions, state.mode, isValidExpression]);

  // Update limit calculation
  useEffect(() => {
    if (!isValidExpression || state.mode !== 'limit') return;

    try {
      const limit = MathCalculations.calculateLimit(state.expression, state.limitTarget);
      setLimitResult(limit);
    } catch (error) {
      console.error('Error calculating limit:', error);
    }
  }, [state.expression, state.limitTarget, state.mode, isValidExpression]);

  // Validate expression
  useEffect(() => {
    const valid = MathParser.isValidExpression(state.expression);
    setIsValidExpression(valid);
  }, [state.expression]);

  const updateExpression = useCallback((expression: string) => {
    setState(prev => ({ ...prev, expression }));
  }, []);

  const updateMode = useCallback((mode: 'derivative' | 'integral' | 'limit') => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const updatePointOfInterest = useCallback((point: number) => {
    setState(prev => ({ ...prev, pointOfInterest: point }));
  }, []);

  const updateZoom = useCallback((zoom: number) => {
    setState(prev => ({
      ...prev,
      zoom,
      xMin: -10 / zoom,
      xMax: 10 / zoom
    }));
  }, []);

  const updateXRange = useCallback((xMin: number, xMax: number) => {
    setState(prev => ({ ...prev, xMin, xMax }));
  }, []);

  const updateIntegralBounds = useCallback((lower: number, upper: number) => {
    setState(prev => ({ ...prev, integralBounds: { lower, upper } }));
  }, []);

  const updateLimitTarget = useCallback((target: number) => {
    setState(prev => ({ ...prev, limitTarget: target }));
  }, []);

  const updateSubdivisions = useCallback((subdivisions: number) => {
    setState(prev => ({ ...prev, subdivisions }));
  }, []);

  const updateIntegralMethod = useCallback((method: 'riemann' | 'trapezoidal' | 'simpson') => {
    setState(prev => ({ ...prev, integralMethod: method }));
  }, []);

  const loadPreset = useCallback((expression: string) => {
    updateExpression(expression);
  }, [updateExpression]);

  return {
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
  };
}
