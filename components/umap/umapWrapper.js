import React, { useRef, useState, useEffect } from "react";
import Umap from "@/charts/umap";
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
import { Row } from "antd";
import Draggable from "react-draggable";
import Paper from "@mui/material/Paper";
import CloseIcon from "@mui/icons-material/Close";

const PaperComponent = (props) => {
	return (
		<Draggable
			handle="#draggable-dialog-title"
			cancel={'[class*="MuiDialogContent-root"]'}
		>
			<Paper {...props} style={{ overflow: "auto" }} />
		</Draggable>
	);
};

const NeighborPaperComponent = (props) => {
	return (
		<Draggable
			handle="#draggable-neighbor-dialog-title"
			cancel={'[class*="MuiDialogContent-root"]'}
		>
			<Paper {...props} style={{ overflow: "auto" }} />
		</Draggable>
	);
};

const UmapWrapper = ({
	data,
	setDataPoint,
	query1,
	query2,
	selectedData,
	setSelectedData,
	reset,
	setReset,
	knn,
}) => {
	const chartArea = useRef(null);
	const legendArea = useRef(null);
	const [chart, setChart] = useState(null);
	const [clickedNeighbor, setClickedNeighbor] = useState(true);
	const [openNeighbor, setOpenNeighbor] = useState(false);
	const [openData, setOpenData] = useState(false);
	const [neighbors, setNeighbors] = useState([]);
	const [activateKNN, setActivateKNN ] = useState("#556cd6");

	const toggleFindNeighbors = () => {
		setClickedNeighbor((current) => !current);
		setActivateKNN((currentColor) => currentColor == "#556cd6" ? "grey" : "#556cd6");

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
				new Umap({
					element: chartArea.current,
					legendElement: legendArea.current,
					data,
					setDataPoint,
					selectedData,
					setSelectedData,
					knn,
				})
			);
		} else {
			chart.update({
				data,
				element: chartArea.current,
				legendElement: legendArea.current,
				setDataPoint,
				query1,
				query2,
				selectedData,
				setSelectedData,
				setNeighbors,
				reset,
				setReset,
				knn,
				clickedNeighbor,
				setOpenNeighbor,
			});
		}
	}, [chart, query1, query2, data, reset, knn, clickedNeighbor]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				marginLeft: "30px",
			}}
		>
			<div id="umap-plot" ref={chartArea}></div>
			<Row
				justify={"space-around"}
				style={{ width: "100%"}}
			>
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
					<DialogTitle
						style={{
							cursor: "move",
							display: "flex",
							justifyContent: "space-between",
						}}
						id="draggable-neighbor-dialog-title"
					>
						<Typography style={{ fontSize: "20px" }}>
							Nearest Neighbors Panel
						</Typography>
						<CloseIcon
							onClick={handleNeighborClose}
							style={{ cursor: "pointer" }}
						/>
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
					<DialogTitle
						style={{
							cursor: "move",
							display: "flex",
							justifyContent: "space-between",
						}}
						id="draggable-dialog-title"
					>
						<Typography style={{ fontSize: "20px" }}>
							Save Data Panel
						</Typography>
						<CloseIcon
							onClick={handleDataClose}
							style={{ cursor: "pointer" }}
						/>
					</DialogTitle>
					<DialogContent>
						<SavePanel selectedData={selectedData} />
					</DialogContent>
				</Dialog>
				<Button
					variant="outlined"
					endIcon={<RestartAltIcon />}
					onClick={handleResetClick}
					style={{
						backgroundColor: "#ff1744",
						color: "white",
						fontSize: "12px",
						border: "1px solid rgba(255, 23, 68, 0.5)",
					}}
				>
					Reset
				</Button>
			</Row>
		</div>
	);
};

export default UmapWrapper;
