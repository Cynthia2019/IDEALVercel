import {useState} from "react";
import styles from "../styles/dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Checkbox from '@mui/material/Checkbox';
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
import * as d3 from "d3";
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


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

    let tooltip_data = d3
        .select(this)
        .append("div")
        .attr("class", "tooltip_hist")
        .style("position", "fixed")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("visibility", "hidden")

    let mouseover_data = function (e, d) {
        console.log("data");
        tooltip_data.style("visibility", "visible").transition().duration(200);

    };

    let mouseleave_data = function (e, d) {
        tooltip_data.style("visibility", "hidden").transition().duration(200);
    };

    let mousemove_data = function (e, d) {
        console.log('data tool tip')
        console.log(e)
        console.log(d)
        // let column = columns[parseInt(d)]
        //let temp_arr = [...finalData.map(data => data[columns[index]])]
        tooltip_data
            .html(
                "<br>Data: "
                // (d.x0) +
                // " to " +
                // (d.x1) +
                // "<br>Distribution Mean: " +
                // d3.mean(temp_arr) +
                // "<br>Distribution Median: " +
                // d3.median(temp_arr)

            )
            .style("top", e.pageY - 110 + "px")
            .style("left", e.pageX + 10 + "px");
    };

    // const onDragEnd = result => {
    //     // logic to handle the end of a drag event
    //     if (!result.destination) return;
    //     const {source, destination} = result;
    //     if (source.droppableId !== destination.droppableId) {
    //         const sourceData = source.droppableId === "active-data" ? activeData : dataLibrary
    //         const destinationData = destination.droppableId === "data-library" ? dataLibrary : activeData
    //         const sourceItems = Array.from(sourceData);
    //         const destItems = Array.from(destinationData);
    //         const [removed] = sourceItems.splice(source.index, 1);
    //         destItems.splice(destination.index, 0, removed)
    //         sourceData == activeData ? setActiveData(sourceItems) : setDataLibrary(sourceItems);
    //         destinationData == activeData ? setActiveData(destItems) : setDataLibrary(destItems);
    //
    //     } else {
    //         const sourceData = source.droppableId === "active-data" ? activeData : dataLibrary
    //         const sourceItems = Array.from(sourceData);
    //         const [removed] = sourceItems.splice(result.source.index, 1);
    //         sourceItems.splice(result.destination.index, 0, removed)
    //         sourceData == activeData ? setActiveData(sourceItems) : setDataLibrary(sourceItems);
    //     }
    //
    // };


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
                        <TableContainer component={Paper} sx={{maxHeight: 300, minWidth: 200}}>
                            <Table stickyHeader aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell >Select</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {availableDatasetNames.map((dataset, index) => (
                                        <TableRow
                                            key={dataset.name}
                                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                        >
                                            <TableCell component="th" scope="row">
                                                {dataset.name}
                                            </TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    defaultChecked
                                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                                />
                                            </TableCell>
                                        </TableRow>

                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/*<DragDropContext onDragEnd={onDragEnd}>*/}
                        {/*    <p> Active Data </p>*/}
                        {/*    <Droppable droppableId="active-data">*/}
                        {/*        {(provided, snapshot) => (*/}
                        {/*            <div {...provided.droppableProps}*/}
                        {/*                 ref={provided.innerRef}>*/}
                        {/*                <Box sx={{*/}
                        {/*                    border: 2,*/}
                        {/*                    display: "flex column",*/}
                        {/*                    padding: 1,*/}
                        {/*                    color: "lightgrey",*/}
                        {/*                    background: snapshot.isDraggingOver ? 'lightblue' : 'white',*/}
                        {/*                }}>*/}
                        {/*                    {activeData.map((dataset, index) => (*/}
                        {/*                        <Draggable key={dataset.name} draggableId={dataset.name} index={index}>*/}
                        {/*                            {(provided) => (*/}
                        {/*                                <div {...provided.draggableProps}*/}
                        {/*                                     ref={provided.innerRef}*/}
                        {/*                                     {...provided.dragHandleProps}>*/}
                        {/*                                    <Button*/}
                        {/*                                        sx={{gap: 1}}*/}
                        {/*                                        className={styles.datasetButton}*/}
                        {/*                                        style={{backgroundColor: dataset.color}}*/}
                        {/*                                        disabled={selectedDatasetNames.includes(dataset.name)}*/}
                        {/*                                        onMouseOver={mouseover_data}*/}
                        {/*                                        onMouseLeave={mouseleave_data}*/}
                        {/*                                        onMouseMove={mousemove_data}*/}
                        {/*                                    >*/}
                        {/*                                        {dataset.name}*/}
                        {/*                                    </Button>*/}
                        {/*                                </div>*/}
                        {/*                            )}*/}
                        {/*                        </Draggable>*/}
                        {/*                    ))}*/}
                        {/*                    {provided.placeholder}*/}
                        {/*                </Box>*/}
                        {/*            </div>*/}
                        {/*        )}*/}
                        {/*    </Droppable>*/}
                        {/*    <p> Inactive Data Library</p>*/}
                        {/*    <Droppable droppableId="data-library">*/}
                        {/*        {(provided, snapshot) => (*/}
                        {/*            <div {...provided.droppableProps}*/}
                        {/*                 ref={provided.innerRef}>*/}
                        {/*                <Box sx={{*/}
                        {/*                    border: 2,*/}
                        {/*                    display: "flex column",*/}
                        {/*                    padding: 1,*/}
                        {/*                    color: "lightgrey",*/}
                        {/*                    background: snapshot.isDraggingOver ? 'lightblue' : 'white',*/}
                        {/*                }}>*/}
                        {/*                    {dataLibrary.map((dataset, index) => (*/}
                        {/*                        <Draggable key={dataset.name} draggableId={dataset.name} index={index}>*/}
                        {/*                            {(provided) => (*/}
                        {/*                                <div {...provided.draggableProps}*/}
                        {/*                                     ref={provided.innerRef}*/}
                        {/*                                     {...provided.dragHandleProps}>*/}
                        {/*                                    <Button*/}
                        {/*                                        sx={{gap: 1}}*/}
                        {/*                                        className={styles.datasetButton}*/}
                        {/*                                        style={{backgroundColor: dataset.color}}*/}
                        {/*                                        onClick={() => handleSelectedDatasetNameChange(dataset.name)}*/}
                        {/*                                        disabled={selectedDatasetNames.includes(dataset.name)}*/}
                        {/*                                    >*/}
                        {/*                                        {dataset.name}*/}
                        {/*                                    </Button>*/}
                        {/*                                </div>*/}
                        {/*                            )}*/}
                        {/*                        </Draggable>*/}
                        {/*                    ))}*/}
                        {/*                    {provided.placeholder}*/}
                        {/*                </Box>*/}
                        {/*            </div>*/}
                        {/*        )}*/}
                        {/*    </Droppable>*/}
                        {/*</DragDropContext>*/}
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
