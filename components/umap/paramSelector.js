import { InputNumber, Slider, Row, Col } from "antd";
import styles from "@/styles/umap.paramSelector.module.css";
import { useState } from "react";
import { Typography } from "@mui/material";

const RangeSelector = ({ datasets, activeData, handleChange }) => {
	const data = datasets;
	const filtered = activeData;
	const [inputValue, setInputValue] = useState(30);
	const handleInputChange = (name, newValue) => {
		setInputValue(newValue);
		handleSliderChange(name, newValue);
	};
	const handleSliderChange = (name, value) => {
		setInputValue(value);
		handleChange(name, value);
	};

	const marks = {
		5: "5",
		25: "25",
		50: "50",
	};

	return (
		<div className={styles["property-range"]}>
			<Typography variant="h3" className={styles["range-title"]} color={"textPrimary"}>Hyperparameter</Typography>
				<Typography style={{ fontWeight: "bold" }} color={"textPrimary"}>
					Number of neighbors:
				</Typography>

				<Typography style={{width:'80%'}} color={"textPrimary"}>
					The size of local neighborhood (in terms of number of
					neighboring sample points) used for manifold approximation.
					Larger values result in more global views of the manifold,
					while smaller values result in more local data being
					preserved. (Default: 30)
				</Typography>
				<Typography style={{width:'80%'}} justify={'space-between'} wrap={true} color={"textPrimary"}>
					<Col span={16}>
						<Slider
							marks={marks}
							className={styles["slider"]}
							value={inputValue}
							defaultValue={[30]}
							min={5}
							max={50}
							onChange={(value, filteredDatasets) =>
								handleSliderChange(name, value)
							}
						/>
					</Col>
					<Col span={6}>
						<InputNumber
							min={5}
							max={50}
							value={inputValue}
							onChange={(value, filteredDatasets) =>
								handleSliderChange(name, value)
							}
						/>
					</Col>
				</Typography>
		</div>
	);
};

export default RangeSelector;
