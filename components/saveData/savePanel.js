import { useRef, useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";
import SaveDataTable from "./saveDataTable";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import { useTheme } from "@emotion/react";
import Box from "@mui/material/Box";
import { Row, Col, Typography } from "antd";
import {CSVDownload, CSVLink} from "react-csv";

const C_list = ["C11", "C12", "C22", "C16", "C26", "C66"];

const SavePanel = ({ selectedData, setReset }) => {
  const csvLink = useRef();
  const theme = useTheme(); 
  const handleDownloadClick = () => {
    setTimeout(() => {
      csvLink.current.link.click();
    });
  };
  const [diversity, setDiversity] = useState({});
  const [customFilename, setCustomFilename] = useState('');

  useEffect(() => {
    let formated = selectedData.map((data) => {
      let arr = C_list.map((col) => data[col]);
      return { data: arr };
    });
    async function getDiversity(body) {
      let url= 'https://metamaterials-srv.northwestern.edu./diversity/'
      try {
        const response = await fetch(`${url}`, {
          body: body,
          method: "POST",
        });
        const jsonData = await response.json();
        setDiversity(jsonData[0]);
      }
      catch (err) {   
        setDiversity({})
      }
    }
    if (selectedData.length >= 10) {
      getDiversity(JSON.stringify(formated));
    }
  }, [selectedData]);
  return (
    <div className={styles.saveSection}>
      <div className={styles["save-data-content-line"]}>
        <p className={styles["data-title"]}>Save Panel</p>
        <div className={styles["save-table-button-group"]}>
          <input
              type="text"
              placeholder="Enter filename..."
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
          />
          <Button
            className={styles["save-table-button"]}
            endIcon={<DownloadIcon />}
            onClick={handleDownloadClick}
          >
            Download
          </Button>
          <CSVLink
            data={selectedData}
            filename={customFilename + ".csv"}
            ref={csvLink}
            target="_blank"
          ></CSVLink>
        </div>
      </div>
      <div className={styles["save-table-wrapper"]}>
        <Row>
        <SaveDataTable data={selectedData} />
        </Row>
        <Row className={styles["save-table-sidebar"]}>
          <Box component="span">
            <Typography color='textSecondary'>Total:&nbsp;{selectedData.length}</Typography>
          </Box>
          {Object.keys(diversity).length === 0 && (
            <Box component="span">
              <Typography style={{color:theme.palette.warning.main}}>Select more data points to get diversity score</Typography>
            </Box>
          )}
          <Box component="span">
            <Typography color='textSecondary'>Diversity raw:&nbsp;{diversity?.raw}</Typography>
          </Box>
          <Box component="span">
            <Typography color='textSecondary'>Diversity standardized:&nbsp;{diversity?.standardized}</Typography>
          </Box>
        </Row>
      </div>
    </div>
  );
};

export default SavePanel;
