import {useRef, useState, useEffect} from "react";
import * as React from "react";
import Hist from "./hist";
import Switch from '@material-ui/core/Switch';
import { useN01SwitchStyles } from '@mui-treasury/styles/switch/n01';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const HistWrapper = ({data, element, setDataPoint, setSelectedData, query1, max_num_datasets}) => {
    const histContainer = useRef(null);
    const legendContainer = useRef(null);
    const [chart, setChart] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [toggled, setToggled] = React.useState(false);
    const switchStyles = useN01SwitchStyles();

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
                setTooltip,
                toggled
            );

        }
    }, [data, query1, toggled]);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div id="main-plot" ref={histContainer}
                 style={{display: "flex", flexDirection: "column"}}

            >
                <Stack direction="row" spacing={0} fontSize={4} alignItems="center">
                    <Typography>10^6</Typography>
                    <Switch
                        checked={toggled}
                        onChange={e => setToggled(e.target.checked)}
                    />
                    <Typography>10^9</Typography>
                </Stack>
            </div>

        </div>

    );
};
export default HistWrapper;
