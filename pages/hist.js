import {useState, useEffect, useMemo} from "react";
import Header from "../components/shared/header";
import styles from "../styles/hist.Home.module.css";
import {csv, csvParse} from "d3";
import dynamic from "next/dynamic";
// import Hist_dataSelector from "../components/hist_dataSelector";
import DataSelector from "@/components/shared/dataSelector";
import Hist_RangeSelector from "../components/histogram/hist_rangeSelector";
import MaterialInformation from "../components/materialInfo";
import {Row, Col} from "antd";
import HistWrapper from "../components/histogram/histWrapper";
import { useRouter } from 'next/router';
import {GetObjectCommand, ListObjectsCommand} from "@aws-sdk/client-s3";
import s3Client from "@/pages/api/aws";
import {colorAssignment} from "@/util/constants";
import processData from "@/util/processData";
import {act} from "react-dom/test-utils";


const regex = /[-+]?[0-9]*\.?[0-9]+([eE]?[-+]?[0-9]+)/g;

export default function Hist({fetchedNames}) {
    const [datasets, setDatasets] = useState([]);
    const [availableDatasetNames, setAvailableDatasetNames] = useState(fetchedNames || []);
    const [activeData, setActiveData] = useState(datasets);
    const [dataLibrary, setDataLibrary] = useState([])
    const [selectedData, setSelectedData] = useState([]);
    const [dataPoint, setDataPoint] = useState({});
    const [onLoad, setOnLoad] = useState(true);

    const router = useRouter();
    const {pairwise_query1} = router.query;

    const [query1, setQuery1] = useState(pairwise_query1 ? pairwise_query1 : "C11");
    const [query2, setQuery2] = useState("C12");


    const handleQuery1Change = (e) => {
        setQuery1(e.target.value);
    };

    const handleQuery2Change = (e) => {
        setQuery2(e.target.value);
    };

    const handleRangeChange = (name, value) => {

        let filtered_datasets = datasets.filter((d, i) => {
            let filtered = d[name] >= value[0] && d[name] <= value[1]
            let names = [...new Set(activeData.map(d => d.name))]
            return names.includes(d.name) && filtered;
        });
        setActiveData(filtered_datasets);
      };
      async function getAllData() {
        const env = process.env.NODE_ENV;
        let url = "http://localhost:8000/model/";
        if (env == "production") {
          //url = "http://localhost:8000/model/";
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
            <Header/>
            <div className={styles.body}>
                <Row>
                    <div className={styles.mainPlot}>
                        <div className={styles.mainPlotHeader}>
                            <p className={styles.mainPlotTitle}></p>
                            {/*<p className={styles.mainPlotSub}>*/}
                            {/*    Select properties from the dropdown menus below to graph on the*/}
                            {/*    x and y axes. Hovering over data points provides additional*/}
                            {/*    information. Scroll to zoom, click and drag to pan, and*/}
                            {/*    double-click to reset.*/}
                            {/*</p>*/}
                        </div>
                        <HistWrapper
                            data={activeData}
                            setDataPoint={setDataPoint}
                            setSelectedData={setSelectedData}
                            query1={query1}
                            max_num_datasets={availableDatasetNames.length}
                        />
                    </div>

                    <div className={styles.selectors}>
                        <DataSelector
                            page={"histogram"}
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
                        <Hist_RangeSelector
                            datasets={datasets}
                            filteredDatasets={activeData}
                            handleChange={handleRangeChange}
                        />
                        {/*<MaterialInformation dataPoint={dataPoint}/>*/}

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