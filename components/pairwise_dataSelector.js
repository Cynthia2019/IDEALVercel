import { useState } from "react";
import styles from "../styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

const datasetNames = ["free form 2D", "lattice 2D"];

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

const Pairwise_DataSelector = ({
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
        <FormControl sx={{ m: 1}}>
          <InputLabel htmlFor="dataset-select">
            Data
          </InputLabel>
          <Select
            id="dataset-select"
            labelId="dataset-select-label"
            multiple
            onChange={handleSelectedDatasetNameChange}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            value={selectedDatasetNames}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {datasetNames.map((name, i) => (
              <MenuItem value={name} key={`${name}-${i}`}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};

export default Pairwise_DataSelector;
