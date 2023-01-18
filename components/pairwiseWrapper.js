import React, {useRef, useState, useEffect} from "react";
import Pairwise_d3 from "./pairwise_d3";

const PairwiseWrapper = ({data, element, setDataPoint, setSelectedData}) => {
    const pairwiseContainer = useRef(null);
    const legendContainer = useRef(null);
    const [chart, setChart] = useState(null);

    useEffect(() => {
        if (!chart) {
            setChart(new Pairwise_d3(data, pairwiseContainer, legendContainer.current));
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
                setDataPoint);

        }
    }, [data]);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div id="main-plot" ref={pairwiseContainer}
                 style={{display: "flex", flexDirection: "column"}}
            ></div>
            <div
                id="main-plot-legend"
                style={{display: "flex", flexDirection: "column"}}
                ref={legendContainer}
            >

            </div>

        </div>

    );
};
export default PairwiseWrapper;
