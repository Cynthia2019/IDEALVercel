import React, {useRef, useState, useEffect} from "react";
import Hist from "./hist";
import {useRouter} from "next/router";

const HistWrapper = ({data, element, setDataPoint, setSelectedData, query1, max_num_datasets}) => {
    const histContainer = useRef(null);
    const legendContainer = useRef(null);
    const [chart, setChart] = useState(null);

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
                max_num_datasets
            );

        }
    }, [data, query1]);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div id="main-plot" ref={histContainer}
                 style={{display: "flex", flexDirection: "column"}}
            ></div>
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
