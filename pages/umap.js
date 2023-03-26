import { useState, useEffect, useMemo } from "react";
import Header from "../components/shared/header";
import styles from "../styles/Home.module.css";
import UmapWrapper from "../components/umap/umapWrapper";
import StructureWrapper from "../components/structureWrapper";
import { csv, csvParse } from "d3";
import dynamic from "next/dynamic";
// import Umap_DataSelector from "../components/umap_dataSelector";
import DataSelector from "@/components/shared/dataSelector";
import RangeSelector from "../components/shared/rangeSelector";
import MaterialInformation from "../components/shared/materialInfo";
import SavePanel from "@/components/saveData/savePanel";
import { Row, Col } from "antd";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from './api/aws'
import { s3BucketList, colorAssignment } from '@/util/constants'
import processData from "../util/processData";
import { useRouter } from 'next/router';


export default function Umap({fetchedNames}) {
    const [datasets, setDatasets] = useState([]);
    const [availableDatasetNames, setAvailableDatasetNames] = useState(fetchedNames);
    const [activeData, setActiveData] = useState(datasets);
    const [dataLibrary, setDataLibrary] = useState([])
    const [filteredDatasets, setFilteredDatasets] = useState([]);
    const [dataPoint, setDataPoint] = useState({});
    const [selectedDatasetNames, setSelectedDatasetNames] = useState([]);
    const [selectedData, setSelectedData] = useState([]);
    const [reset, setReset] = useState(false);

    const router = useRouter();
    const {pairwise_query1, pairwise_query2} = router.query;

    const [query1, setQuery1] = useState(pairwise_query1 ? pairwise_query1 : "C11");
    const [query2, setQuery2] = useState(pairwise_query2 ? pairwise_query2 : "C12");


    const handleQuery1Change = (e) => {
        setQuery1(e.target.value);
    };

    const handleQuery2Change = (e) => {
        setQuery2(e.target.value);
    };

    async function getAllData() {
        const env = process.env.NODE_ENV;
        let url = "http://localhost:8000/model/";
        if (env == "production") {
         // url = "http://localhost:8000/model/";
          //   url = "https://ideal-server-espy0exsw-cynthia2019.vercel.app/model/";
        }
        let response = await fetch(`${url}`, {
          method: "POST",
          mode: "cors",
        })
          .then((res) => res.json())
          .catch((err) => console.log(err));
        return response;
      }
    
      useEffect(() => {
        async function fetchData(info, index) {
          const command = new GetObjectCommand({
            Bucket: info.bucket_name,
            Key: info.name,
          });
    
          await s3Client.send(command).then((res) => {
            let body = res.Body.transformToByteArray();
            body.then((stream) => {
              new Response(stream, { headers: { "Content-Type": "text/csv" } })
                .text()
                .then((data) => {
                  let parsed = csvParse(data);
    
                  let processedData = parsed.map((dataset, i) => {
                    return processData(dataset, i);
                  });
                  processedData.map((p) => (p.name = availableDatasetNames[index].name));
                  processedData.map((p) => (p.color = colorAssignment[index]));
                  setDatasets(prev => [...prev, ...processedData]);
                  setDataPoint(processedData[0]);
                  setActiveData(prev => [...prev, ...processedData]);
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
            const processedData = res.map((dataset, i) => {
              return processData(dataset, i);
            });
            setDatasets(processedData);
            setDataPoint(processedData[0]);
            setActiveData(processedData);
          });
        } catch (err) {
          console.log("unexpected error")
        }
      }, []);

    return (
        <div>
            <Header />
            <div className={styles.body}>
                <Row className={styles.firstScreen}>
                    <div className={styles.mainPlot}>
                        <div className={styles.mainPlotHeader}>
                            <p className={styles.mainPlotTitle}> UMAP Dimension Reduction (real-time)</p>
                        </div>
                        <UmapWrapper
                            data={activeData}
                            setDataPoint={setDataPoint}
                            query1={query1}
                            query2={query2}
                            selectedData={selectedData}
                            setSelectedData={setSelectedData}
                            reset={reset}
                            setReset={setReset}
                        />
                    </div>
                    <div className={styles.selectors}>
                        <DataSelector
                            page={"umap"}
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
                        />
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
    return {
        props: {
            fetchedNames: fetchedNames
        }
    }
}