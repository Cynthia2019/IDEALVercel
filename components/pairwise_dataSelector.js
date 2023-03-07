import {useState} from "react";
import styles from "../styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import {Button, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import s3Client from "@/pages/api/aws";
import Papa, {parse} from 'papaparse'
import processData from "@/util/processData";
import {s3BucketList, colorAssignment} from '@/util/constants';


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

const Pairwise_DataSelector = ({
                                   setDatasets,
                                   availableDatasetNames,
                                   setAvailableDatasetNames,
                                   selectedDatasetNames,
                                   handleSelectedDatasetNameChange,
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
                                withCredentials,
                            }) {
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
                if (res.$metadata.httpStatusCode == 200) {
                    onSuccess(res, file)
                    //if success, process the file data, then add the dataset to the dataset state.
                    Papa.parse(file, {
                        header: true,
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
                } else {
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
                    <Button icon={<UploadOutlined/>}>Upload</Button>
                </Upload>
            </div>
            <div className={styles["data-content-line"]}>
                <FormControl sx={{m: 1, maxWidth: "100%"}}>
                    <InputLabel htmlFor="dataset-select">Data</InputLabel>
                    <Select
                        id="dataset-select"
                        labelId="dataset-select-label"
                        multiple
                        onChange={handleSelectedDatasetNameChange}
                        input={<OutlinedInput id="select-multiple-chip" label="Chip"/>}
                        value={selectedDatasetNames || ""}
                        renderValue={(selected) => (
                            <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                                {selected.map((obj) => {
                                    const parsed = JSON.parse(obj);
                                    return (
                                        <Chip
                                            key={parsed.name}
                                            label={parsed.name}
                                            sx={{backgroundColor: parsed.color, color: "white"}}
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
                                sx={{backgroundColor: obj.color}}
                            >
                                {obj.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        </div>
    );
};

export default Pairwise_DataSelector;
