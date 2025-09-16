import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Button } from '@/components/ui/button';

interface GradientVisualizerProps {
  functionPoints: Array<{x: number, y: number}>;
  pointOfInterest: number;
  tangentLine: any;
  normalLine: any;
  derivativeValue: number;
  functionValue: number;
  xMin: number;
  xMax: number;
  onPointChange: (point: number) => void;
}

export function GradientVisualizer({
  functionPoints,
  pointOfInterest,
  tangentLine,
  normalLine,
  derivativeValue,
  functionValue,
  xMin,
  xMax,
  onPointChange
}: GradientVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showTangent, setShowTangent] = useState(true);
  const [showNormal, setShowNormal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!svgRef.current || functionPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate y-axis bounds
    const yValues = functionPoints.map(d => d.y).filter(y => isFinite(y));
    const yExtent = d3.extent(yValues) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1 || 1;
    const yMin = yExtent[0] - yPadding;
    const yMax = yExtent[1] + yPadding;

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Add grid lines
    const xAxis = d3.axisBottom(xScale).tickSize(-height);
    const yAxis = d3.axisLeft(yScale).tickSize(-width);

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('line')
      .attr('class', 'grid-line');

    g.append('g')
      .attr('class', 'grid')
      .call(yAxis)
      .selectAll('line')
      .attr('class', 'grid-line');

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll('line')
      .attr('class', 'axis-line');

    g.append('g')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll('line')
      .attr('class', 'axis-line');

    // Create line generator
    const line = d3.line<{x: number, y: number}>()
      .x((d: {x: number, y: number}) => xScale(d.x))
      .y((d: {x: number, y: number}) => yScale(d.y))
      .curve(d3.curveCardinal);

    // Draw function curve
    if (functionPoints.length > 0) {
      g.append('path')
        .datum(functionPoints.filter(d => isFinite(d.y)))
        .attr('class', 'function-curve')
        .attr('d', line);
    }

    // Draw tangent line
    if (showTangent && tangentLine && isFinite(tangentLine.slope)) {
      const tangentPoints = [
        { x: xMin, y: tangentLine.slope * xMin + tangentLine.yIntercept },
        { x: xMax, y: tangentLine.slope * xMax + tangentLine.yIntercept }
      ];

      g.append('path')
        .datum(tangentPoints)
        .attr('class', 'tangent-line')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', '#10b981')
        .style('stroke-width', 2);
    }

    // Draw normal line
    if (showNormal && normalLine && isFinite(normalLine.slope)) {
      const normalPoints = [
        { x: xMin, y: normalLine.slope * xMin + normalLine.yIntercept },
        { x: xMax, y: normalLine.slope * xMax + normalLine.yIntercept }
      ];

      g.append('path')
        .datum(normalPoints)
        .attr('class', 'normal-line')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', '#8b5cf6')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '5,5');
    }

    // Add point of interest marker
    if (isFinite(functionValue)) {
      g.append('circle')
        .attr('cx', xScale(pointOfInterest))
        .attr('cy', yScale(functionValue))
        .attr('r', 6)
        .attr('fill', '#ef4444')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
    }

    // Add interactive overlay
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('click', function(event: any) {
        if (!isAnimating) {
          const [mouseX] = d3.pointer(event);
          const x = xScale.invert(mouseX);
          onPointChange(Math.round(x * 10) / 10);
        }
      });

  }, [functionPoints, xMin, xMax, pointOfInterest, tangentLine, normalLine, showTangent, showNormal, functionValue]);

  const handleAnimateSlope = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const startX = xMin;
    const endX = xMax;
    const duration = 3000; // 3 seconds
    const steps = 100;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(interval);
        setIsAnimating(false);
        return;
      }
      
      const progress = currentStep / steps;
      const currentX = startX + (endX - startX) * progress;
      onPointChange(Math.round(currentX * 10) / 10);
      currentStep++;
    }, duration / steps);
  };

  const slopeAngle = Math.atan(derivativeValue) * (180 / Math.PI);

  return (
    <section className="mb-16">
      <div className="swiss-grid">
        <div className="col-span-8">
          <h3 className="swiss-subtitle mb-6" data-testid="gradient-visualizer-title">GRADIENT VISUALIZER</h3>
          <div className="graph-container w-full h-80 rounded-sm relative">
            <svg ref={svgRef} className="w-full h-full" data-testid="gradient-graph" />
          </div>
        </div>
        <div className="col-span-4">
          <h3 className="swiss-subtitle mb-6" data-testid="slope-analysis-title">SLOPE ANALYSIS</h3>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-sm">
              <h4 className="font-bold mb-3" data-testid="tangent-line-title">TANGENT LINE</h4>
              <div className="text-sm space-y-2">
                <div data-testid="tangent-point">
                  Point: (<span>{pointOfInterest.toFixed(1)}</span>, <span>{functionValue.toFixed(1)}</span>)
                </div>
                <div data-testid="tangent-slope">
                  Slope: <span className="font-medium">
                    {isFinite(derivativeValue) ? derivativeValue.toFixed(2) : 'undefined'}
                  </span>
                </div>
                {tangentLine && (
                  <div className="math-expression" data-testid="tangent-equation">
                    Equation: {tangentLine.equation}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                className={`control-button w-full ${showTangent ? 'active' : ''}`}
                onClick={() => setShowTangent(!showTangent)}
                data-testid="toggle-tangent"
              >
                {showTangent ? 'HIDE' : 'SHOW'} TANGENT LINE
              </Button>
              <Button
                className={`control-button w-full ${showNormal ? 'active' : ''}`}
                onClick={() => setShowNormal(!showNormal)}
                data-testid="toggle-normal"
              >
                {showNormal ? 'HIDE' : 'SHOW'} NORMAL LINE
              </Button>
              <Button
                className={`control-button w-full ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleAnimateSlope}
                disabled={isAnimating}
                data-testid="animate-slope"
              >
                {isAnimating ? 'ANIMATING...' : 'ANIMATE SLOPE'}
              </Button>
            </div>

            {/* Slope Direction Indicator */}
            <div className="border-2 border-border p-4 rounded-sm">
              <h5 className="font-medium mb-2" data-testid="slope-direction-title">SLOPE DIRECTION</h5>
              <div className="flex items-center justify-center h-16">
                <div className="relative">
                  <div 
                    className="w-16 h-1 bg-black origin-left transition-transform duration-300"
                    style={{ 
                      transform: `rotate(${Math.max(-75, Math.min(75, slopeAngle))}deg)` 
                    }}
                    data-testid="slope-arrow"
                  />
                  <div className="absolute -left-2 -top-1 w-4 h-3 bg-black transform rotate-45" />
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground mt-2">
                Angle: <span data-testid="slope-angle">{slopeAngle.toFixed(1)}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
