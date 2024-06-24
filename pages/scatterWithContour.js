import { useState, useEffect } from "react";
import Header from "@/components/shared/header";
import styles from "@/styles/scatterWithContour.Home.module.css";
import ScatterWithContourWrapper from "../components/scatter/scatterWithContourWrapper";
import StructureWrapper from "../components/structureWrapper";
import { csvParse } from "d3";
import dynamic from "next/dynamic";
import DataSelector from "@/components/scatter/dataSelector_scatterWithContour";
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

export default function ScatterWithContour({ fetchedNames }) {
	const [datasets, setDatasets] = useState([]);

	const [availableDatasetNames, setAvailableDatasetNames] = useState(
		fetchedNames || []
	);
	const [activeData, setActiveData] = useState(datasets);
	const [dataLibrary, setDataLibrary] = useState([]);
	const [density_activeData, setDensityActiveData] = useState(datasets);
	const [density_dataLibrary, setDensityDataLibrary] = useState([]);
	const [scatter_activeData, setScatterActiveData] = useState(datasets);
	const [scatter_dataLibrary, setScatterDataLibrary] = useState([]);
	const [dataPoint, setDataPoint] = useState({});
	const [selectedData, setSelectedData] = useState([]);
	const [neighbors, setNeighbors] = useState([]);
	const [reset, setReset] = useState(false);

	// record the loading state of data
	const [dataLoadingStates, setDataLoadingStates] = useState([]);

	//record the whole dataset
	const [completeData, setCompleteData] = useState([]);
	const [maxDataPointsPerDataset, setMaxDataPointsPerDataset] = useState(500);

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
		setDensityDataLibrary(sourceItems);
		setScatterDataLibrary(sourceItems);
		setDensityActiveData(destItems);
		setScatterActiveData(destItems);
	};

	async function fetchDataFromAWS(info, index) {
		const command = new GetObjectCommand({
			Bucket: "ideal-dataset-1",
			Key: info.name,
		});

		await s3Client.send(command).then((res) => {
			console.log('fetched data');
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
						console.log('data', processedData)

						processedData.map((p) => (p.name = info.name));
						processedData.map(
							(p) => (p.color = colorAssignment[index])
						);
						setCompleteData((prev) => [
							...prev,
							{
								name: info.name,
								data: processedData,
							},
						]);
						let processedData2 = processedData.slice(
							0,
							maxDataPointsPerDataset
						);
						setDatasets((prev) => [...prev, ...processedData2]);
						setDataPoint(processedData2[0]);
						setActiveData((prev) => [...prev, ...processedData2]);
						setDensityActiveData((prev) => [...prev, ...processedData2]);
						setScatterActiveData((prev) => [...prev, ...processedData2]);
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
		console.log('fetched names', fetchedNames);
		setAvailableDatasetNames(fetchedNames);
		setDataLoadingStates(
			fetchedNames.map((info) => ({
				...info,
				loading: true,
			}))
		);
		setMaxDataPointsPerDataset(
			Math.floor(
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
	}, [maxDataPointsPerDataset, availableDatasetNames]);

	useEffect(() => {
		if (availableDatasetNames.length > 0) {
			const lastIndex = availableDatasetNames.length - 1;
			const lastInfo = availableDatasetNames[lastIndex];
			fetchDataFromAWS(lastInfo, lastIndex);
		}
	}, [availableDatasetNames]);

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
								Material Data Explorer (Scatter and Contour)
							</p>
							<p className={styles.mainPlotSub}>
								Select properties from the dropdown menus to
								graph. Hover over data points for additional
								information. Scroll to zoom, click and drag to
								pan. You can find out how the density plots are generated
								<a href="https://d3js.org/d3-contour/density"> here</a>.
								The legend denotes the absolute number of points contained in each color.
							</p>
						</div>
						<ScatterWithContourWrapper
							data={activeData}
							densityData={density_activeData}
							scatterData={scatter_activeData}
							completeData={completeData}
							maxDataPointsPerDataset={maxDataPointsPerDataset}
							setMaxDataPointsPerDataset={setMaxDataPointsPerDataset}
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
                m-4
           border-2 rounded-full  ${open && "rotate-180"}`}
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
							query1={query1}
							handleQuery1Change={handleQuery1Change}
							query2={query2}
							handleQuery2Change={handleQuery2Change}
							activeData={activeData}
							dataLibrary={dataLibrary}
							setActiveData={setActiveData}
							setDataLibrary={setDataLibrary}
							density_activeData={density_activeData}
							setDensityActiveData={setDensityActiveData}
							density_dataLibrary={density_dataLibrary}
							setDensityDataLibrary={setDensityDataLibrary}
							scatter_activeData={scatter_activeData}
							setScatterActiveData={setScatterActiveData}
							scatter_dataLibrary={scatter_dataLibrary}
							setScatterDataLibrary={setScatterDataLibrary}
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
