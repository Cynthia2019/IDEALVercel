import React, { useRef, useState, useEffect } from "react";
import Umap from "../components/umap";

const UmapWrapper = ({ data, element}) => {
    const chartArea = useRef(null);
    const legendArea = useRef(null)
    const [chart, setChart] = useState(null);

    useEffect(() => {
        if (!chart) {
            setChart(new Umap(chartArea.current, data));
        }
        else {
            chart.update(data, chartArea.current);

        }
    }, [data, chart]);

    return <div style={{display: 'flex', flexDirection: 'row'}}>
        <div id="main-plot" ref={chartArea}></div>
        {/*<div id="main-plot-legend" style={{display:'flex', flexDirection:'column'}} ref={legendArea}></div>*/}
    </div>
};

export default UmapWrapper;