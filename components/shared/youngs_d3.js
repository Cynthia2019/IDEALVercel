import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function Youngs_d3({ dataPoint }) {
    const chartRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(chartRef.current);

        const width = 300;
        const height = 270;

        const radius = Math.min(width, height) / 2;
        const innerRadius = 0;
        const outerRadius = radius;

        const thetaScale = d3.scaleLinear()
            .domain([0, 360])
            .range([0, 2 * Math.PI]);

        const rScale = d3.scaleLinear()
            .domain([0, 2000000000])
            .range([innerRadius, outerRadius]);

        const line = d3.lineRadial()
            .angle((d) => thetaScale(d.theta))
            .radius((d) => rScale(d.r))
            .curve(d3.curveLinearClosed);

        const data = [
            { theta: 0, r: dataPoint.youngs[0] },
            { theta: 3.6, r: dataPoint.youngs[1] },
            // ... continue adding all the data points
            { theta: 360, r: dataPoint.youngs[360] },
        ];

        svg.selectAll('.line')
            .data([data])
            .join('path')
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke', 'peru')
            .style('fill', 'none');

        svg.attr('viewBox', [-width / 2, -height / 2, width, height]);

        // Cleanup
        return () => {
            svg.selectAll('.line').remove();
        };
    }, [dataPoint]);

    return (
        <svg ref={chartRef} style={{ width: '100%', height: '100%' }}></svg>
    );
}
