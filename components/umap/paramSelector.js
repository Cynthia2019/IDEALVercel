import { Slider, Row, Col } from "antd";
import styles from "@/styles/umap.paramSelector.module.css";


const rangeList = ["Number of neighbors"];

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
                <Row key={index} justify="center" align='top' className={styles["range-row"]}>
                    <Col pull={0} span={24}>{name}: the size of local neighborhood (in terms of number of neighboring sample points) used for manifold approximation. Larger values result in more global views of the manifold, while smaller values result in more local data being preserved. (Default: 15)</Col>
                    <Col pull={0} span={24}>
                        <Slider
                            className={styles["slider"]}
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
