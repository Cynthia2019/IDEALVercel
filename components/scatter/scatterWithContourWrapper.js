import React, {useRef, useState, useEffect} from "react";
import ScatterWithContour from "../../charts/scatterWithContour";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {TextField, Typography} from "@mui/material";
import {FcMindMap} from "react-icons/fc";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NeighborPanel from "../knn/neighborPanel";
import SavePanel from "../saveData/savePanel";
import {Col, Row} from "antd";
import Draggable from "react-draggable";
import Paper from "@mui/material/Paper";
import CloseIcon from '@mui/icons-material/Close';


const PaperComponent = (props) => {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} style={{overflow: 'auto'}}/>
        </Draggable>
    )
}

const NeighborPaperComponent = (props) => {
    return (
        <Draggable
            handle="#draggable-neighbor-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} style={{overflow: 'auto'}}/>
        </Draggable>
    )
}


const ScatterWithContourWrapper = ({
                                       data,
                                       densityData,
                                       scatterData,
                                       completeData,
                                       maxDataPointsPerDataset,
                                       setMaxDataPointsPerDataset,
                                       setDataPoint,
                                       query1,
                                       query2,
                                       selectedData,
                                       setSelectedData,
                                       setActiveData,
                                       setNeighbors,
                                       reset,
                                       setReset,
                                       max_num_datasets,
                                       datasets,
                                       neighbors,
                                       scatter_by_dataset,
                                   }) => {
    const chartArea = useRef(null);
    const legendArea = useRef(null);
    const [chart, setChart] = useState(null);
    const [clickedNeighbor, setClickedNeighbor] = useState(true);
    const [openNeighbor, setOpenNeighbor] = useState(false);
    const [openData, setOpenData] = useState(false);
    const [activateKNN, setActivateKNN] = useState("#556cd6");
    const [activeDensity, setActiveDensity] = useState("#556cd6");
    const [activeScatter, setActiveScatter] = useState("#556cd6");
    const [captured, setCaptured] = useState('NA');
    const [inputValue, setInputValue] = useState(maxDataPointsPerDataset);
    const legendContainer = useRef(null);
    const [interactionMode, setInteractionMode] = useState('brushing'); // Default to brushing

    const toggleInteractionMode = () => {
        setInteractionMode((currentMode) => currentMode == 'panning' ? 'brushing' : 'panning');
    };
    const toggleFindNeighbors = () => {
        setClickedNeighbor((current) => !current);
        setActivateKNN((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");
    };

    const toggleDensityPlots = () => {
        setActiveDensity((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");
    };

    const toggleScatterPlots = () => {
        setActiveScatter((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");
    };


    const handleNeighborClose = () => {
        setOpenNeighbor(false);
    };

    const handleDataOpen = () => {
        setOpenData(true);
    };

    const handleDataClose = () => {
        setOpenData(false);
    };
    const handleResetClick = () => {
        setReset(true);
    };


    const validateAndSetMaxDataPoints = (value) => {
        const numericValue = parseInt(value, 10);
        if (numericValue > 0) {
            setMaxDataPointsPerDataset(numericValue); // Set the valid number to state
            setInputValue(numericValue.toString()); // Also update the input value to reflect this
        }
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value); // Update input value directly from event
    };

    const handleBlur = () => {
        validateAndSetMaxDataPoints(inputValue); // Validate and set on blur
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            validateAndSetMaxDataPoints(inputValue); // Validate and set on pressing Enter
        }
    };

    useEffect(() => {
        if (!chart) {
            setChart(
                new ScatterWithContour(
                    chartArea.current,
                    legendArea.current,
                    legendContainer.current,
                    data,
                    densityData,
                    scatterData,
                    setDataPoint,
                    selectedData,
                    setSelectedData
                )
            );
        } else {
            chart.update({
                data,
                densityData,
                scatterData,
                completeData,
                maxDataPointsPerDataset,
                element: chartArea.current,
                legendElement: legendArea.current,
                legendContainer: legendContainer.current,
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
                clickedNeighbor,
                setOpenNeighbor,
                showDensity: activeDensity === "#556cd6",
                showScatter: activeScatter === "#556cd6",
                setCaptured,
                scatter_by_dataset,
                interactionMode
            });
        }
    }, [chart, query1, query2, data, densityData, scatterData, reset, clickedNeighbor,
        activeDensity, activeScatter, maxDataPointsPerDataset, interactionMode]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: "30px",
            }}
        >
            <TextField
                label="Points per Dataset in Scatter Plot"
                type="number"
                variant="outlined"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                helperText={
                    parseInt(inputValue, 10) < 1 || parseInt(inputValue, 10) > 1000
                        ? "Please enter a number between 1 and 1000"
                        : "Enter a number from 1 to 1000"
                }
                error={
                    (parseInt(inputValue, 10) < 1 || parseInt(inputValue, 10) > 1000) &&
                    inputValue.trim() !== ""
                }
                style={{ marginTop: 10 }}
                InputLabelProps={{
                    sx: { color: "black", "&.Mui-focused": { color: "black" } },
                }}
            />

            {/*<Col>*/}
            {/*    {activeDensity === "#556cd6" && (*/}
            {/*        <p style={{fontWeight: 'bold', fontSize: '24px', marginLeft: 50, marginTop: 10}}>*/}
            {/*            Legend*/}
            {/*        </p>*/}
            {/*    )}*/}
            {/*    <div id="legend" ref={legendArea}></div>*/}
            {/*</Col>*/}
            <div id="main-plot" ref={chartArea}></div>

            <Row justify={"space-around"} style={{width: "100%", marginTop: 10}}>
                <p style={{fontWeight: 'bold', fontSize: '24px', marginLeft: 10, marginTop: 10}}>
                    KDE density in highlighted contour: {captured}
                </p>

            </Row>
            {/*<Row*/}
            {/*    id="main-plot-legend"*/}
            {/*    style={{display: "flex", flexDirection: "column"}}*/}
            {/*    ref={legendContainer}*/}
            {/*></Row>*/}
            <Col justify={"space-around"} style={{width: "100%", marginTop: "10px"}}>
                <Row justify={"space-evenly"} style={{width: "100%"}}>

                    <Button
                        variant="contained"
                        onClick={toggleInteractionMode}
                        style={{margin: 8, backgroundColor: '#556cd6'}}
                    >
                    <span style={{fontSize: "10px", color: "white"}}>
                        {interactionMode === 'panning' ? 'Current mode: Panning (click to switch to brushing)'
                            : 'Current mode: Brushing (click to switch to panning)'}
                    </span>
                    </Button>
                </Row>
                <Row justify={"space-evenly"} style={{width: "100%", marginTop: 10}}>
                    <Button
                        variant="outlined"
                        aria-label="Show / Hide Density Plots"
                        onClick={toggleDensityPlots}
                        style={{maxWidth: "300px", backgroundColor: activeDensity}}
                    >
					<span style={{fontSize: "10px", color: "white"}}>
						Show / Hide Density Plots
					</span>
                    </Button>


                    <Button
                        variant="outlined"
                        aria-label="Show / Hide Scatter Plots"
                        onClick={toggleScatterPlots}
                        style={{maxWidth: "300px", backgroundColor: activeScatter}}
                    >
					<span style={{fontSize: "10px", color: "white"}}>
						Show / Hide Scatter Plots
					</span>
                    </Button>
                </Row>
                <Row justify={"space-around"} style={{width: "100%", marginTop: 10}}>
                    <Button
                        variant="outlined"
                        aria-label="find nearest neighbors"
                        onClick={toggleFindNeighbors}
                        style={{maxWidth: "300px", backgroundColor: activateKNN}}
                        endIcon={<FcMindMap style={{fontSize: "25px"}}/>}
                    >
					<span style={{fontSize: "10px", color: "white"}}>
						Find Nearest Neighbors
					</span>
                    </Button>


                    <Dialog
                        open={openNeighbor}
                        PaperComponent={NeighborPaperComponent}
                        onClose={handleNeighborClose}
                        aria-labelledby="draggable-neighbor-dialog-title"
                        scroll="body"
                        maxWidth="lg"
                        hideBackdrop
                    >
                        <DialogTitle style={{cursor: 'move', display: 'flex', justifyContent: 'space-between'}}
                                     id="draggable-neighbor-dialog-title">
                            <Typography style={{fontSize: "20px"}}>Nearest Neighbors Panel</Typography>
                            <CloseIcon onClick={handleNeighborClose} style={{cursor: 'pointer'}}/>
                        </DialogTitle>
                        <DialogContent>
                            <NeighborPanel neighbors={neighbors}/>
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant="outlined"
                        aria-label="save data panel"
                        onClick={handleDataOpen}
                        style={{maxWidth: "300px"}}
                        endIcon={
                            <SaveIcon
                                style={{color: "black", fontSize: "25px"}}
                            />
                        }
                    >
					<span style={{fontSize: "10px", color: "#8A8BD0"}}>
						Save Data
					</span>
                    </Button>
                    <Dialog
                        open={openData}
                        PaperComponent={PaperComponent}
                        onClose={handleDataClose}
                        aria-labelledby="draggable-dialog-title"
                        scroll="body"
                        maxWidth="lg"
                        hideBackdrop
                    >
                        <DialogTitle style={{cursor: 'move', display: 'flex', justifyContent: 'space-between'}}
                                     id="draggable-dialog-title">
                            <Typography style={{fontSize: "20px"}}>
                                Save Data Panel
                            </Typography>
                            <CloseIcon onClick={handleDataClose} style={{cursor: 'pointer'}}/>
                        </DialogTitle>
                        <DialogContent>
                            <SavePanel selectedData={selectedData}/>
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant="outlined"
                        endIcon={<RestartAltIcon/>}
                        onClick={handleResetClick}
                        style={{
                            backgroundColor: '#ff1744',
                            color: 'white',
                            fontSize: "12px",
                            border: "1px solid rgba(255, 23, 68, 0.5)"
                        }}
                    >Reset</Button>
                </Row>
            </Col>
        </div>
    );
};

export default ScatterWithContourWrapper;
