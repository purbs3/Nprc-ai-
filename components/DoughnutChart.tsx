import React from 'react';
import type { ChartDataPoint } from '../types';

interface DoughnutChartProps {
    title: string;
    data: ChartDataPoint[];
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ title, data }) => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
        return (
            <div className="bg-slate-700 p-6 rounded-lg h-full">
                <h3 className="font-bold text-lg mb-4">{title}</h3>
                <div className="flex items-center justify-center h-64">
                    <p className="text-slate-400">No data available.</p>
                </div>
            </div>
        );
    }

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = -90; // Start from the top

    return (
        <div className="bg-slate-700 p-6 rounded-lg h-full">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="relative">
                    <svg width="160" height="160" viewBox="0 0 160 160" aria-labelledby="title" role="img">
                        <title id="title">{title}</title>
                        <circle cx="80" cy="80" r={radius} className="stroke-slate-600" strokeWidth="20" fill="transparent" />
                        {data.map((item, index) => {
                            if (item.value === 0) return null;

                            const percentage = (item.value / totalValue) * 100;
                            const strokeDasharray = `${(circumference * percentage) / 100} ${circumference}`;
                            const rotation = accumulatedAngle;
                            accumulatedAngle += (360 * percentage) / 100;

                            return (
                                <circle
                                    key={index}
                                    cx="80"
                                    cy="80"
                                    r={radius}
                                    stroke={item.color || '#22d3ee'}
                                    strokeWidth="20"
                                    fill="transparent"
                                    strokeDasharray={strokeDasharray}
                                    transform={`rotate(${rotation} 80 80)`}
                                >
                                    <animate attributeName="stroke-dasharray" from={`0 ${circumference}`} to={strokeDasharray} dur="1s" fill="freeze" />
                                </circle>
                            );
                        })}
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-white text-2xl font-bold">
                            {totalValue}
                        </text>
                        <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle" className="fill-slate-400 text-xs">
                            Total
                        </text>
                    </svg>
                </div>
                <div className="legend space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                            <span
                                className="h-3 w-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color || '#22d3ee' }}
                            ></span>
                            <span className="text-slate-300">{item.label}:</span>
                            <span className="font-semibold text-white ml-1">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoughnutChart;
