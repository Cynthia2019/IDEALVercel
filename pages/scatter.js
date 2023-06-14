import {useState, useEffect, useMemo} from "react";
import Header from "@/components/shared/header";
import styles from "@/styles/Home.module.css";
import ScatterWrapper from "../components/scatter/scatterWrapper";
import StructureWrapper from "../components/structureWrapper";
import {csv, csvParse} from "d3";
import dynamic from "next/dynamic";
import DataSelector from "@/components/shared/dataSelector";
import RangeSelector from "@/components/shared/rangeSelector";
import MaterialInformation from "../components/shared/materialInfo";
import SavePanel from "@/components/saveData/savePanel";
import NeighborPanel from "@/components/knn/neighborPanel";
import {Row, Col} from "antd";
import {GetObjectCommand, ListObjectsCommand} from "@aws-sdk/client-s3";
import s3Client from "./api/aws";
import {colorAssignment} from "@/util/constants";
import processData from "../util/processData";
import {useRouter} from "next/router";
import classNames from "classnames";

const merge = (first, second) => {
    for (let i = 0; i < second.length; i++) {
        for (let j = 0; j < second[i].data.length; j++) {
            first.push(second[i].data[j]);
        }
    }
    return first;
};

export default function Scatter({fetchedNames}) {
    const [datasets, setDatasets] = useState([]);

    const [availableDatasetNames, setAvailableDatasetNames] = useState(
        fetchedNames || []
    );
    const [activeData, setActiveData] = useState(datasets);
    const [dataLibrary, setDataLibrary] = useState([]);
    const [dataPoint, setDataPoint] = useState({});
    const [selectedData, setSelectedData] = useState([]);
    const [neighbors, setNeighbors] = useState([]);
    const [reset, setReset] = useState(false);

    const router = useRouter();
    const {pairwise_query1, pairwise_query2} = router.query;

    const [query1, setQuery1] = useState(
        pairwise_query1 ? pairwise_query1 : "C11"
    );
    const [query2, setQuery2] = useState(
        pairwise_query2 ? pairwise_query2 : "C12"
    );

    const Youngs = dynamic(() => import("../components/youngs"), {
        ssr: false,
    });

    const Poisson = dynamic(() => import("../components/poisson"), {
        ssr: false,
    });

    const handleQuery1Change = (e) => {
        setQuery1(e.target.value);
    };

    const handleQuery2Change = (e) => {
        setQuery2(e.target.value);
    };

    const handleRangeChange = (name, value) => {
        let filtered_datasets = datasets.filter((d, i) => {
            console.log(`name: ${name}, value: ${value}`);
            let filtered = d[name] >= value[0] && d[name] <= value[1];
            return filtered;
        });
        setActiveData(filtered_datasets);
    };

    async function getAllData() {
        const env = process.env.NODE_ENV;
        let url = "https://metamaterials-srv.northwestern.edu./model/";
        // let url= 'http://localhost:8000/model?data='
        if (env == "production") {
            url = "https://metamaterials-srv.northwestern.edu./model/";
        }
        let response = await fetch(`${url}`, {
            method: "POST",
            mode: "cors",
        })
            .then((res) => {
                console.log(res);
                return res.json();
            })
            .catch((err) => console.log("scatter get all data err", err));
        return response;
    }

    useEffect(() => {
        async function fetchData(info, index) {
            const command = new GetObjectCommand({
                Bucket: 'ideal-dataset-1',
                Key: info.name,
                cacheControl: "no-cache",
            });
            console.log("scatter fetching data s3 response", command);
            await s3Client.send(command).then((res) => {
                let body = res.Body.transformToByteArray();
                body.then((stream) => {
                    new Response(stream, {
                        headers: {"Content-Type": "text/csv"},
                    })
                        .text()
                        .then((data) => {
                            let parsed = csvParse(data);

                            let processedData = parsed.map((dataset, i) => {
                                return processData(dataset, i);
                            });
                            processedData.map(
                                (p) =>
                                    (p.name = availableDatasetNames[index].name)
                            );
                            processedData.map(
                                (p) => (p.color = colorAssignment[index])
                            );
                            setDatasets((prev) => [...prev, ...processedData]);
                            setDataPoint(processedData[0]);
                            setActiveData((prev) => [
                                ...prev,
                                ...processedData,
                            ]);
                        });
                });
            });
        }

        try {
            getAllData().then((res) => {
                if (!res) {
                    availableDatasetNames.map((info, i) => fetchData(info, i));
                    return;
                }
                res = JSON.parse(res);
                const processedData = res.map((datapoint, i) => {
                    return processData(datapoint, i);
                });
                setDatasets(processedData);
                setDataPoint(processedData[0]);
                setActiveData(processedData);
                const newAvailableDatasetNames = processedData
                    .map((item) => item.name)
                    .filter(
                        (name, index, currentVal) =>
                            currentVal.indexOf(name) === index
                    );
                const colors = processedData
                    .map((item) => item.color)
                    .filter(
                        (color, index, currentVal) =>
                            currentVal.indexOf(color) === index
                    );
                setAvailableDatasetNames(newAvailableDatasetNames.map((name, i) => {

                    return {
                        bucket_name: "ideal-dataset-1",
                        name: name,
                        color: colors[i]
                    }
                }));
            });
        } catch (err) {
            console.log("unexpected error");
        }
    }, [availableDatasetNames.length]);

    const [open, setOpen] = useState(true);

    return (
        <div>
            <Header/>
            <div className={styles.body}>
                <Row className={styles.firstScreen}>
                    <div className={styles.mainPlot}>
                        <div className={styles.mainPlotHeader}>
                            <p className={styles.mainPlotTitle}>
                                Material Data Explorer (Individual Scatter Plot)
                            </p>
                            <p className={styles.mainPlotSub}>
                                Select properties from the dropdown menus to
                                graph. Hover over data
                                points for additional information. Scroll
                                to zoom, click and drag to pan.
                            </p>
                        </div>
                        <ScatterWrapper
                            data={activeData}
                            setDataPoint={setDataPoint}
                            query1={query1}
                            query2={query2}
                            selectedData={selectedData}
                            setSelectedData={setSelectedData}
                            setNeighbors={setNeighbors}
                            reset={reset}
                            setReset={setReset}
                        />
                    </div>
                    <div className={styles.subPlots}>
                        <StructureWrapper data={dataPoint}/>
                        <Youngs dataPoint={dataPoint}/>
                        <Poisson dataPoint={dataPoint}/>
                    </div>
                    <div
                        className={`${
                            open ? styles.selectors : styles.selectorsClosed
                        }`}
                        // onMouseEnter={onMouseOver}
                        // onMouseLeave={onMouseOver}
                        // style={{ transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
                    >
                        <img
                            src="/control.png"
                            className={`cursor-pointer -right-3 top-9 w-7 border-dark-purple
                m-4
           border-2 rounded-full  ${open && "rotate-180"}`}
                            onClick={() => setOpen(!open)}
                            alt="control"
                        />

                        <DataSelector
                            page={"scatter"}
                            setDatasets={setDatasets}
                            availableDatasetNames={availableDatasetNames}
                            setAvailableDatasetNames={setAvailableDatasetNames}
                            query1={query1}
                            handleQuery1Change={handleQuery1Change}
                            query2={query2}
                            handleQuery2Change={handleQuery2Change}
                            activeData={activeData}
                            dataLibrary={dataLibrary}
                            setActiveData={setActiveData}
                            setDataLibrary={setDataLibrary}
                            open={open}
                        />
                        <RangeSelector
                            datasets={datasets}
                            activeData={activeData}
                            handleChange={handleRangeChange}
                            open={open}
                        />
                        <MaterialInformation
                            dataPoint={dataPoint}
                            open={open}
                        />
                    </div>
                </Row>
                <Row style={{width: '60%'}}>
                    <NeighborPanel neighbors={neighbors}/>
                </Row>
                <Row style={{width: '60%'}}>
                    <SavePanel
                        selectedData={selectedData}
                        setReset={setReset}
                    />
                </Row>
            </div>
        </div>
    );
}

