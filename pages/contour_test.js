import { useState, useEffect, useMemo } from "react";
import Header from "@/components/shared/header";
import styles from "@/styles/Home.module.css";
import ContourWrapper_test from "../components/contour/countourWrapper_test";
import StructureWrapper from "../components/structureWrapper";
import { csvParse } from "d3";
import dynamic from "next/dynamic";
import DataSelector from "@/components/shared/dataSelector";
import RangeSelector from "@/components/shared/rangeSelector";
import MaterialInformation from "../components/shared/materialInfo";
import { Row } from "antd";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./api/aws";
import { colorAssignment, MAX_DATA_POINTS_NUM } from "@/util/constants";
import processData from "../util/processData";
import { useRouter } from "next/router";
import Head from "next/head";
import { fetchNames } from "@/components/fetchNames";

export default function Contour_test({ fetchedNames }) {
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

    // record the loading state of data
    const [dataLoadingStates, setDataLoadingStates] = useState([]);

    //record the whole dataset
    const [completeData, setCompleteData] = useState([])
    const [maxDataPointsPerDataset, setMaxDataPointsPerDataset] = useState(999999);

    const router = useRouter();
    const { pairwise_query1, pairwise_query2 } = router.query;

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
            let filtered = d[name] >= value[0] && d[name] <= value[1];
            return filtered;
        });
        // remove filtered out data from active data and add to data library
        let sourceItems = dataLibrary;
        let destItems = filtered_datasets;
        const unselected = activeData.filter(
            (d) => !filtered_datasets.includes(d)
        );

        sourceItems = sourceItems.concat(unselected);
        setActiveData(destItems);
        setDataLibrary(sourceItems);
    };

    async function fetchDataFromAWS(info, index) {
        const command = new GetObjectCommand({
            Bucket: "ideal-dataset-1",
            Key: info.name,
            cacheControl: "no-cache",
        });

        await s3Client.send(command).then((res) => {
            let body = res.Body.transformToByteArray();
            body.then((stream) => {
                new Response(stream, {
                    headers: { "Content-Type": "text/csv" },
                })
                    .text()
                    .then((data) => {
                        let parsed = csvParse(data);

                        let processedData = parsed.map((dataset, i) => {
                            return processData(dataset, i);
                        });
                        processedData.map((p) => (p.name = info.name));
                        processedData.map(
                            (p) => (p.color = colorAssignment[index])
                        );
                        setCompleteData((prev) => [...prev, {
                            name: info.name,
                            data: processedData
                        }])
                        processedData = processedData.slice(
                            0,
                            maxDataPointsPerDataset
                        );
                        setDatasets((prev) => [...prev, ...processedData]);
                        setDataPoint(processedData[0]);
                        setActiveData((prev) => [...prev, ...processedData]);
                        setDataLoadingStates((prev) =>
                            prev.map((obj) =>
                                obj.name === info.name
                                    ? { ...obj, loading: false }
                                    : obj
                            )
                        );
                    });
            });
        });
    }
    const fetchDataNames = async () => {
        const fetchedNames = (await fetchNames()).fetchedNames;
        setAvailableDatasetNames(fetchedNames);
        setDataLoadingStates(
            fetchedNames.map((info) => ({
                ...info,
                loading: true,
            }))
        );
        setMaxDataPointsPerDataset(
            Math.ceil(
                9999999 /
                (fetchedNames.length === 0 ? 1 : fetchedNames.length)
            )
        );
    };

    useEffect(() => {
        fetchDataNames();
    }, []);

    useEffect(() => {
        dataLoadingStates.map((info, i) => fetchDataFromAWS(info, i));
    }, [maxDataPointsPerDataset]);

    const [open, setOpen] = useState(true);

    return (
        <div>
            <Head>
                <title>Metamaterials Data Explorer</title>
            </Head>
            <Header />
            <div className={styles.body}>
                <Row className={styles.firstScreen}>
                    <div className={styles.mainPlot}>
                        <div className={styles.mainPlotHeader}>
                            <p className={styles.mainPlotTitle}>
                                Material Data Explorer (Individual Contour Plot)
                            </p>
                            <p className={styles.mainPlotSub}>
                                Hover over contour plot to bring it to front. Scroll to zoom.
                            </p>
                        </div>
                        <ContourWrapper_test
                            data={activeData}
                            completeData={completeData}
                            maxDataPointsPerDataset={maxDataPointsPerDataset}
                            setDataPoint={setDataPoint}
                            query1={query1}
                            query2={query2}
                            selectedData={selectedData}
                            setSelectedData={setSelectedData}
                            setActiveData={setActiveData}
                            setNeighbors={setNeighbors}
                            reset={reset}
                            setReset={setReset}
                            datasets={datasets}
                            neighbors={neighbors}
                            max_num_datasets={availableDatasetNames.length}
                        />
                    </div>
                    <div
                        className={`${
                            open ? styles.selectors : styles.selectorsClosed
                        }`}
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
                            page={"contour_test"}
                            setDatasets={setDatasets}
                            availableDatasetNames={availableDatasetNames}
                            setAvailableDatasetNames={setAvailableDatasetNames}
                            dataLoadingStates={dataLoadingStates}
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
            </div>
        </div>
    );
}
