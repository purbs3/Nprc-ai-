import React from 'react';
import type { ChartDataPoint } from '../types';

interface BarChartProps {
    title: string;
    data: ChartDataPoint[];
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-700 p-6 rounded-lg h-full">
                <h3 className="font-bold text-lg mb-4">{title}</h3>
                <div className="flex items-center justify-center h-64">
                    <p className="text-slate-400">No data available.</p>
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const chartHeight = 250;
    const barWidth = 40;
    const barMargin = 15;
    const svgWidth = data.length * (barWidth + barMargin);

    return (
        <div className="bg-slate-700 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <svg width={svgWidth} height={chartHeight} aria-labelledby="title" role="img">
                    <title id="title">{title}</title>
                    <g>
                        {data.map((d, i) => {
                            const barHeight = (d.value / maxValue) * (chartHeight - 40);
                            const x = i * (barWidth + barMargin);
                            const y = chartHeight - barHeight - 20;

                            return (
                                <g key={i} className="bar-group">
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        className="fill-cyan-500"
                                        rx="4"
                                        ry="4"
                                    >
                                        <animate attributeName="height" from="0" to={barHeight} dur="0.5s" fill="freeze" />
                                        <animate attributeName="y" from={chartHeight - 20} to={y} dur="0.5s" fill="freeze" />
                                    </rect>
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        className="fill-white font-semibold text-sm"
                                    >
                                        {d.value}
                                    </text>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight}
                                        textAnchor="middle"
                                        className="fill-slate-300 text-xs"
                                    >
                                        {d.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default BarChart;
