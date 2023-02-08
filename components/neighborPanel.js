import { useRef } from 'react'
import styles from "../styles/Home.module.css";
import NeighborTable from "./neighborTable";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import { CSVLink } from "react-csv";


const NeighborPanel = ({ neighbors }) => {
    const csvLink = useRef() 
  const handleDownloadClick = () => {
    setTimeout(() => {
        csvLink.current.link.click();
    })
  }
  return (
    <div className={styles.saveSection}>
      <div className={styles["save-data-content-line"]}>
        <p className={styles["data-title"]}>Nearest Five Neighbors Panel</p>
        <div className={styles["save-table-button-group"]}>
        <Button className={styles["save-table-button"]} variant="contained" endIcon={<DownloadIcon />} onClick={handleDownloadClick}>
          Download
        </Button>
        <CSVLink data={neighbors} filename={"5_nearest_neighbors.csv"} ref={csvLink} target='_blank'></CSVLink>
        </div>
      </div>
      <div className={styles["save-table-wrapper"]}>
        <NeighborTable data={neighbors}/>
      </div>
    </div>
  );
};

export default NeighborPanel;
