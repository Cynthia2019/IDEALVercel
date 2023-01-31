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
import { Row, Col } from "antd";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from './api/aws'
import { s3BucketList, colorAssignment } from '@/util/constants'
import processData from "../util/processData";
import { useRouter } from 'next/router';


export default function Scatter({fetchedNames}) {
  const [datasets, setDatasets] = useState([]);
  const [availableDatasetNames, setAvailableDatasetNames] = useState(fetchedNames);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [dataPoint, setDataPoint] = useState({});
  const [selectedDatasetNames, setSelectedDatasetNames] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [reset, setReset] = useState(false);

  const router = useRouter();
  const {pairwise_query1, pairwise_query2} = router.query;

  const [query1, setQuery1] = useState(pairwise_query1 ? pairwise_query1 : "C11");
  const [query2, setQuery2] = useState(pairwise_query2 ? pairwise_query2 : "C12");


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
     let names = selectedDatasetNames.map(v => JSON.parse(v)).map((v) => v.name) 
     return names.includes(s.name)
    }
    );
    setFilteredDatasets(filtered_datasets);
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
              setDataPoint(processedData[0]);
            });
        });
      });
    }

    availableDatasetNames.map((info, i) => fetchData(info))
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
          <Col span={16}>
            <SavePanel selectedData={selectedData} setReset={setReset} />
          </Col>
          <Col span={8}>
            <MaterialInformation dataPoint={dataPoint} />
          </Col>
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

