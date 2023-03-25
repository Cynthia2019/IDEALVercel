import { useRef, useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import SaveDataTable from "./saveDataTable";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import { Row, Col } from "antd";
import { CSVLink } from "react-csv";

const C_list = ["C11", "C12", "C22", "C16", "C26", "C66"];

const SavePanel = ({ selectedData, setReset }) => {
  const csvLink = useRef();
  const handleDownloadClick = () => {
    setTimeout(() => {
      csvLink.current.link.click();
    });
  };
  const handleResetClick = () => {
    setReset(true);
  };
  const [diversity, setDiversity] = useState({});
  useEffect(() => {
    let formated = selectedData.map((data) => {
      let arr = C_list.map((col) => data[col]);
      return { data: arr };
    });
    async function getDiversity(body) {
      const env = process.env.NODE_ENV;
      let url = "http://localhost:8000/diversity/";
      if (env == "production") {
  //      url =
//          "https://ideal-server-espy0exsw-cynthia2019.vercel.app/diversity/";
      }
      try {
        const response = await fetch(`${url}`, {
          body: body,
          method: "POST",
        });
        const jsonData = await response.json();
        setDiversity(jsonData[0]);
      }
      catch (err) {
        console.log("Server not up");
        setDiversity({})
      }
    }
    getDiversity(JSON.stringify(formated));
  }, [selectedData]);
  return (
    <div className={styles.saveSection}>
      <div className={styles["save-data-content-line"]}>
        <p className={styles["data-title"]}>Save Panel</p>
        <div className={styles["save-table-button-group"]}>
          <Button
            className={styles["save-table-button"]}
            endIcon={<DownloadIcon />}
            onClick={handleDownloadClick}
          >
            Download
          </Button>
          <Button
            className={styles["save-table-button"]}
            endIcon={<RestartAltIcon />}
            onClick={handleResetClick}
            color="error"
          ></Button>
          <CSVLink
            data={selectedData}
            filename={"saved_data.csv"}
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
            <h3>Total:&nbsp;{selectedData.length}</h3>
          </Box>
          <Box component="span">
            <h3>Diversity raw:&nbsp;{diversity?.raw}</h3>
          </Box>
          <Box component="span">
            <h3>Diversity standardized:&nbsp;{diversity?.standardized}</h3>
          </Box>
        </Row>
      </div>
    </div>
  );
};

export default SavePanel;
