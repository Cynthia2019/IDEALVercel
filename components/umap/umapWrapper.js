import React, { useRef, useState, useEffect } from "react";
import Umap from "@/charts/umap";
import ToggleButton from "@mui/material/ToggleButton";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import {FcMindMap} from "react-icons/fc";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const UmapWrapper = ({
                            data,
                            setDataPoint,
                            query1,
                            query2,
                            selectedData,
                            setSelectedData,
                            reset,
                            setReset,
                            knn
                        }) => {
    const chartArea = useRef(null);
    const legendArea = useRef(null);
    const [chart, setChart] = useState(null);
    const [view, setView] = useState("zoom");

    const handleChange = (e, nextView) => {
        setView(nextView);
    };
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
                    view,
                    knn
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
                setReset,
                knn
            );
        }
    }, [chart, query1, query2, data, view, reset, knn]);

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div id="main-plot" ref={chartArea}></div>
            <div
                id="main-plot-side-bar"
                style={{ display: "flex", flexDirection: "column", zIndex: 10, marginLeft: 10 }}
            >
                <ToggleButtonGroup
                    orientation="vertical"
                    value={view}
                    exclusive
                    onChange={handleChange}
                >
                    <ToggleButton value="zoom" aria-label="zoom">
                        <ZoomInMapIcon style={{ fontSize: "15px" }} />
                        <span style={{ fontSize: "10px" }}>Zoom</span>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
        </div>
    );
};

export default UmapWrapper;