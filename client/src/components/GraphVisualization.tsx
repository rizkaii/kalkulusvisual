import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GraphVisualizationProps {
  functionPoints: Array<{x: number, y: number}>;
  derivativePoints: Array<{x: number, y: number}>;
  functionValue: number;
  derivativeValue: number;
  pointOfInterest: number;
  xMin: number;
  xMax: number;
  zoom: number;
  mode: string;
  tangentLine?: any;
  riemannData?: any;
  onPointChange: (point: number) => void;
  onZoomChange: (zoom: number) => void;
  onXRangeChange: (xMin: number, xMax: number) => void;
}

export function GraphVisualization({
  functionPoints,
  derivativePoints,
  functionValue,
  derivativeValue,
  pointOfInterest,
  xMin,
  xMax,
  zoom,
  mode,
  tangentLine,
  riemannData,
  onPointChange,
  onZoomChange,
  onXRangeChange
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [localXMin, setLocalXMin] = useState(xMin);
  const [localXMax, setLocalXMax] = useState(xMax);

  useEffect(() => {
    setLocalXMin(xMin);
    setLocalXMax(xMax);
  }, [xMin, xMax]);

  useEffect(() => {
    if (!svgRef.current || functionPoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 384 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate y-axis bounds from data
    const yValues = functionPoints.map(d => d.y).filter(y => isFinite(y));
    if (mode === 'derivative') {
      yValues.push(...derivativePoints.map(d => d.y).filter(y => isFinite(y)));
    }
    
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

    // Draw Riemann rectangles for integral mode
    if (mode === 'integral' && riemannData?.rectangles) {
      g.selectAll('.riemann-rect')
        .data(riemannData.rectangles)
        .enter()
        .append('rect')
        .attr('class', 'riemann-rect area-fill')
        .attr('x', (d: any) => xScale(d.x))
        .attr('y', (d: any) => yScale(Math.max(0, d.y + d.height)))
        .attr('width', (d: any) => xScale(d.x + d.width) - xScale(d.x))
        .attr('height', (d: any) => Math.abs(yScale(d.y) - yScale(d.y + d.height)));
    }

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

    // Draw derivative curve
    if (mode === 'derivative' && derivativePoints.length > 0) {
      g.append('path')
        .datum(derivativePoints.filter(d => isFinite(d.y)))
        .attr('class', 'derivative-curve')
        .attr('d', line);
    }

    // Draw tangent line
    if (tangentLine && (mode === 'derivative' || mode === 'limit')) {
      const tangentPoints = [
        { x: xMin, y: tangentLine.slope * xMin + tangentLine.yIntercept },
        { x: xMax, y: tangentLine.slope * xMax + tangentLine.yIntercept }
      ];

      g.append('path')
        .datum(tangentPoints)
        .attr('class', 'tangent-line')
        .attr('d', line)
        .style('fill', 'none');
    }

    // Add point of interest marker
    if (isFinite(functionValue)) {
      g.append('circle')
        .attr('cx', xScale(pointOfInterest))
        .attr('cy', yScale(functionValue))
        .attr('r', 5)
        .attr('fill', '#ef4444')
        .attr('stroke', 'black')
        .attr('stroke-width', 2);
    }

    // Add interactive overlay for tooltip
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mousemove', function(event: any) {
        const [mouseX] = d3.pointer(event);
        const x = xScale.invert(mouseX);
        
        // Find closest point
        const closestPoint = functionPoints.reduce((closest, point) => 
          Math.abs(point.x - x) < Math.abs(closest.x - x) ? point : closest
        );

        if (tooltipRef.current && closestPoint) {
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.style.left = `${mouseX + margin.left + 10}px`;
          tooltipRef.current.style.top = `${yScale(closestPoint.y) + margin.top}px`;
          tooltipRef.current.innerHTML = `x: ${closestPoint.x.toFixed(2)}<br/>y: ${closestPoint.y.toFixed(2)}`;
        }
      })
      .on('mouseleave', function() {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      })
      .on('click', function(event: any) {
        const [mouseX] = d3.pointer(event);
        const x = xScale.invert(mouseX);
        onPointChange(Math.round(x * 10) / 10);
      });

  }, [functionPoints, derivativePoints, xMin, xMax, pointOfInterest, mode, tangentLine, riemannData]);

  const handleXRangeSubmit = () => {
    onXRangeChange(localXMin, localXMax);
  };

  return (
    <section className="mb-16">
      <div className="swiss-grid">
        <div className="col-span-8">
          <h3 className="swiss-subtitle mb-6" data-testid="visualization-title">VISUALIZATION</h3>
          <div className="graph-container w-full h-96 rounded-sm relative">
            <svg ref={svgRef} className="w-full h-full" data-testid="main-graph" />
            <div 
              ref={tooltipRef} 
              className="tooltip absolute hidden pointer-events-none"
              data-testid="graph-tooltip"
            />
          </div>
        </div>
        <div className="col-span-4">
          <h3 className="swiss-subtitle mb-6" data-testid="controls-title">CONTROLS</h3>
          <div className="space-y-6">
            {/* Zoom Controls */}
            <div>
              <Label className="block text-sm font-medium mb-2" data-testid="zoom-label">ZOOM</Label>
              <div className="slider-container">
                <Slider
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={([value]) => onZoomChange(value)}
                  className="w-full"
                  data-testid="zoom-slider"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.1x</span>
                  <span data-testid="current-zoom">{zoom.toFixed(1)}x</span>
                  <span>5.0x</span>
                </div>
              </div>
            </div>

            {/* X-axis Range */}
            <div>
              <Label className="block text-sm font-medium mb-2" data-testid="x-range-label">X-AXIS RANGE</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={localXMin}
                  onChange={(e) => setLocalXMin(parseFloat(e.target.value))}
                  onBlur={handleXRangeSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleXRangeSubmit()}
                  className="function-input px-3 py-2 text-sm rounded-sm"
                  data-testid="x-min-input"
                />
                <Input
                  type="number"
                  value={localXMax}
                  onChange={(e) => setLocalXMax(parseFloat(e.target.value))}
                  onBlur={handleXRangeSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleXRangeSubmit()}
                  className="function-input px-3 py-2 text-sm rounded-sm"
                  data-testid="x-max-input"
                />
              </div>
            </div>

            {/* Point of Interest */}
            <div>
              <Label className="block text-sm font-medium mb-2" data-testid="poi-label">POINT OF INTEREST</Label>
              <div className="slider-container">
                <Slider
                  min={xMin}
                  max={xMax}
                  step={0.1}
                  value={[pointOfInterest]}
                  onValueChange={([value]) => onPointChange(value)}
                  className="w-full"
                  data-testid="poi-slider"
                />
                <div className="text-center text-sm mt-2">
                  <span>x = </span>
                  <span data-testid="current-point" className="font-bold">{pointOfInterest.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Current Values Display */}
            <div className="bg-muted p-4 rounded-sm">
              <h4 className="font-bold mb-3" data-testid="values-title">
                VALUES AT x = <span data-testid="values-point">{pointOfInterest.toFixed(1)}</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="math-expression">f(x):</span>
                  <span data-testid="function-value" className="font-medium">
                    {isFinite(functionValue) ? functionValue.toFixed(2) : 'undefined'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="math-expression">f'(x):</span>
                  <span data-testid="derivative-value" className="font-medium text-blue-600">
                    {isFinite(derivativeValue) ? derivativeValue.toFixed(2) : 'undefined'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Slope:</span>
                  <span data-testid="slope-value" className="font-medium text-green-600">
                    {isFinite(derivativeValue) ? derivativeValue.toFixed(2) : 'undefined'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
