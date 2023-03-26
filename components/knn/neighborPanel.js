import { useRef } from 'react'
import styles from "@/styles/Home.module.css";
import NeighborTable from "./neighborTable";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { CSVLink } from "react-csv";

const transpose = (data) => {
  if (data.length == 0) return []
  let transposed = []
  let point = {}
  for (let i = 0; i < data.length; i++){
    point[`point${i}`] = {
      geometry: data[i]['geometry'],
      outline_color: data[i]['outline_color'],
      C11: data[i]['C11'],
      C12: data[i]['C12'],
      C22: data[i]['C22'], 
      C16: data[i]['C16'],
      C26: data[i]['C26'], 
      C66: data[i]['C66'],
      distance: Math.round(data[i]['distance']*100)/100
    }
  }
  transposed.push(point)
  return transposed
}


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
        <p className={styles["data-title"]}>Nearest Neighbors Panel</p>
        <div className={styles["save-table-button-group"]}>
        <Button className={styles["save-table-button"]} endIcon={<DownloadIcon />} onClick={handleDownloadClick}>
          Download
        </Button>
        <CSVLink data={neighbors} filename={"5_nearest_neighbors.csv"} ref={csvLink} target='_blank'></CSVLink>
        </div>
      </div>
      <div className={styles["save-table-wrapper"]}>
        <NeighborTable data={[transpose(neighbors)[0]]}/>
      </div>
    </div>
  );
};

export default NeighborPanel;
