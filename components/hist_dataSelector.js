import {useState} from "react";
import styles from "../styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import {styled} from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import {UploadOutlined} from '@ant-design/icons';
import {Button, message, Upload} from 'antd';
import s3Client from '../pages/api/aws'
import {PutObjectCommand} from '@aws-sdk/client-s3'
import processData from "@/util/processData";
import Papa, {parse} from 'papaparse'
import {colorAssignment, requiredColumns} from "@/util/constants";
import {DragDropContext, Droppable, Draggable, resetServerContext} from 'react-beautiful-dnd';
import {useDrag, useDrop, DndProvider, DragSource, DropTarget} from "react-dnd";

resetServerContext()
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
];

const BootstrapInput = styled(InputBase)(({theme}) => ({
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


const Hist_DataSelector = ({
                               setDatasets,
                               availableDatasetNames,
                               setAvailableDatasetNames,
                               selectedDatasetNames,
                               handleSelectedDatasetNameChange,
                               query1,
                               handleQuery1Change,
                               activeData,
                               dataLibrary,
                               setActiveData,
                               setDataLibrary,
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
                            setDataLibrary(prevState => [...prevState, {
                                name: file.name,
                                data: processData(res.data),
                                color: colorAssignment[availableDatasetNames.length]
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


    const onDragEnd = result => {
        // logic to handle the end of a drag event
        if (!result.destination) return;
        const {source, destination} = result;
        if (source.droppableId !== destination.droppableId) {
            const sourceData = source.droppableId === "active-data" ? activeData : dataLibrary
            const destinationData = destination.droppableId === "data-library" ? dataLibrary : activeData
            const sourceItems = Array.from(sourceData);
            const destItems = Array.from(destinationData);
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed)
            sourceData == activeData ? setActiveData(sourceItems) : setDataLibrary(sourceItems);
            destinationData == activeData ? setActiveData(destItems) : setDataLibrary(destItems);

        } else {
            const sourceData = source.droppableId === "active-data" ? activeData : dataLibrary
            const sourceItems = Array.from(sourceData);
            const [removed] = sourceItems.splice(result.source.index, 1);
            sourceItems.splice(result.destination.index, 0, removed)
            sourceData == activeData ? setActiveData(sourceItems) : setDataLibrary(sourceItems);
        }

    };
    return (
        <div className={styles["data-selector"]}>
            <div className={styles["data-row"]}>
                <p className={styles["data-title"]}>Data</p>
                <Upload {...props} accept='text/csv'>
                    <Button icon={<UploadOutlined/>}>Click to Upload</Button>
                </Upload>
            </div>
            <div className={styles["data-content-line"]}>
                <FormControl sx={{m: 1, maxWidth: "100%"}}>
                    <div>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <p> Active Data </p>
                            <Droppable droppableId="active-data">
                                {(provided, snapshot) => (
                                    <div {...provided.droppableProps}
                                         ref={provided.innerRef}>
                                        <Box sx={{
                                            border: 2,
                                            display: "flex column",
                                            padding: 1,
                                            color: "lightgrey",
                                            background: snapshot.isDraggingOver ? 'lightblue' : 'white',
                                        }}>
                                            {activeData.map((dataset, index) => (
                                                <Draggable key={dataset.name} draggableId={dataset.name} index={index}>
                                                    {(provided) => (
                                                        <div {...provided.draggableProps}
                                                             ref={provided.innerRef}
                                                             {...provided.dragHandleProps}>
                                                            <Button
                                                                sx={{gap: 1}}
                                                                className={styles.datasetButton}
                                                                style={{backgroundColor: dataset.color}}
                                                                onClick={() => handleSelectedDatasetNameChange(dataset.name)}
                                                                disabled={selectedDatasetNames.includes(dataset.name)}
                                                            >
                                                                {dataset.name}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    </div>
                                )}
                            </Droppable>
                            <p> Data Library </p>
                            <Droppable droppableId="data-library">
                                {(provided, snapshot) => (
                                    <div {...provided.droppableProps}
                                         ref={provided.innerRef}>
                                        <Box sx={{
                                            border: 2,
                                            display: "flex column",
                                            padding: 1,
                                            color: "lightgrey",
                                            background: snapshot.isDraggingOver ? 'lightblue' : 'white',
                                        }}>
                                            {dataLibrary.map((dataset, index) => (
                                                <Draggable key={dataset.name} draggableId={dataset.name} index={index}>
                                                    {(provided) => (
                                                        <div {...provided.draggableProps}
                                                             ref={provided.innerRef}
                                                             {...provided.dragHandleProps}>
                                                            <Button
                                                                sx={{gap: 1}}
                                                                className={styles.datasetButton}
                                                                style={{backgroundColor: dataset.color}}
                                                                onClick={() => handleSelectedDatasetNameChange(dataset.name)}
                                                                disabled={selectedDatasetNames.includes(dataset.name)}
                                                            >
                                                                {dataset.name}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </Box>
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </FormControl>
            </div>
            <div className={styles["data-content-line"]}>
                <p>X-axis</p>
                <FormControl variant="standard" fullWidth>
                    <InputLabel id="x-axis-select-label">{query1}</InputLabel>
                    <Select
                        labelId="x-axis-select-label"
                        id="x-axis-select"
                        value={query1}
                        onChange={handleQuery1Change}
                        input={<BootstrapInput/>}
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
    )
        ;
};

export default Hist_DataSelector;
