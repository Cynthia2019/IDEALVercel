import React, { useRef, useState, useEffect } from "react";
import Umap from "@/charts/umap";

const UmapWrapper = ({
                            data,
                            setDataPoint,
                            query1,
                            query2,
                            selectedData,
                            setSelectedData,
                            reset,
                            setReset
                        }) => {
    const chartArea = useRef(null);
    const legendArea = useRef(null);
    const [chart, setChart] = useState(null);
    const [view, setView] = useState("brush-on");

    useEffect(() => {
        if (!chart) {
            setChart(
                new Umap(
                    chartArea.current,
                    legendArea.current,
                    data,
                    setDataPoint,
                    selectedData,
                    setSelectedData,
                    view
                )
            );
        } else {
            chart.update(
                data,
                chartArea.current,
                legendArea.current,
                setDataPoint,
                query1,
                query2,
                selectedData,
                setSelectedData,
                view,
                reset,
                setReset
            );
        }
    }, [chart, query1, query2, data, view, reset]);

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div id="main-plot" ref={chartArea}></div>
            <div
                id="main-plot-side-bar"
                style={{ display: "flex", flexDirection: "column", zIndex: 10, marginLeft: 10 }}
            >
            </div>
        </div>
    );
};

export default UmapWrapper;