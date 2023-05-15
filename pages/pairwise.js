import { useState, useEffect, useMemo } from "react";
import Header from "../components/shared/header";
import styles from "../styles/home.pairwise.module.css";
import StructureWrapper from "../components/structureWrapper";
import { csv, csvParse } from "d3";
import dynamic from "next/dynamic";
import DataSelector from "@/components/shared/dataSelector";
import RangeSelector from "@/components/shared/rangeSelector";
import MaterialInformation from "../components/shared/materialInfo";
import { Row, Col } from "antd";
import PairwiseWrapper from "../components/pairwise/pairwiseWrapper";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "./api/aws";
import { colorAssignment, s3BucketList } from "@/util/constants";
import processData from "../util/processData";
import Link from "next/link";
import Umap_page from "@/pages/umap";
import classNames from "classnames";

const regex = /[-+]?[0-9]*\.?[0-9]+([eE]?[-+]?[0-9]+)/g;

export default function Pairwise({ fetchedNames }) {
  // record all fetched data from the data library
  // all data stored in one array
  const [datasets, setDatasets] = useState([]);
  // record all available data names in the data library
  const [availableDatasetNames, setAvailableDatasetNames] = useState(
    fetchedNames || []
  );
  // record all currently selected data
  const [activeData, setActiveData] = useState(datasets);
  // record all non active data
  const [dataLibrary, setDataLibrary] = useState([]);
  const [dataPoint, setDataPoint] = useState({});
  const [selectedData, setSelectedData] = useState([]);

  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const Youngs = dynamic(() => import("../components/youngs"), {
    ssr: false,
  });

  const Poisson = dynamic(() => import("../components/poisson"), {
    ssr: false,
  });

  const handleRangeChange = (name, value) => {
    let filtered_datasets = datasets.filter((d, i) => {
      const activeDatasetNames = activeData.map((d) => d.name);
      let filtered = d[name] >= value[0] && d[name] <= value[1] && activeDatasetNames.includes(d.name);
      return filtered;
    });
    setActiveData(filtered_datasets);
  };
  async function getAllData() {
    const env = process.env.NODE_ENV
    // let url= 'http://3.142.46.2:8000/model?data='
    let url= 'http://localhost:8000/model?data='
    if (env == 'production') {
        url = 'http://3.142.46.2:8000/model?data='
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
              processedData.map(
                (p) => (p.name = availableDatasetNames[index].name)
              );
              processedData.map((p) => (p.color = colorAssignment[index]));
              setDatasets((prev) => [...prev, ...processedData]);
              setDataPoint(processedData[0]);
              setActiveData((prev) => [...prev, ...processedData]);
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
      console.log("unexpected error");
    }
  }, []);

  const [open, setOpen] = useState(true);

  return (
    <div>
      <Header />
      <div
          className={styles.body}
      >
        <Row>
          <div className={styles.mainPlot}>
            <div className={styles.mainPlotHeader}>
              <p className={styles.mainPlotTitle}>
                Material Data Explorer (Pairwise)
              </p>
              <Link href="/umap">UMAP Dimension Reduction</Link>
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
              max_num_datasets={availableDatasetNames.length}
            />
          </div>
          <div className={styles.subPlots}>
            <StructureWrapper data={dataPoint} />
            <Youngs dataPoint={dataPoint} />
            <Poisson dataPoint={dataPoint} />
          </div>
          <div
              className={`${open ? styles.selectors : styles.selectorsClosed}`}
          >
            <img
                src="/control.png"
                className={`cursor-pointer -right-3 top-9 w-7 border-dark-purple
                m-4
           border-2 rounded-full  ${open && "rotate-180"}`}
                onClick={() => setOpen(!open)}
             alt='control'/>

            <DataSelector
              page={"pairwise"}
              setDatasets={setDatasets}
              availableDatasetNames={availableDatasetNames}
              setAvailableDatasetNames={setAvailableDatasetNames}
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
                open={open}/>
          </div>
        </Row>
      </div>
    </div>
  );
}
