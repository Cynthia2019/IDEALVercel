import React, { useRef, useState, useEffect } from "react";
import Scatter from "../charts/scatter";
// import Switch from '@mui/material/Switch';
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import {FcMindMap} from 'react-icons/fc'

const ScatterWrapper = ({
  data,
  setDataPoint,
  query1,
  query2,
  selectedData,
  setSelectedData,
  setNeighbors, 
  reset,
  setReset
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
          new Scatter(
              chartArea.current,
              legendArea.current,
              data,
              setDataPoint,
              selectedData,
              setSelectedData,
              view
          )
      );
    } 
     else {
      chart.update(
        {
          data,
          element: chartArea.current,
          legendElement: legendArea.current,
          setDataPoint,
          query1,
          query2,
          selectedData,
          setSelectedData,
          setNeighbors,
          view,
          reset,
          setReset
        }

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
          <ToggleButton value="brush-on" aria-label="brush-on">
          <CheckCircleOutlinedIcon
                style={{ fontSize: "15px", color: "green" }}

              />
              <span style={{ fontSize: "10px" }}>Select Data</span>
            </ToggleButton>
            <ToggleButton value="brush-off" aria-label="brush-off">
              <CancelOutlinedIcon style={{ fontSize: "15px", color: "red" }} />
              <span style={{ fontSize: "10px" }}>Deselect Data</span>
          </ToggleButton>
          <ToggleButton value='neighbor' aria-label="find nearest neighbors">
            <FcMindMap style={{fontSize: '25px'}}/>
            <span style={{ fontSize: "10px" }}>Find Nearest Neighbors</span>
          </ToggleButton>

        </ToggleButtonGroup>

      </div>
  );
};

export default ScatterWrapper;