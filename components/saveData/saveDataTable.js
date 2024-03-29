import { Table } from 'antd';

const columns = [
    {
      width: 'fit-content',
      key: 'C11',
      title: 'C11',
      dataIndex: 'C11',
      numeric: true,
    },
    {
      width: 'fit-content',
      key: 'C12',
      title: 'C12',
      dataIndex: 'C12',
      numeric: true,
    },
    {
      width: 'fit-content',
      key: 'C22', 
      title: 'C22',
      dataIndex: 'C22',
      numeric: true,
    },
    {
      width: 80,
      key: 'C16', 
      title: 'C16',
      dataIndex: 'C16',
      numeric: true,
    },
    {
      width: 80,
      key: 'C26',
      title: 'C26',
      dataIndex: 'C26',
      numeric: true,
    },
    {
      width: 'fit-content',
      key: 'C66',
      title: 'C66',
      dataIndex: 'C66',
      numeric: true,
    },
  ];
  const SaveDataTable = ({data}) => (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        pageSize: 50,
      }}
      scroll={{
        y: 240,
        x: 700
      }}
    />
  );
  export default SaveDataTable;