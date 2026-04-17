import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js';

function ChartCanvas({ type, data, options, plugins }) {
	const canvasRef = useRef(null);
	const chartRef = useRef(null);

	useEffect(() => {
		if (!canvasRef.current) return undefined;
		chartRef.current = new ChartJS(canvasRef.current, {
			type,
			data,
			options,
			plugins: plugins || []
		});
		return () => {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
		};
	}, [type]);

	useEffect(() => {
		if (!chartRef.current) return;
		chartRef.current.data = data;
		chartRef.current.options = options;
		chartRef.current.update();
	}, [data, options]);

	return <canvas ref={canvasRef} />;
}

export default ChartCanvas;
