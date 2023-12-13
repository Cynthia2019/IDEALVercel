import React, {useRef, useState, useEffect} from "react";
import Contour from "@/charts/contour-pairwise";
import {useRouter} from "next/router";

const ContourPairwiseWrapper = ({data, element, setDataPoint, setSelectedData, max_num_datasets}) => {
    const contourContainer = useRef(null);
    const legendContainer = useRef(null);
    const [chart, setChart] = useState(null);
    const router = useRouter();


    useEffect(() => {
        if (!chart) {
            setChart(new Contour(data,
                contourContainer,
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
                }, contourContainer,
                legendContainer.current,
                setDataPoint,
                router,
                max_num_datasets);
        }
    }, [data]);

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <div id="main-plot" ref={contourContainer}
                 style={{display: "flex", flexDirection: "column"}}
            ></div>

        </div>

    );
};
export default ContourPairwiseWrapper;
