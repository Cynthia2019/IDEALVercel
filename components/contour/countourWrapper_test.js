import React, { useRef, useState, useEffect } from "react";
import Contour_test from "../../charts/contour_test";

const ContourWrapper_test = ({
                            data,
                            completeData,
                            maxDataPointsPerDataset,
                            setDataPoint,
                            query1,
                            query2,
                            selectedData,
                            setSelectedData,
                            setActiveData,
                            setNeighbors,
                            reset,
                            setReset,
                            datasets,
                            neighbors,
                         max_num_datasets
                        }) => {
    const chartArea = useRef(null);
    const legendArea = useRef(null);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        if (!chart) {
            setChart(
                new Contour_test(
                    chartArea.current,
                    legendArea.current,
                    data,
                    setDataPoint,
                    selectedData,
                    setSelectedData
                )
            );
        } else {
            chart.update({
                data,
                completeData,
                maxDataPointsPerDataset,
                element: chartArea.current,
                legendElement: legendArea.current,
                setDataPoint,
                query1,
                query2,
                selectedData,
                setSelectedData,
                setActiveData,
                setNeighbors,
                reset,
                setReset,
                datasets,
                max_num_datasets
            });
        }
    }, [chart, query1, query2, data, reset]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "30px",
            }}
        >
            <div id="legend" ref={legendArea}></div>
            <div id="main-plot" ref={chartArea}></div>
        </div>
    );
};

export default ContourWrapper_test;
