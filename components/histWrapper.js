import {useRef, useState, useEffect} from "react";
import * as React from "react";
import Hist from "./hist";
import {useRouter} from "next/router";
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {FixedSizeList} from 'react-window';
import * as d3 from "d3";

const HistWrapper = ({data, element, setDataPoint, setSelectedData, query1, max_num_datasets}) => {
    const histContainer = useRef(null);
    const legendContainer = useRef(null);
    const [chart, setChart] = useState(null);
    const [tooltip, setTooltip] = useState(null);

    useEffect(() => {
        if (!chart) {
            setChart(new Hist(data, histContainer, legendContainer.current));
        } else {
            chart.update(data, {
                    columns: [
                        "C11",
                        "C12",
                        "C22",
                        "C16",
                        "C26",
                        "C66"
                    ]
                }, histContainer,
                legendContainer.current,
                setDataPoint,
                query1,
                max_num_datasets,
                setTooltip
            );

        }
    }, [data, query1]);
    // data.map((data, i) => {
    //     let temp_tooltip = {}
    //     if (data) {
    //         let temp_arr = data.data.map((d, i) => d[query1])
    //         // temp_tooltip["max"] = d3.max(temp_arr)
    //         // temp_tooltip["min"] = d3.min(temp_arr)
    //         temp_tooltip["name"] = data.name
    //         temp_tooltip["color"] = data.color
    //         temp_tooltip["range"] = d3.extent(temp_arr)
    //         temp_tooltip["mean"] = d3.mean(temp_arr)
    //         temp_tooltip["median"] = d3.median(temp_arr)
    //
    //     }
    //     wrapper_tooltip.push(temp_tooltip)
    // });
    //
    // console.log("hist wrapper");
    // console.log(wrapper_tooltip);
    // function renderRow(tooltip) {
    //     const { name, color, median, mean, range } = tooltip;
    //

    // }
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div id="main-plot" ref={histContainer}
                 style={{display: "flex", flexDirection: "column"}}
            ></div>

            {/*<div*/}
            {/*    style={{display: "flex", flexDirection: "column"}}>*/}
            {/*    <Box*/}
            {/*        sx={{width: '100%', height: 400, maxWidth: 360, bgcolor: 'background.paper'}}*/}
            {/*    >*/}
            {/*        <FixedSizeList*/}
            {/*            height={400}*/}
            {/*            width={360}*/}
            {/*            itemSize={46}*/}
            {/*            itemCount={200}*/}
            {/*            overscanCount={5}*/}
            {/*        >*/}
            {/*            /!*{wrapper_tooltip.map((d, i) => (*!/*/}
            {/*            /!*    <ListItem key={i} component="div" disablePadding>*!/*/}
            {/*            /!*        <ListItemButton>*!/*/}
            {/*            /!*            <ListItemText primary={`Item ${d.name}`}/>*!/*/}
            {/*            /!*        </ListItemButton>*!/*/}
            {/*            /!*    </ListItem>*!/*/}
            {/*            /!*))}*!/*/}
            {/*            sup*/}
            {/*        </FixedSizeList>*/}
            {/*    </Box>*/}
            {/*</div>*/}
            {/*<div*/}
            {/*    id="main-plot-legend"*/}
            {/*    style={{display: "flex", flexDirection: "column"}}*/}
            {/*    ref={legendContainer}*/}
            {/*>*/}

            {/*</div>*/}

        </div>

    );
};
export default HistWrapper;
