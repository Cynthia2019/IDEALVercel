import React, { useRef, useState, useEffect } from "react";
import ScatterWithContour from "../../charts/scatterWithContour";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Typography } from "@mui/material";
import { FcMindMap } from "react-icons/fc";
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
}) => {
	const chartArea = useRef(null);
	const legendArea = useRef(null);
	const [chart, setChart] = useState(null);
	const [clickedNeighbor, setClickedNeighbor] = useState(true);
	const [openNeighbor, setOpenNeighbor] = useState(false);
	const [openData, setOpenData] = useState(false);
	const [activateKNN, setActivateKNN ] = useState("#556cd6");
	const [activeDensity, setActiveDensity ] = useState("#556cd6");

	const toggleFindNeighbors = () => {
		setClickedNeighbor((current) => !current);
		setActivateKNN((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");
	};

	const toggleDensityPlots = () => {
		// setClickedNeighbor((current) => !current);
		setActiveDensity((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");
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

	useEffect(() => {
		if (!chart) {
			setChart(
				new ScatterWithContour(
					chartArea.current,
					legendArea.current,
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
				showDensity: activeDensity === "#556cd6"
			});
		}
	}, [chart, query1, query2, data, densityData, scatterData, reset, clickedNeighbor, activeDensity]);

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
				{activeDensity === "#556cd6" && (
					<p style={{ fontWeight: 'bold', fontSize: '24px', marginLeft: 50, marginTop: 10 }}>
						Legend
					</p>
				)}
				<div id="legend" ref={legendArea}></div>
			</Col>
			<div id="main-plot" ref={chartArea}></div>
			<Row justify={"space-around"} style={{ width: "100%", marginTop: "30px" }}>
				<Button
					variant="outlined"
					aria-label="Show / Hide Density Plots"
					onClick={toggleDensityPlots}
					style={{ maxWidth: "300px", backgroundColor: activeDensity }}
				>
					<span style={{ fontSize: "10px", color: "white" }}>
						Show / Hide Density Plots
					</span>
				</Button>
				<Button
					variant="outlined"
					aria-label="find nearest neighbors"
					onClick={toggleFindNeighbors}
					style={{ maxWidth: "300px", backgroundColor: activateKNN }}
					endIcon={<FcMindMap style={{ fontSize: "25px" }} />}
				>
					<span style={{ fontSize: "10px", color: "white" }}>
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
					<DialogTitle style={{cursor: 'move', display: 'flex', justifyContent: 'space-between'}} id="draggable-neighbor-dialog-title">
						<Typography style={{ fontSize: "20px" }}>Nearest Neighbors Panel</Typography>
						<CloseIcon onClick={handleNeighborClose} style={{cursor: 'pointer'}}/>
					</DialogTitle>
					<DialogContent>
						<NeighborPanel neighbors={neighbors} />
					</DialogContent>
				</Dialog>
				<Button
					variant="outlined"
					aria-label="save data panel"
					onClick={handleDataOpen}
					style={{ maxWidth: "300px" }}
					endIcon={
						<SaveIcon
							style={{ color: "black", fontSize: "25px" }}
						/>
					}
				>
					<span style={{ fontSize: "10px", color: "#8A8BD0" }}>
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
					<DialogTitle style={{cursor: 'move', display: 'flex', justifyContent: 'space-between'}} id="draggable-dialog-title">
						<Typography style={{ fontSize: "20px" }}>
						Save Data Panel
						</Typography>
						<CloseIcon onClick={handleDataClose} style={{cursor: 'pointer'}}/>
					</DialogTitle>
					<DialogContent>
						<SavePanel selectedData={selectedData} />
					</DialogContent>
				</Dialog>
				<Button
					variant="outlined"
					endIcon={<RestartAltIcon />}
					onClick={handleResetClick}
					style={{ backgroundColor: '#ff1744', color: 'white', fontSize: "12px", border: "1px solid rgba(255, 23, 68, 0.5)"}}
				>Reset</Button>
			</Row>
		</div>
	);
};

export default ScatterWithContourWrapper;