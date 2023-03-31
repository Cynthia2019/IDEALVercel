import { useState, useEffect, useMemo } from "react";
import Header from "../components/shared/header";
import styles from "../styles/hist.Home.module.css";
import { csv, csvParse } from "d3";
import DataSelector from "@/components/shared/dataSelector";
import RangeSelector from "@/components/shared/rangeSelector";
import MaterialInformation from "../components/shared/materialInfo";
import { Row, Col } from "antd";
import HistWrapper from "../components/histogram/histWrapper";
import { useRouter } from "next/router";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "@/pages/api/aws";
import { colorAssignment } from "@/util/constants";
import processData from "@/util/processData";
import classNames from "classnames";

const regex = /[-+]?[0-9]*\.?[0-9]+([eE]?[-+]?[0-9]+)/g;

export default function Hist({ fetchedNames }) {
  const [datasets, setDatasets] = useState([]);
  const [availableDatasetNames, setAvailableDatasetNames] = useState(
    fetchedNames || []
  );
  const [activeData, setActiveData] = useState(datasets);
  const [dataLibrary, setDataLibrary] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [dataPoint, setDataPoint] = useState({});
  const [onLoad, setOnLoad] = useState(true);
  const [toggleCollapse, setToggleCollapse] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  const router = useRouter();
  const { pairwise_query1 } = router.query;

  const [query1, setQuery1] = useState(
    pairwise_query1 ? pairwise_query1 : "C11"
  );
  const [query2, setQuery2] = useState("C12");

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

  const wrapperClasses = classNames(
    "h-screen ml-3 px-4 pt-8 bg-light flex justify-between flex-col",
    {
      ["w-100"]: !toggleCollapse,
      ["w-20"]: toggleCollapse,
    }
  );

  return (
    <div>
      <Header />
      <div className={styles.body}>
        <Row>
          <div className={styles.mainPlot}>
            <div className={styles.mainPlotHeader}>
              <p className={styles.mainPlotTitle}></p>
            </div>
            <HistWrapper
              data={activeData}
              setDataPoint={setDataPoint}
              setSelectedData={setSelectedData}
              query1={query1}
              max_num_datasets={availableDatasetNames.length}
            />
          </div>

          <div
            className={styles.selectors}
            // onMouseEnter={onMouseOver}
            // onMouseLeave={onMouseOver}
            style={{ transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
          >
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
            <RangeSelector
              datasets={datasets}
              activeData={activeData}
              handleChange={handleRangeChange}
            />
            <MaterialInformation dataPoint={dataPoint} />
          </div>
        </Row>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  let fetchedNames = [];
  const listObjectCommand = new ListObjectsCommand({
    Bucket: "ideal-dataset-1",
  });
  await s3Client.send(listObjectCommand).then((res) => {
    const names = res.Contents.map((content) => content.Key);
    for (let i = 0; i < names.length; i++) {
      fetchedNames.push({
        bucket_name: "ideal-dataset-1",
        name: names[i],
        color: colorAssignment[i],
      });
    }
  });
  return {
    props: {
      fetchedNames: fetchedNames,
    },
  };
}
