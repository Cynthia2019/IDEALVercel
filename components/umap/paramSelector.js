import { InputNumber, Slider, Row, Col } from "antd";
import styles from "@/styles/umap.paramSelector.module.css";
import { useState } from "react";

const RangeSelector = ({ datasets, activeData, handleChange }) => {
	const data = datasets;
	const filtered = activeData;
	const [inputValue, setInputValue] = useState(15);
	const handleInputChange = (name, newValue) => {
		setInputValue(newValue);
		handleSliderChange(name, newValue);
	};
	const handleSliderChange = (name, value) => {
		setInputValue(value);
		handleChange(name, value);
	};

	const marks = {
		1: "1",
		15: "15",
		30: "30",
	};

	return (
		<div className={styles["property-range"]}>
			<p className={styles["range-title"]}>Hyperparameter</p>
				<Row style={{ fontWeight: "bold" }}>
					Number of neighbors:
				</Row>

				<Row style={{width:'80%'}}>
					The size of local neighborhood (in terms of number of
					neighboring sample points) used for manifold approximation.
					Larger values result in more global views of the manifold,
					while smaller values result in more local data being
					preserved. (Default: 15)
				</Row>
				<Row style={{width:'80%'}} justify={'space-between'} wrap={true}>
					<Col span={16}>
						<Slider
							marks={marks}
							className={styles["slider"]}
							value={inputValue}
							defaultValue={[15]}
							min={1}
							max={30}
							onChange={(value, filteredDatasets) =>
								handleSliderChange(name, value)
							}
						/>
					</Col>
					<Col span={6}>
						<InputNumber
							min={1}
							max={30}
							value={inputValue}
							onChange={(value, filteredDatasets) =>
								handleSliderChange(name, value)
							}
						/>
					</Col>
				</Row>
		</div>
	);
};

export default RangeSelector;
