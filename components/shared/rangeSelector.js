import { Slider, Row, Col } from "antd";
import styles from "@/styles/rangeSelector.module.css";
import sigFigs from "@/util/convertTo4SigFig";
import { Typography } from "@mui/material";


const rangeList = ["C11", "C12", "C22", "C16", "C26", "C66"];

const RangeSelector = ({datasets, activeData, handleChange, open}) => {
        const data = datasets;
        const filtered = activeData;
        const handleSliderChange = (name, value) => {
            handleChange(name, value);
        };
        console.log('data', data);
        return (
            <div className={styles["property-range"]}>
                <Typography color="textPrimary" className={styles["range-title"]}>Property Range</Typography>
                {rangeList.map((name, index) => {
                    return (
                        <>
                    <Row key={index} justify="center" align='top'
                         className={`${open ? '' : styles["slider-closed"]}`}
                         style={{marginBottom: "0.5rem"}}
                    >
                        <Col span={4}>
                            <Typography color={"textPrimary"}>{name}</Typography>
                        </Col>
                        <Col span={20}>
                            <Slider
                                range={{
                                    draggableTrack: true
                                }}
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
                                style={{margin: "0"}}
                            />
                            <Row justify={'space-between'}>
                                <Col style={{color:'gray'}}>{sigFigs(Math.min(...data.map((d) => d[name])), 4)}</Col>
                                <Col style={{color:'gray'}}>{Math.max(...data.map((d) => d[name]))}</Col>
                            </Row>
                        </Col>
                    </Row>
                    </>
                )}
                )}
            </div>
        );
    }
;

export default RangeSelector;
