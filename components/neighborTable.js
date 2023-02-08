import { Table } from 'antd';
import StructureWrapper from './structureWrapper';

const columns = [
    {
      width:  'fit-content',
      title: 'C11',
      dataIndex: 'C11',
      key: "C11", 
      numeric: true,
    },
    {
      width:  'fit-content',
      title: 'C12',
      dataIndex: 'C12',
      key: "C12",
      numeric: true,
    },
    {
      width:  'fit-content',
      title: 'C22',
      dataIndex: 'C22',
      key: 'C22', 
      numeric: true,
    },
    {
      width:  'fit-content',
      title: 'C16',
      dataIndex: 'C16',
      key: 'C16', 
      numeric: true,
    },
    {
      width: 'fit-content',
      title: 'C26',
      dataIndex: 'C26',
      key: "C26", 
      numeric: true,
    },
    {
      width: 'fit-content',
      title: 'C66',
      dataIndex: 'C66',
      key: 'C66',
      numeric: true,
    },
    {
        width: 300, 
        title: 'Unit Cell Geometry', 
        dataIndex: 'geometry', 
        render: (_, record) => 
        <StructureWrapper data={record}></StructureWrapper>
    },
    {
        width: 80,
        title: 'Color',
        dataIndex: 'outline_color',
        key: 'outline_color',
        fixed: 'right',
        render: (_, record) => (
            <svg height="50" width="50">
                <circle cx="25" cy="25" r="5" fill={record.outline_color} />
            </svg>
        )
      },
  ];
  const NeighborTable = ({data}) => (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        pageSize: 50,
      }}
      scroll={{
        y: 240,
        x: 1000
      }}
    />
  );
  export default NeighborTable;