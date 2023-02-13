import { Table, Col, Row } from "antd";
import StructureWrapper from "./structureWrapper";

const columns = [
  {
    key: "point0",
    dataIndex: "point0",
    render: (_, record) => {
      if (record) {
        const row = record["point0"];
        return (
          <Col justify="center">
            <StructureWrapper
              data={{
                geometry: row["geometry"],
                outline_color: row["outline_color"],
                width: 100,
                height: 100,
                marginLeft: 0,
                marginTop: 30,
              }}
            ></StructureWrapper>
            <Row justify={"center"}>C11: {row["C11"]}</Row>
            <Row justify={"center"}>C12: {row["C12"]}</Row>
            <Row justify={"center"}>C22: {row["C22"]}</Row>
            <Row justify={"center"}>C16: {row["C16"]}</Row>
            <Row justify={"center"}>C26: {row["C26"]}</Row>
            <Row justify={"center"}>C66: {row["C66"]}</Row>
          </Col>
        );
      }
    },
  },
  {
    key: "point1",
    dataIndex: "point1",
    render: (_, record) => {
      if (record) {
        const row = record["point1"];
        return (
          <Col justify="center">
            <StructureWrapper
              data={{
                geometry: row["geometry"],
                outline_color: row["outline_color"],
                width: 100,
                height: 100,
                marginLeft: 0,
                marginTop: 30,
              }}
            ></StructureWrapper>
            <Row justify={"center"}>C11: {row["C11"]}</Row>
            <Row justify={"center"}>C12: {row["C12"]}</Row>
            <Row justify={"center"}>C22: {row["C22"]}</Row>
            <Row justify={"center"}>C16: {row["C16"]}</Row>
            <Row justify={"center"}>C26: {row["C26"]}</Row>
            <Row justify={"center"}>C66: {row["C66"]}</Row>
          </Col>
        );
      }
    },
  },
  {
    key: "point2",
    dataIndex: "point2",
    render: (_, record) => {
      if (record) {
        const row = record["point2"];
        return (
          <Col justify="center">
            <StructureWrapper
              data={{
                geometry: row["geometry"],
                outline_color: row["outline_color"],
                width: 100,
                height: 100,
                marginLeft: 0,
                marginTop: 30,
              }}
            ></StructureWrapper>
            <Row justify={"center"}>C11: {row["C11"]}</Row>
            <Row justify={"center"}>C12: {row["C12"]}</Row>
            <Row justify={"center"}>C22: {row["C22"]}</Row>
            <Row justify={"center"}>C16: {row["C16"]}</Row>
            <Row justify={"center"}>C26: {row["C26"]}</Row>
            <Row justify={"center"}>C66: {row["C66"]}</Row>
          </Col>
        );
      }
    },
  },
  {
    key: "point3",
    dataIndex: "point3",
    render: (_, record) => {
      if (record) {
        const row = record["point3"];
        return (
          <Col justify="center">
            <StructureWrapper
              data={{
                geometry: row["geometry"],
                outline_color: row["outline_color"],
                width: 100,
                height: 100,
                marginLeft: 0,
                marginTop: 30,
              }}
            ></StructureWrapper>
            <Row justify={"center"}>C11: {row["C11"]}</Row>
            <Row justify={"center"}>C12: {row["C12"]}</Row>
            <Row justify={"center"}>C22: {row["C22"]}</Row>
            <Row justify={"center"}>C16: {row["C16"]}</Row>
            <Row justify={"center"}>C26: {row["C26"]}</Row>
            <Row justify={"center"}>C66: {row["C66"]}</Row>
          </Col>
        );
      }
    },
  },
  {
    key: "point4",
    dataIndex: "point4",
    render: (_, record) => {
      if (record) {
        const row = record["point4"];
        return (
          <Col justify="center">
            <StructureWrapper
              data={{
                geometry: row["geometry"],
                outline_color: row["outline_color"],
                width: 100,
                height: 100,
                marginLeft: 0,
                marginTop: 30,
              }}
            ></StructureWrapper>
            <Row justify={"center"}>C11: {row["C11"]}</Row>
            <Row justify={"center"}>C12: {row["C12"]}</Row>
            <Row justify={"center"}>C22: {row["C22"]}</Row>
            <Row justify={"center"}>C16: {row["C16"]}</Row>
            <Row justify={"center"}>C26: {row["C26"]}</Row>
            <Row justify={"center"}>C66: {row["C66"]}</Row>
          </Col>
        );
      }
    },
  },
];
const NeighborTable = ({ data }) => {
  console.log("neighbor", data);
  let columns = []
  if (data.length != 0 && data[0]) {
    let flatten = Object.entries(data[0]);
    columns = flatten.map(([key, value], i) => ({
      key: key,
      dataIndex: key,
      render: (_, record) => {
        if (record) {
          const row = value;
          return (
            <Col justify="center">
              <Row justify={"center"}>
                <StructureWrapper
                  data={{
                    geometry: row["geometry"],
                    outline_color: row["outline_color"],
                    width: 100,
                    height: 100,
                    marginLeft: 0,
                    marginTop: 30,
                  }}
                ></StructureWrapper>
              </Row>
              <Row justify={"center"}>C11: {row["C11"]}</Row>
              <Row justify={"center"}>C12: {row["C12"]}</Row>
              <Row justify={"center"}>C22: {row["C22"]}</Row>
              <Row justify={"center"}>C16: {row["C16"]}</Row>
              <Row justify={"center"}>C26: {row["C26"]}</Row>
              <Row justify={"center"}>C66: {row["C66"]}</Row>
            </Col>
          );
        }
      },
    }));
  }
  return (
    <Table
      columns={columns}
      dataSource={data}
      showHeader={false}
      pagination={{
        pageSize: 50,
      }}
      scroll={{
        y: 240,
        x: 1000,
      }}
    />
  );
};
export default NeighborTable;
