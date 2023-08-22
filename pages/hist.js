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
import Head from "next/head";
import { fetchNames } from "@/components/fetchNames";

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
		const activeDatasetNames = activeData.map((d) => d.name);
		let filtered_datasets = datasets.filter((d, i) => {
			let filtered =
				d[name] >= value[0] &&
				d[name] <= value[1] &&
				activeDatasetNames.includes(d.name);
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
			// Bucket: info.bucket_name,
			Bucket: "ideal-dataset-1",
			Key: info.name,
			cacheControl: "no-cache",
		});

		await s3Client.send(command).then((res) => {
			console.log(info.name);
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
						processedData.map(
							(p) => (p.name = info.name)
						);
						processedData.map(
							(p) => (p.color = colorAssignment[index])
						);
						setDatasets((prev) => [...prev, ...processedData]);
						setDataPoint(processedData[0]);
						setActiveData((prev) => [...prev, ...processedData]);
					});
			});
		});
	}

	const fetchData = async () => {
		const fetchedNames = await fetchNames();
		setAvailableDatasetNames(fetchedNames.fetchedNames);
		fetchedNames.fetchedNames.map((info, i) => fetchDataFromAWS(info, i));
	}

	useEffect(() => {
		fetchData()
	}, []);

  const [open, setOpen] = useState(true);

  return (
    <div>
      <Head>
				<title>Metamaterials Data Explorer</title>
			</Head>
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
              className={`${open ? styles.selectors : styles.selectorsClosed}`}
            // onMouseEnter={onMouseOver}
            // onMouseLeave={onMouseOver}
            style={{ transition: "width 300ms cubic-bezier(0.2, 0, 0, 1) 0s" }}
          >
            <img
                src="/control.png"
                className={`cursor-pointer -right-3 top-9 w-7 border-dark-purple
                m-4
           border-2 rounded-full  ${open && "rotate-180"}`}
                onClick={() => setOpen(!open)}
                alt='control'/>
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
