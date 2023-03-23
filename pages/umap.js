import Umap from '../components/umap';
import * as d3 from 'd3';
import React, {useRef, useState, useEffect} from "react";
import {csvParse} from "d3";

export default function Umap_page() {
    const container = useRef(null);
    const [datasets, setDatasets] = useState([]);

    const datasetLinks = [
        {
            name: "free form 2D",
            src: "https://gist.githubusercontent.com/GeorgeBian/f396f0348142da51873d863db3235fe7/raw/1fc86428bafe7e2393f23950e41efbd94a08aaae/umap_freeform.csv",
            color: "#8A8BD0",
        },
        {
            name: "lattice 2D",
            src: "https://gist.githubusercontent.com/GeorgeBian/874879e4921fbffde4d8c41887c20a0e/raw/b66d00a74cfd620892c1ccfebc8274b004c82863/umap_lattice.csv",
            color: "#FFB347",
        },
    ];


    useEffect(() => {
        if (datasets.length == 2) {
            new Umap(container.current, datasets);
        } else {
            datasetLinks.map((d, i) => {
                d3.csv(d.src).then((data) => {
                    const processedData = data.map((d) => {
                        let processed = {
                            x: parseFloat(d.x),
                            y: parseFloat(d.y),
                        };
                        return processed;
                    });
                    setDatasets((datasets) => [
                        ...datasets,
                        {
                            name: d.name,
                            data: processedData,
                            color: d.color,
                        },
                    ]);
                });
            });
        }

    }, [datasets]);

    return (
        <div>
            <h1>UMAP Reudction Dimension</h1>
            <div id="main-plot" ref={container}></div>
        </div>
    );
}