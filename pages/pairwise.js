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
import Button from "@mui/material/Button";
import * as React from "react";
import Youngs_d3 from "@/components/shared/youngs_d3";
import Head from "next/head";
import zlib from "zlib";
import { Readable, Transform } from "stream";

const regex = /[-+]?[0-9]*\.?[0-9]+([eE]?[-+]?[0-9]+)/g;

export default function Pairwise() {
	// record all fetched data from the data library
	// all data stored in one array
	const [datasets, setDatasets] = useState([]);
	// record all available data names in the data library
	const [availableDatasetNames, setAvailableDatasetNames] = useState([]);
	// record all currently selected data
	const [activeData, setActiveData] = useState([]);
	// record all non active data
	const [dataLibrary, setDataLibrary] = useState([]);
	const [dataPoint, setDataPoint] = useState({});

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

	const getTransformStream = () => {
		const transform = new Transform({
			transform: (chunk, encoding, next) => {
				 next(null, chunk);
			 },
		 });
		 return transform;
	  };

	const fetchData = async () => {
		const fetchedNames = await fetch("http://localhost:8000/fetch")
			.then((res) => res.json())
			.catch((err) => console.log(err));
		console.log(fetchedNames);
		setAvailableDatasetNames(fetchedNames);
		fetchedNames.map(async (info, i) => {
			const command = new GetObjectCommand({
				Bucket: info.bucket_name,
				Key: info.name,
			});
			const s3Response = await s3Client.send(command);
			let body = await s3Response.Body;
			const readableStream = body.pipe(zlib.createGunzip()).pipe(getTransformStream());
			const unzipStream = zlib.createUnzip();
			readableStream.pipe(unzipStream);

			let processedData = [];
			unzipStream.on("data", (chunk) => {
				let data = chunk.toString();
				console.log(data)
				const parsedData = csvParse(data);
				const processed = processData(parsedData);
				processedData = processedData.concat(processed);
				// setDatasets((prev) => [...prev, processedData]);
				// setActiveData((prev) => [...prev, processedData]);
				// setDataLibrary((prev) => [...prev, processedData]);
			});
			unzipStream.on("end", () => {
				console.log("end");
				console.log(processedData);
			});
			unzipStream.on("error", (err) => {
				console.log(err);
			});
		});
	};

	useEffect(() => {
		fetchData();
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
					{/* <div className={styles.subPlots}>
						<StructureWrapper data={dataPoint} />
						<Youngs dataPoint={dataPoint} />
						<Poisson dataPoint={dataPoint} />
					</div> */}
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
							open={open}
						/>
					</div>
				</Row>
			</div>
		</div>
	);
}
