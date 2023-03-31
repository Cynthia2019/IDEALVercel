import { Slider, Row, Col } from "antd";
import styles from "@/styles/umap.paramSelector.module.css";


const rangeList = ["Number of nearest neighbors"];

const RangeSelector = ({ datasets, activeData, handleChange }) => {
    const data = datasets;
    const filtered = activeData;
    const handleSliderChange = (name, value) => {
        handleChange(name, value);
    };
    return (
        <div className={styles["property-range"]}>
            <p className={styles["range-title"]}>Hyperparameter</p>
            {rangeList.map((name, index) => (
                <Row key={index} justify="center" align='top'>
                    <Col span={4}>{name}</Col>
                    <Col span={20}>
                        <Slider
                            range={{ draggableTrack: true }}
                            defaultValue={[
                                15
                            ]}
                            // value={[
                            //     5
                            // ]}
                            min={5}
                            max={30}
                            onChange={(value, filteredDatasets) =>
                                handleSliderChange(name, value)
                            }
                        />
                    </Col>
                </Row>
            ))}
        </div>
    );
};

export default RangeSelector;
