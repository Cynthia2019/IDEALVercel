import { useState, useEffect, useMemo } from "react";
import Header from "../components/header";
import styles from "../styles/Home.module.css";
import ScatterWrapper from "../components/scatterWrapper";
import StructureWrapper from "../components/structureWrapper";
import { csv, csvParse } from "d3";
import dynamic from "next/dynamic";
import DataSelector from "../components/dataSelector";
import RangeSelector from "../components/rangeSelector";
import MaterialInformation from "../components/materialInfo";
import SavePanel from "../components/savePanel";
import NeighborPanel from "@/components/neighborPanel";
import { Row, Col } from "antd";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "./api/aws";
import { colorAssignment } from "@/util/constants";
import processData from "../util/processData";
import { useRouter } from "next/router";

const merge = (first, second) => {
  for (let i = 0; i < second.length; i++) {
    for (let j = 0; j < second[i].data.length; j++) {
      first.push(second[i].data[j]);
    }
  }
  return first;
};

export default function Scatter({}) {
  const [datasets, setDatasets] = useState([]);
  const [availableDatasetNames, setAvailableDatasetNames] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [dataPoint, setDataPoint] = useState({});
  const [selectedDatasetNames, setSelectedDatasetNames] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [neighbors, setNeighbors] = useState([]);
  const [reset, setReset] = useState(false);

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

  const handleQuery1Change = (e) => {
    setQuery1(e.target.value);
  };

  const handleQuery2Change = (e) => {
    setQuery2(e.target.value);
  };

  const handleRangeChange = (name, value) => {
    let filtered_datasets = datasets.map((set, i) => {
      let filtered = set.data.filter(
        (d) => d[name] >= value[0] && d[name] <= value[1]
      );
      return { name: set.name, data: filtered, color: set.color };
    });
    filtered_datasets = filtered_datasets.filter((s) => {
      let names = selectedDatasetNames
        .map((v) => JSON.parse(v))
        .map((v) => v.name);
      return names.includes(s.name);
    });
    setFilteredDatasets(filtered_datasets);
  };

  async function getAllData() {
    const env = process.env.NODE_ENV;
    let url = "http://localhost:8000/model/";
    if (env == "production") {
      url = "https://ideal-server-espy0exsw-cynthia2019.vercel.app/model/";
    }
    let response = await fetch(`${url}`, {
      method: "POST",
      mode: "cors",
    })
      .then((res) => res.json())
      .catch((err) => console.log("fetch error", err.message));
    return response;
  }

  useEffect(() => {
    getAllData().then((res) => {
      res = JSON.parse(res)
      const processedData = res.map((dataset, i) => {
        return processData(dataset, i);
      });
      const dataset_names = [...new Set(processedData.map(item => item.name))]; 
      const dataset_color = [...new Set(processedData.map(item => item.color))]; 
      let dataset_info_json = []
      for (let i = 0; i < dataset_names.length; i++) {
        dataset_info_json.push(JSON.stringify({
          name: dataset_names[i], 
          color: dataset_color[i]
        }))
      }
      setDatasets(processedData);
      setFilteredDatasets(processedData);
      setSelectedDatasetNames(dataset_info_json);
      setDataPoint(processedData[0]);
    });
    console.log(filteredDatasets)
  }, []);

  return (
    <div>
      <Header />
      <div className={styles.body}>
        <Row className={styles.firstScreen}>
          <div className={styles.mainPlot}>
            <div className={styles.mainPlotHeader}>
              <p className={styles.mainPlotTitle}>Material Data Explorer</p>
              <p className={styles.mainPlotSub}>
                Select properties from the dropdown menus to graph on the x and
                y axes. Hovering over data points provides additional
                information. Scroll to zoom, click and drag to pan.
              </p>
            </div>
            <ScatterWrapper
              data={filteredDatasets}
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
            <StructureWrapper data={dataPoint} />
            <Youngs dataPoint={dataPoint} />
            <Poisson dataPoint={dataPoint} />
          </div>
          <div className={styles.selectors}>
            <DataSelector
              setDatasets={setDatasets}
              availableDatasetNames={availableDatasetNames}
              setAvailableDatasetNames={setAvailableDatasetNames}
              selectedDatasetNames={selectedDatasetNames}
              handleSelectedDatasetNameChange={handleSelectedDatasetNameChange}
              query1={query1}
              handleQuery1Change={handleQuery1Change}
              query2={query2}
              handleQuery2Change={handleQuery2Change}
            />
            <RangeSelector
              datasets={datasets}
              filteredDatasets={filteredDatasets}
              handleChange={handleRangeChange}
            />
          </div>
        </Row>
        <Row>
          <Col span={12}>
            <NeighborPanel neighbors={neighbors} />
          </Col>
          <Col span={12}>
            <SavePanel selectedData={selectedData} setReset={setReset} />
          </Col>
        </Row>
        <Row>
          <MaterialInformation dataPoint={dataPoint} />
        </Row>
      </div>
    </div>
  );
}

// async function fetchData(name, i) {
//   const command = new GetObjectCommand({
//     Bucket: 'ideal-dataset-1',
//     Key: name,
//   })

//   await s3Client.send(command).then((res) => {
//     let body = res.Body.transformToByteArray();
//     body.then((stream) => {
//       new Response(stream, { headers: { "Content-Type": "text/csv" } })
//         .text()
//         .then((data) => {
//           let parsed = csvParse(data)
//           const processedData = processData(parsed)
//           setDatasets((datasets) => [
//             ...datasets,
//             {
//               name: name,
//               data: processedData,
//               color: colorAssignment[i],
//             },
//           ]);
//           setFilteredDatasets((datasets) => [
//             ...datasets,
//             {
//               name: name,
//               data: processedData,
//               color: colorAssignment[i],
//             },
//           ]);
//           setSelectedDatasetNames((datasets) => [
//             ...datasets,
//             JSON.stringify({ name: name, color: colorAssignment[i]}),
//           ]);
//           setDataPoint(processedData[0]);
//         });
//     });
//   });
// }
