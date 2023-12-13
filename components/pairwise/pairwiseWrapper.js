import React, {useRef, useState, useEffect} from "react";
import Pairwise from "@/charts/pairwise";
import {useRouter} from "next/router";


const PairwiseWrapper = ({data, element, setDataPoint, setSelectedData, max_num_datasets}) => {
    const pairwiseContainer = useRef(null);
    const legendContainer = useRef(null);
    const [chart, setChart] = useState(null);
    const router = useRouter();

    console.log('pairwise wrapper', data)

    useEffect(() => {
        if (!chart) {
            setChart(new Pairwise(data,
                pairwiseContainer,
                legendContainer.current));
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
                }, pairwiseContainer,
                legendContainer.current,
                setDataPoint,
                router,
                max_num_datasets);
        }
    }, [data]);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div id="main-plot" ref={pairwiseContainer}
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
export default PairwiseWrapper;
