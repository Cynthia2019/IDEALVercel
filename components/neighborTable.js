import { Table, Col, Row } from "antd";
import StructureWrapper from "./structureWrapper";

const NeighborTable = ({ data }) => {
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
            <Col>
              <Row justify={"start"} align={"center"}>
                <StructureWrapper
                  data={{
                    geometry: row["geometry"],
                    outline_color: row["outline_color"],
                    width: 50,
                    height: 50,
                    marginLeft: 0,
                    marginTop: 30,
                    fontSize: '8px'
                  }}
                ></StructureWrapper>
              </Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>C11: {row["C11"]}</Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>C12: {row["C12"]}</Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>C22: {row["C22"]}</Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>C16: {row["C16"]}</Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>C26: {row["C26"]}</Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>C66: {row["C66"]}</Row>
              <Row justify={"center"} style={{fontSize:'8px'}}>distance: {row["distance"]}</Row>
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
      }}
    />
  );
};
export default NeighborTable;
