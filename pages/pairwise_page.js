import {useState, useEffect, useMemo} from "react";
import Header from "../components/header";
import styles from "../styles/Home.module.css";
import StructureWrapper from "../components/structureWrapper";
import {csv, csvParse} from "d3";
import dynamic from "next/dynamic";
import Pairwise_DataSelector from "../components/pairwise_dataSelector";
// import DataSelector from "@/components/dataSelector";
import RangeSelector from "../components/rangeSelector";
import MaterialInformation from "../components/materialInfo";
import {Row, Col} from "antd";
import PairwiseWrapper from "../components/pairwiseWrapper";
import {GetObjectCommand, ListObjectsCommand} from "@aws-sdk/client-s3";
import s3Client from './api/aws'
import {colorAssignment, s3BucketList} from '@/util/constants'
import processData from "../util/processData";

const regex = /[-+]?[0-9]*\.?[0-9]+([eE]?[-+]?[0-9]+)/g;

export default function Pairwise_page({fetchedNames}) {
    const [datasets, setDatasets] = useState([]);
    const [availableDatasetNames, setAvailableDatasetNames] = useState(fetchedNames);
    const [activeData, setActiveData] = useState(datasets);
    const [dataLibrary, setDataLibrary] = useState([])
    const [filteredDatasets, setFilteredDatasets] = useState([]);
    const [dataPoint, setDataPoint] = useState({});
    const [selectedDatasetNames, setSelectedDatasetNames] = useState([]);
    const [selectedData, setSelectedData] = useState([])

    const [query1, setQuery1] = useState("C11");
    const [query2, setQuery2] = useState("C12");

    const Youngs = dynamic(() => import("../components/youngs"), {
        ssr: false,
    });

    const Poisson = dynamic(() => import("../components/poisson"), {
        ssr: false,
    });

    const handleSelectedDatasetNameChange = (e) => {
        const {
          target: { value },
        } = e;
        setSelectedDatasetNames(value);
        let newDatasets = datasets.filter((s) =>
          value
            .map((v) => JSON.parse(v))
            .map((v) => v.name)
            .includes(s.name)
        );
        setFilteredDatasets(newDatasets);
      };

    const handleRangeChange = (name, value) => {
        let filtered_datasets = datasets.map((set, i) => {
          let filtered = set.data.filter(
            (d) => d[name] >= value[0] && d[name] <= value[1]
          );
          return { name: set.name, data: filtered, color: set.color };
        });
        filtered_datasets = filtered_datasets.filter((s) => {
         let names = selectedDatasetNames.map(v => JSON.parse(v)).map((v) => v.name)
         return names.includes(s.name)
        }
        );
        setFilteredDatasets(filtered_datasets);
        setActiveData(filtered_datasets);

    };

    useEffect(() => {
        async function fetchData(info) {
            const command = new GetObjectCommand({
                Bucket: info.bucket_name,
                Key: info.name,
            })

            await s3Client.send(command).then((res) => {
                let body = res.Body.transformToByteArray();
                body.then((stream) => {
                    new Response(stream, { headers: { "Content-Type": "text/csv" } })
                        .text()
                        .then((data) => {
                            let parsed = csvParse(data)
                            const processedData = processData(parsed.slice(0, 5000))
                            setDatasets((datasets) => [
                                ...datasets,
                                {
                                    name: info.name,
                                    data: processedData,
                                    color: info.color,
                                },
                            ]);
                            setFilteredDatasets((datasets) => [
                                ...datasets,
                                {
                                    name: info.name,
                                    data: processedData,
                                    color: info.color,
                                },
                            ]);
                            setSelectedDatasetNames((datasets) => [
                                ...datasets,
                                JSON.stringify({ name: info.name, color: info.color }),
                            ]);
                            setActiveData((datasets) => [
                                ...datasets,
                                {
                                    name: info.name,
                                    data: processedData,
                                    color: info.color,
                                },
                            ]);
                            setDataPoint(processedData[0]);
                        });
                });
            });
        }

        availableDatasetNames.map((info, i) => fetchData(info))
    }, []);

    return (
        <div>
            <Header/>
            <div className={styles.body}>
                <Row>
                    <div className={styles.mainPlot}>
                        <div className={styles.mainPlotHeader}>
                            <p className={styles.mainPlotTitle}>Material Data Explorer (Pairwise)</p>
                            {/*<p className={styles.mainPlotSub}>*/}
                            {/*    Select properties from the dropdown menus below to graph on the*/}
                            {/*    x and y axes. Hovering over data points provides additional*/}
                            {/*    information. Scroll to zoom, click and drag to pan, and*/}
                            {/*    double-click to reset.*/}
                            {/*</p>*/}
                        </div>
                        <PairwiseWrapper
                            data={activeData}
                            setDataPoint={setDataPoint}
                            setSelectedData={setSelectedData}
                        />
                    </div>
                    <div className={styles.subPlots}>
                        <StructureWrapper data={dataPoint}/>
                        <Youngs dataPoint={dataPoint}/>
                        <Poisson dataPoint={dataPoint}/>
                    </div>
                    <div className={styles.selectors}>
                        <Pairwise_DataSelector
                            setDatasets={setDatasets}
                            selectedDatasetNames={selectedDatasetNames}
                            handleSelectedDatasetNameChange={handleSelectedDatasetNameChange}
                            availableDatasetNames={availableDatasetNames}
                            setAvailableDatasetNames={setAvailableDatasetNames}
                            activeData={activeData}
                            dataLibrary={dataLibrary}
                            setActiveData={setActiveData}
                            setDataLibrary={setDataLibrary}
                        />
                        <RangeSelector
                            datasets={datasets}
                            filteredDatasets={filteredDatasets}
                            handleChange={handleRangeChange}
                        />
                        <MaterialInformation dataPoint={dataPoint}/>

                    </div>
                </Row>
            </div>
        </div>
    );
}

export async function getStaticProps() {
    let fetchedNames = []
    const listObjectCommand = new ListObjectsCommand({
        Bucket: 'ideal-dataset-1'
    })
    await s3Client.send(listObjectCommand).then((res) => {
        const names = res.Contents.map(content => content.Key)
        for (let i = 0; i < names.length; i++) {
            fetchedNames.push({
                bucket_name: 'ideal-dataset-1',
                name: names[i],
                color: colorAssignment[i]
            })
        }
    })
    console.log("fetching")
    return {
        props: {
            fetchedNames: fetchedNames
        }
    }
}