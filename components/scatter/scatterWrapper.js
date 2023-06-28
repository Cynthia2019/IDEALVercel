import React, { useRef, useState, useEffect } from "react";
import Scatter from "../../charts/scatter";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { FcMindMap } from "react-icons/fc";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import NeighborPanel from "../knn/neighborPanel";
import SavePanel from "../saveData/savePanel";
import { Row } from "antd";

const ScatterWrapper = ({
	data,
	setDataPoint,
	query1,
	query2,
	selectedData,
	setSelectedData,
	setNeighbors,
	reset,
	setReset,
	datasets,
	neighbors,
}) => {
	const chartArea = useRef(null);
	const legendArea = useRef(null);
	const [chart, setChart] = useState(null);
	const [openNeighbor, setOpenNeighbor] = useState(false);
	const [openData, setOpenData] = useState(false);

	const handleNeighborOpen = () => {
		setOpenNeighbor(true);
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
				new Scatter(
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
				datasets,
			});
		}
	}, [chart, query1, query2, data, reset]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				marginLeft: "10px",
			}}
		>
			<div id="main-plot" ref={chartArea}></div>
			<Row justify={"space-around"} style={{ width: "100%", marginTop: "10px" }}>
				<Button
					variant="contained"
					aria-label="find nearest neighbors"
					onClick={handleNeighborOpen}
					style={{ maxWidth: "300px" }}
					endIcon={<FcMindMap style={{ fontSize: "25px" }} />}
				>
					<span style={{ fontSize: "10px", color: "#8A8BD0" }}>
						Find Nearest Neighbors
					</span>
				</Button>
				<Dialog
					open={openNeighbor}
					onClose={handleNeighborClose}
					aria-labelledby="neighbor-dialog"
					scroll="body"
					maxWidth="lg"
				>
					<DialogTitle id="neighbor-dialog">
						{"Nearest Neighbors Panel"}
					</DialogTitle>
					<DialogContent>
						<NeighborPanel neighbors={neighbors} />
					</DialogContent>
				</Dialog>
				<Button
					variant="contained"
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
						Save Data Panel
					</span>
				</Button>
				<Dialog
					open={openData}
					onClose={handleDataClose}
					aria-labelledby="data-dialog"
					scroll="body"
					maxWidth="lg"
				>
					<DialogTitle id="data-dialog">
						{"Save Data Panel"}
					</DialogTitle>
					<DialogContent>
						<SavePanel selectedData={selectedData} />
					</DialogContent>
				</Dialog>
				<Button
					variant="outlined"
					endIcon={<RestartAltIcon />}
					onClick={handleResetClick}
					color="error"
				></Button>
			</Row>
		</div>
	);
};

export default ScatterWrapper;

{
	/* <div
id="main-plot-side-bar"
style={{
	display: "flex",
	flexDirection: "column",
	zIndex: 10,
	marginLeft: 10,
}}
>
	{/* <ToggleButton value="zoom" aria-label="zoom">
		<ZoomInMapIcon style={{ fontSize: "15px" }} />
		<span style={{ fontSize: "10px" }}>Zoom</span>
	</ToggleButton>
	<ToggleButton value="brush-on" aria-label="brush-on">
		<CheckCircleOutlinedIcon
			style={{ fontSize: "15px", color: "green" }}
		/>
		<span style={{ fontSize: "10px" }}>Select Data</span>
	</ToggleButton>
	<ToggleButton value="brush-off" aria-label="brush-off">
		<CancelOutlinedIcon
			style={{ fontSize: "15px", color: "red" }}
		/>
		<span style={{ fontSize: "10px" }}>Deselect Data</span>
	</ToggleButton> 

</div> */
}
