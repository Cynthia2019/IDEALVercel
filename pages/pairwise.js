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
import {
	MAX_DATA_POINTS_NUM,
	colorAssignment,
	s3BucketList,
} from "@/util/constants";
import processData from "../util/processData";
import Button from "@mui/material/Button";
import * as React from "react";
import Head from "next/head";
import { fetchNames } from "@/components/fetchNames";

export default function Pairwise() {
	const [completeData, setCompleteData] = useState([]);

	// record all fetched data from the data library
	// all data stored in one array
	const [datasets, setDatasets] = useState([]);
	// record all available data names in the data library
	const [availableDatasetNames, setAvailableDatasetNames] = useState([]);
	// record all currently selected data
	const [activeData, setActiveData] = useState([]);
	// record all non active data
	const [dataLibrary, setDataLibrary] = useState([]);
	// record the loading state of data
	const [dataLoadingStates, setDataLoadingStates] = useState([]);
	const [dataPoint, setDataPoint] = useState({});
	const [maxDataPointsPerDataset, setMaxDataPointsPerDataset] = useState(200);

	const Youngs = dynamic(() => import("../components/youngs"), {
		ssr: false,
	});

	const Poisson = dynamic(() => import("../components/poisson"), {
		ssr: false,
	});

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
						setCompleteData((prev) => [
							...prev,
							{
								name: info.name,
								data: processedData,
							},
						]);
						processedData = processedData.slice(
							0,
							maxDataPointsPerDataset
						);
						processedData.map((p) => (p.name = info.name));
						processedData.map(
							(p) => (p.color = colorAssignment[index])
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
				MAX_DATA_POINTS_NUM /
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
				<Row>
					<div className={styles.mainPlot}>
						<div style={{ margin: "8px", marginLeft: "20px" }}>
							<Button
								size="medium"
								href="/umap"
								variant="contained"
							>
								Visualize in Reduced Dimension
							</Button>
						</div>

						<PairwiseWrapper
							data={activeData}
							setDataPoint={setDataPoint}
							max_num_datasets={availableDatasetNames.length}
						/>
					</div>
					<div className={styles.subPlots}>
						<StructureWrapper data={dataPoint} />
						<Youngs dataPoint={dataPoint} />
						<Poisson dataPoint={dataPoint} />
					</div>
					<div
						className={`${
							open ? styles.selectors : styles.selectorsClosed
						}`}
					>
						<img
							src="/control.png"
							className={`cursor-pointer -right-3 top-9 w-7 border-dark-purple
                m-4 border-2 rounded-full  ${open && "rotate-180"}`}
							onClick={() => setOpen(!open)}
							alt="control"
						/>

						<DataSelector
							page={"scatter"}
							datasets={datasets}
							setDatasets={setDatasets}
							availableDatasetNames={availableDatasetNames}
							setAvailableDatasetNames={setAvailableDatasetNames}
							dataLoadingStates={dataLoadingStates}
							activeData={activeData}
							dataLibrary={dataLibrary}
							setActiveData={setActiveData}
							setDataLibrary={setDataLibrary}
							setCompleteData={setCompleteData}
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
