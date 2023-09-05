import { Table, Col, Row } from "antd";
import StructureWrapper from "@/components/structureWrapper";
import { Chip } from "@mui/material";

const columnNames = ["C11", "C12", "C22", "C16", "C26", "C66", "distance"];

const NeighborTable = ({ data }) => {
	let columns = [];
	if (data.length != 0 && data[0]) {
		let flatten = Object.entries(data[0]);
		columns = flatten.map(([key, value], i) => ({
			key: `neighbor-col-${key}-${i}`,
			render: (i, record) => {
				if (record) {
					const row = value;
					console.log(row);
					return (
						<Col key={`neighbor-col-${key}-${i}`}>
							<Row
								justify={"start"}
								align={"center"}
								key={`neighbor-col-${key}-${i}-structure`}
							>
								<StructureWrapper
									data={{
										geometry: row["geometry"],
										outline_color: row["outline_color"],
										width: 50,
										height: 50,
										marginLeft: 0,
										marginTop: 30,
										fontSize: "8px",
										isDarkMode: false,
									}}
								></StructureWrapper>
								<Row
									justify={"center"}
									style={{ fontSize: "8px" }}
								>
									<Chip
										key={row["name"]}
										label={row["name"]}
										sx={{
											backgroundColor: row["color"],
											color: "white",
										}}
                    size="small"
									/>
								</Row>
							</Row>
							{columnNames.map((col, i) => (
								<Row
									justify={"center"}
									style={{ fontSize: "8px" }}
									key={`neighbor-col-${key}-${i}-${col}`}
								>
									{col}: {row[col]}
								</Row>
							))}
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
				x: 400,
			}}
		/>
	);
};
export default NeighborTable;
