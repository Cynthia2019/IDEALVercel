import { useEffect, useState } from "react";
import styles from "@/styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload } from "antd";
import s3Client from "@/pages/api/aws";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import processData from "@/util/processData";
import Papa, { parse } from "papaparse";
import { colorAssignment, requiredColumns } from "@/util/constants";
import {getAllData} from "@/pages/scatter";
import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import IconButton from "@mui/material/IconButton";
import {csvParse} from "d3";
import {data_template} from "@/data/constants";
import FileSaver from 'file-saver';

resetServerContext();
const AxisSelections = ["C11", "C12", "C22", "C16", "C26", "C66"];

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #ced4da",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
    },
  },
}));

const XAxisSelector = ({ query1, handleQuery1Change }) => {
  <div className={styles["data-content-line"]}>
    <p>X-axis</p>
    <FormControl variant="standard" fullWidth>
      <InputLabel id="x-axis-select-label">{query1}</InputLabel>
      <Select
        labelId="x-axis-select-label"
        id="x-axis-select"
        value={query1}
        onChange={handleQuery1Change}
        input={<BootstrapInput />}
      >
        {AxisSelections.map((item, index) => {
          return (
            <MenuItem value={item} key={index}>
              {item}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  </div>;
};

const YAxisSelector = ({ query2, handleQuery2Change }) => {
  <div className={styles["data-content-line"]}>
    <p>Y-axis</p>
    <FormControl variant="standard" fullWidth>
      <InputLabel id="x-axis-select-label">{query2}</InputLabel>
      <Select
        labelId="x-axis-select-label"
        id="x-axis-select"
        value={query2}
        onChange={handleQuery2Change}
        input={<BootstrapInput />}
      >
        {AxisSelections.map((item, index) => {
          return (
            <MenuItem value={item} key={index}>
              {item}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  </div>;
};

const DataSelector = ({
  page,
  setDatasets,
  availableDatasetNames,
  setAvailableDatasetNames,
  query1,
  handleQuery1Change,
  query2,
  handleQuery2Change,
  activeData,
  dataLibrary,
  setActiveData,
  setDataLibrary,
    open,
}) => {
  async function getAllData() {
    const env = process.env.NODE_ENV
    // let url= 'http://3.142.46.2:8000/model?data='
    let url= 'http://localhost:8000/model?data='
    if (env == 'production') {
      url = 'http://3.142.46.2:8000/model?data='
    }
    let response = await fetch(`${url}`, {
      method: "POST",
      mode: "cors",
    })
        .then((res) => res.json())
        .catch((err) => console.log(err));
    return response;
  }
  const [showData, setShowData] = useState(
    availableDatasetNames.map((dataset, index) => {
      return true;
    })
  );

  const onIconChange = (event, index) => {
    //if unchecked, remove from activeData and add to dataLibrary
    if (!event.target.checked) {
      let sourceItems = dataLibrary;
      let destItems = activeData;
      const unchecked = destItems.filter(
        (item) => item.name == availableDatasetNames[index].name
      );

      destItems = destItems.filter(
        (item) => item.name != availableDatasetNames[index].name
      );
      sourceItems = sourceItems.concat(unchecked);
      setActiveData(destItems);
      setDataLibrary(sourceItems);
    } else {
      let sourceItems = activeData;
      let destItems = dataLibrary;
      const checked = destItems.filter(
        (item) => item.name == availableDatasetNames[index].name
      );
      destItems = destItems.filter(
        (item) => item.name != availableDatasetNames[index].name
      );
      sourceItems = sourceItems.concat(checked);
      setActiveData(sourceItems);
      setDataLibrary(destItems);
    }
    let temp = [...showData];
    temp[index] = !temp[index];
    setShowData(temp);
  };

  function Row(props) {
    const [open, setOpen] = React.useState(false);
    const dataset = props.dataset;
    const index = props.index;
    const data = activeData[index] ? activeData[index].data : [0];

    return (
      <React.Fragment>
        <TableRow>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          <TableCell component="th" scope="row">
            {/*{dataset.name}*/}
            <Chip
              key={dataset.name}
              label={dataset.name}
              sx={{ backgroundColor: dataset.color, color: "white" }}
            />
          </TableCell>

          <TableCell>
            <Checkbox
              sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
              onChange={(e) => onIconChange(e, index)}
              checked={showData[index]}
            />
          </TableCell>
        </TableRow>
        <TableRow
          key={dataset.name + " details"}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                ></Typography>
                <Box>
                  <h3> Data info: </h3>
                  <p> {dataset.name} </p>
                  <h3> Author(s): </h3>
                  <p> Northwestern University</p>
                  <h3>Description: </h3>
                  <p>
                    This database contains 248396 orthotropic microstructures
                    represented by 50x50 pixelated matrices as well as the
                    associated independent components of the stiffness tensor
                    calculator by energy-based homogenization, i.e.,C11 ,C12 ,
                    C22 and C66. The microstructures are composed of void (air)
                    and solid (Young’s modulus=1(normalized), Poisson’s
                    ratio=0.49). We first performed SIMP-based TO to find a
                    corresponding pixelated microstructure design for each
                    uniformly sampled target stiffness matrix. With 1400
                    microstructures generated by TO as initial seeds, an
                    iterative stochastic shape perturbation algorithm is
                    employed to perturb microstructure geometries that
                    correspond to extreme and sparse properties. The CMAME
                    version of database (240k) is extended from the SMO version
                    (88k).
                  </p>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  const props = {
    multiple: false,
    async customRequest({
      action,
      data,
      file,
      filename,
      headers,
      onError,
      onProgress,
      onSuccess,
      withCredentials,
    }) {
      const command = new PutObjectCommand({
        Bucket: "ideal-dataset-1",
        Key: file.name,
        Body: file,
        Fields: {
          acl: "public-read",
          "Content-Type": "text/csv",
        },
      });
      await s3Client.send(command).then((res) => {
        console.log('fetching data selector')
        if (res.$metadata.httpStatusCode == 200) {
          onSuccess(res, file);
          //if success, process the file data, then add the dataset to the dataset state.
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (res) => {
              setDatasets((prevState) => [
                ...prevState,
                {
                  name: file.name,
                  data: processData(res.data),
                  color: colorAssignment[prevState.length],
                },
              ]);
              setAvailableDatasetNames((prevState) => [
                ...prevState,
                {
                  name: file.name,
                  color: colorAssignment[prevState.length],
                },
              ]);
              setDataLibrary((prevState) => [
                ...prevState,
                {
                  name: file.name,
                  data: processData(res.data),
                  color: colorAssignment[availableDatasetNames.length],
                },
              ]);
            },
          });
        } else {
          onError();
          console.log("failed");
        }
      });
    },
  };

  const downloadTemplate = () => {
    let sliceSize = 1024;
    let byteCharacters = atob(data_template);
    let bytesLength = byteCharacters.length;
    let slicesCount = Math.ceil(bytesLength / sliceSize);
    let byteArrays = new Array(slicesCount);
    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    let begin = sliceIndex * sliceSize;
    let end = Math.min(begin + sliceSize, bytesLength);
    let bytes = new Array(end - begin);
    for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  FileSaver.saveAs(
      new Blob(byteArrays, { type: "application/json;charset=utf-8" }),
      "template.csv"
  );
};
  return (
    <div className={styles["data-selector"]}>
      <div className={`${open ? styles["data-row"] : styles["data-row-closed"]}`}>
        <p className={styles["data-title"]}>Data</p>
        <Upload {...props} accept="text/csv">
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
        <Button variant="contained" onClick={downloadTemplate} id="downloadBtn" value="download">Download Template</Button>
      </div>
      <div className={`${open ? styles["data-content-line"] : styles["data-content-line-closed"]}`}>
        <FormControl sx={{ m: 1, maxWidth: "100%" }}>
          <div>
            <TableContainer
              component={Paper}
              sx={{ maxHeight: 235, minWidth: 200 }}
            >
              <Table stickyHeader aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Select</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableDatasetNames.map((dataset, index) => (
                    <Row key={dataset.name} dataset={dataset} index={index} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </FormControl>
      </div>
      {page == "scatter" && (
        <React.Fragment>
          <XAxisSelector query1={query1} />
          <YAxisSelector query2={query2} />
        </React.Fragment>
      )}
      {page == "histogram" && (
        <React.Fragment>
          <XAxisSelector query1={query1} />
        </React.Fragment>
      )}
    </div>
  );
};

export default DataSelector;
