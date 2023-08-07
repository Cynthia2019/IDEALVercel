import { useState, useEffect, useMemo } from "react";
import Header from "../components/shared/header";
import styles from "../styles/umap.module.css";
import UmapWrapper from "../components/umap/umapWrapper";
import StructureWrapper from "../components/structureWrapper";
import { csvParse } from "d3";
import dynamic from "next/dynamic";
import ParamSelector from "@/components/umap/paramSelector";

import DataSelector from "@/components/shared/dataSelector";
import { Row } from "antd";
import { GetObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "./api/aws";
import { colorAssignment } from "@/util/constants";
import processData from "../util/processData";
import { useRouter } from "next/router";
import Head from "next/head";
import { fetchNames } from "@/components/fetchNames";

import { calculateUmap } from "@/util/calculateUmap";

export default function Umap() {
	const [datasets, setDatasets] = useState([]);
	const [availableDatasetNames, setAvailableDatasetNames] =
		useState([]);
	const [activeData, setActiveData] = useState(datasets);
	const [dataLibrary, setDataLibrary] = useState([]);
	const [dataPoint, setDataPoint] = useState({});
	const [selectedData, setSelectedData] = useState([]);
	const [reset, setReset] = useState(false);
	const [knn, setKNN] = useState(15);

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
		setKNN(value);
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
	}, [availableDatasetNames.length]);


	useEffect(() => {
		const url = "https://metamaterials-srv.northwestern.edu/model/";
		const data = calculateUmap(activeData, knn).map((d) => [
			d.C11,
			d.C12,
			d.C22,
			d.C16,
			d.C26,
			d.C66,
		]);
		fetch(url, {
			method: "POST",
			mode: "cors",
			body: JSON.stringify({
				data: data,
				n_neighbors: 5,
			}),
		}).catch((err) => console.log("umap refit knn error", err));
	}, [activeData]);

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
								UMAP Visualization
							</p>
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
							knn={knn}
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
						style={{
							transition:
								"width 300ms cubic-bezier(0.2, 0, 0, 1) 0s",
						}}
					>
						<img
							src="/control.png"
							className={`cursor-pointer -right-3 top-9 w-7
                             border-dark-purple m-4 border-2 rounded-full  ${open && "rotate-180"}`}
							onClick={() => setOpen(!open)}
							alt="control"
						/>

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
							open={open}
						/>
						<ParamSelector
							datasets={datasets}
							activeData={activeData}
							handleChange={handleRangeChange}
							open={open}
						/>
					</div>
				</Row>
			</div>
		</div>
	);
}