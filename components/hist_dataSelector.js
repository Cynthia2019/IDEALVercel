import { useState } from "react";
import styles from "../styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

const AxisSelections = [
    "C11",
    "C12",
    "C22",
    "C16",
    "C26",
    "C66",
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

const datasetNames = [{
  name: "free form 2D",
  color: "#8A8BD0"
}, {
  name: "lattice 2D",
  color: "#FFB347"
}];

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

const Hist_DataSelector = ({
                                 selectedDatasetNames,
                                 handleSelectedDatasetNameChange,
                                 query1,
                                 handleQuery1Change,
                                 query2,
                                 handleQuery2Change,
                               }) => {
  return (
      <div className={styles["data-selector"]}>
        <div className={styles["content-line"]}>
          <p className={styles["data-title"]}>Data</p>
          <FormControl sx={{ m: 1, maxWidth: '100%' }}>
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
                        const parsed = JSON.parse(obj)
                        return (
                            <Chip key={parsed.name} label={parsed.name} sx={{backgroundColor:parsed.color, color:'white'}} />
                        )
                      })}
                    </Box>
                )}
                MenuProps={MenuProps}
            >
              {datasetNames.map((obj, i) => (
                  <MenuItem value={JSON.stringify({
                    name: obj.name,
                    color: obj.color
                  })} key={`${obj.name}-${i}`} sx={{backgroundColor: obj.color}}>
                    {obj.name}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
            <div className={styles["data-content-line"]}>
                <p className={styles["data-title"]}>X-axis</p>
                <FormControl variant="standard" fullWidth>
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
        </div>
      </div>
  );
};

export default Hist_DataSelector;
