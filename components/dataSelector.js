import { useState } from "react";
import styles from "../styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import s3Client from '../pages/api/aws'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import processData from "@/util/processData";
import Papa, { parse } from 'papaparse'
import { colorAssignment, requiredColumns } from "@/util/constants";

const datasetNames = [
  {
    name: "free form 2D",
    color: "#8A8BD0",
  },
  {
    name: "lattice 2D",
    color: "#FFB347",
  },
];

const AxisSelections = [
  "C11",
  "C12",
  "C22",
  "C16",
  "C26",
  "C66",
  "Minimal directional Young's modulus [N/m]",
  "Maximal directional Young's modulus [N/m]",
  "Minimal Poisson's ratio [-]",
  "Maximal Poisson's ratio [-]",
];

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};



const DataSelector = ({
  setDatasets, 
  availableDatasetNames,
  setAvailableDatasetNames,
  selectedDatasetNames,
  handleSelectedDatasetNameChange,
  query1,
  handleQuery1Change,
  query2,
  handleQuery2Change,
}) => {

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
      withCredentials
    }) {
      //TODO: examine the columns of data first; if format unmatch, then trigger onError
      // also need to check the file size. 
      // cannot be more than 100 MB
      // file size check 
      // Papa.parse(file, {
      //   header: true,
      //   skipEmptyLines: true,
      //   chunkSize: 1048576,
      //   error: (res, file) => {
      //     alert("Could not upload file larger than 1MB")
      //     onError()
      //   },
      //   complete: (res, file) => {
      //     columns = res.data[0].keys()
      //     for (const col in requiredColumns) {
      //       if(!columns.includes(col)) {
      //         alert("Incorrect Column Names")
      //         onError()
      //       }
      //     }
      //   }
      // })

      const command = new PutObjectCommand({
        Bucket: 'ideal-dataset-1', 
        Key: file.name,
        Body: file,
        Fields: {
          acl: 'public-read',
          'Content-Type': 'text/csv'
        },
      })
      await s3Client.send(command).then((res) => {
        if(res.$metadata.httpStatusCode == 200) {
          onSuccess(res, file)
          //if success, process the file data, then add the dataset to the dataset state. 
          Papa.parse(file, {
            header:true, 
            skipEmptyLines: true, 
            complete: (res) => {
              setDatasets(prevState => [...prevState, {
                name: file.name, 
                data: processData(res.data), 
                color: colorAssignment[prevState.length]
              }])
              setAvailableDatasetNames(prevState => [...prevState, {
                name: file.name, 
                color: colorAssignment[prevState.length]
              }])
            }
          })
        }
        else {
          onError()
          console.log('failed')
        }
      })
    }
  }

  return (
    <div className={styles["data-selector"]}>
      <div className={styles["data-row"]}>
        <p className={styles["data-title"]}>Data</p>
        <Upload {...props} accept='text/csv'>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </div>
      <div className={styles["data-content-line"]}>
        <FormControl sx={{ m: 1, maxWidth: "100%" }}>
          <InputLabel htmlFor="dataset-select">Data</InputLabel>
          <Select
            id="dataset-select"
            labelId="dataset-select-label"
            multiple
            onChange={handleSelectedDatasetNameChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            value={selectedDatasetNames || ""}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((obj) => {
                  const parsed = JSON.parse(obj);
                  return (
                    <Chip
                      key={parsed.name}
                      label={parsed.name}
                      sx={{ backgroundColor: parsed.color, color: "white" }}
                    />
                  );
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {availableDatasetNames.map((obj, i) => (
              <MenuItem
                value={JSON.stringify({
                  name: obj.name,
                  color: obj.color,
                })}
                key={`${obj.name}-${i}`}
                sx={{ backgroundColor: obj.color }}
              >
                {obj.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className={styles["data-content-line"]}>
        <p>x-axis data</p>
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
      </div>
      <div className={styles["data-content-line"]}>
        <p>y-axis data</p>
        <FormControl variant="standard" fullWidth>
          <InputLabel id="y-axis-select-label">{query2}</InputLabel>
          <Select
            labelId="y-axis-select-label"
            id="y-axis-select"
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
      </div>
    </div>
  );
};

export default DataSelector;
