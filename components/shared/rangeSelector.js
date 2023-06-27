import {Slider, Row, Col} from "antd";
import styles from "@/styles/rangeSelector.module.css";
import {useState, useEffect} from "react";


const rangeList = ["C11", "C12", "C22", "C16", "C26", "C66"];

const RangeSelector = ({datasets, activeData, handleChange, open}) => {
        const data = datasets;
        const filtered = activeData;
        const handleSliderChange = (name, value) => {
            handleChange(name, value);
        };

        let mins = data.map((d) => Math.min(...rangeList.map((name) => d[name])));
        let maxs = data.map((d) => Math.max(...rangeList.map((name) => d[name])));

        return (
            <div className={styles["property-range"]}>
                <p className={styles["range-title"]}>Property Range</p>
                {rangeList.map((name, index) => (
                    <Row key={index} justify="center" align='top'
                         className={`${open ? '' : styles["slider-closed"]}`}
                    >
                        <Col span={4}>{name}</Col>
                        <Col span={20}>
                            <Slider
                                range={{
                                    draggableTrack: true
                                }}
                                // marks={
                                //     {
                                //         min: Math.min(...data.map((d) => d[name])),
                                //         max: Math.max(...data.map((d) => d[name]))
                                //     }
                                // }
                                defaultValue={[
                                    Math.min(...data.map((d) => d[name])),
                                    Math.max(...data.map((d) => d[name])),
                                ]}
                                value={[
                                    Math.min(...filtered.map((d) => d[name])),
                                    Math.max(...filtered.map((d) => d[name])),
                                ]}
                                min={Math.min(...data.map((d) => d[name]))}
                                max={Math.max(...data.map((d) => d[name]))}
                                onChange={(value, filteredDatasets) =>
                                    handleSliderChange(name, value)
                                }
                            />
                        </Col>
                    </Row>
                ))}
            </div>
        );
    }
;

export default RangeSelector;
