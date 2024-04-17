import React, { useRef, useState, useEffect } from "react";
import Contour_test from "../../charts/contour_test";
import Button from "@mui/material/Button";
import {FcMindMap} from "react-icons/fc";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import NeighborPanel from "@/components/knn/neighborPanel";
import SaveIcon from "@mui/icons-material/Save";
import SavePanel from "@/components/saveData/savePanel";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {Row, Col} from "antd";

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
    const [activeDensity, setActiveDensity ] = useState("#556cd6");

    const toggleDensityPlots = () => {
        // setClickedNeighbor((current) => !current);
        setActiveDensity((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");
    };

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
                max_num_datasets,
                showDensity: activeDensity === "#556cd6"
            });
        }
    }, [chart, query1, query2, data, reset, activeDensity]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "30px",
            }}
        >
            <Col>
            <p style={{ fontWeight: 'bold', fontSize: '24px', marginLeft: 100, marginTop: 10 }}>
                Legend
            </p>
            <div id="legend" ref={legendArea}></div>
            </Col>
            <div id="main-plot" ref={chartArea}></div>
            <Row justify={"space-around"} style={{ width: "100%", marginLeft: "0px"}}>

                <Button
                    variant="outlined"
                    aria-label="Show / Hide Density Plots"
                    onClick={toggleDensityPlots}
                    style={{ maxWidth: "300px", backgroundColor: activeDensity }}
                    endIcon={<FcMindMap style={{ fontSize: "25px" }} />}
                >
					<span style={{ fontSize: "10px", color: "white" }}>
						Show / Hide Density Plots
					</span>
                </Button>

            </Row>

        </div>
    );
};

export default ContourWrapper_test;
