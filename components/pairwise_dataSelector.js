import {useState} from "react";
import styles from "../styles/pairwise.dataSelector.module.css";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import {Button, Upload} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import s3Client from "@/pages/api/aws";
import Papa, {parse} from 'papaparse'
import processData from "@/util/processData";
import {s3BucketList, colorAssignment} from '@/util/constants';
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import * as React from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";


const datasetNames = [{
  name: "free form 2D",
  color: "#8A8BD0"
}, {
  name: "lattice 2D",
  color: "#FFB347"
}];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Pairwise_DataSelector = ({
                                 setDatasets,
                                 availableDatasetNames,
                                 setAvailableDatasetNames,
                                 selectedDatasetNames,
                                 handleSelectedDatasetNameChange,
                                 activeData,
                                 setActiveData,
                                 dataLibrary,
                                 setDataLibrary,
                               }) => {
  const [showData, setShowData] = useState(
      availableDatasetNames.map((dataset, index) => {
        return true;
      })
  );

  const onIconChange = (event, index) => {
    if (!event.target.checked) {
      console.log("unchecked");
      const sourceItems = Array.from(dataLibrary);
      const destItems = Array.from(activeData);
      const unchecked = destItems.filter(
          (item) => item.name == availableDatasetNames[index].name
      )[0];

      const [removed] = destItems.splice(destItems.indexOf(unchecked), 1);
      sourceItems.splice(sourceItems.length, 0, removed);
      setActiveData(destItems);
      setDataLibrary(sourceItems);
    } else {
      const sourceItems = Array.from(activeData);
      const destItems = Array.from(dataLibrary);
      const checked = destItems.filter(
          (item) => item.name == availableDatasetNames[index].name
      )[0];
      const [removed] = destItems.splice(destItems.indexOf(checked), 1);
      sourceItems.splice(sourceItems.length, 0, removed);
      setActiveData(sourceItems);
      setDataLibrary(destItems);
    }
    let temp = [...showData];
    temp[index] = !temp[index];
    setShowData(temp);
  };
  console.log("scatter data selector");
  console.log(availableDatasetNames);

  function Row(props) {
    const [open, setOpen] = React.useState(false);
    const dataset = props.dataset;
    const index = props.index;
    const data = activeData[index] ? activeData[index].data : [0];

    return (
        <React.Fragment>
          <TableRow>
            <TableCell>
              <IconButton
                  aria-label="expand row"
                  size="small"
                  onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
              </IconButton>
            </TableCell>

            <TableCell component="th" scope="row">
              {/*{dataset.name}*/}
              <Chip
                  key={dataset.name}
                  label={dataset.name}
                  sx={{backgroundColor: dataset.color, color: "white"}}
              />
            </TableCell>

            <TableCell>
              <Checkbox
                  sx={{"& .MuiSvgIcon-root": {fontSize: 28}}}
                  onChange={(e) => onIconChange(e, index)}
                  checked={showData[index]}
              />
            </TableCell>
          </TableRow>
          <TableRow
              key={dataset.name + " details"}
              sx={{"&:last-child td, &:last-child th": {border: 0}}}
          >
            <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{margin: 1}}>
                  <Typography
                      variant="h6"
                      gutterBottom
                      component="div"
                  ></Typography>
                  <Box>
                    <h3> Data info: </h3>
                    <p> {dataset.name} </p>
                    <h3> Author(s): </h3>
                    <p> Northwestern University</p>
                    <h3>Description: </h3>
                    <p>
                      This database contains 248396 orthotropic microstructures
                      represented by 50x50 pixelated matrices as well as the
                      associated independent components of the stiffness tensor
                      calculator by energy-based homogenization, i.e.,C11 ,C12 ,
                      C22 and C66. The microstructures are composed of void (air)
                      and solid (Young’s modulus=1(normalized), Poisson’s
                      ratio=0.49). We first performed SIMP-based TO to find a
                      corresponding pixelated microstructure design for each
                      uniformly sampled target stiffness matrix. With 1400
                      microstructures generated by TO as initial seeds, an
                      iterative stochastic shape perturbation algorithm is
                      employed to perturb microstructure geometries that
                      correspond to extreme and sparse properties. The CMAME
                      version of database (240k) is extended from the SMO version
                      (88k).
                    </p>
                  </Box>
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        </React.Fragment>
    );
  }

  const props = {
    multiple: false,
    async customRequest({
                          action,
                          data,
                          file,
                          filename,
                          headers,
                          onError,
                          onProgress,
                          onSuccess,
                          withCredentials,
                        }) {
      const command = new PutObjectCommand({
        Bucket: 'ideal-dataset-1',
        Key: file.name,
        Body: file,
        Fields: {
          acl: 'public-read',
          'Content-Type': 'text/csv'
        },
      })
      await s3Client.send(command).then((res) => {
        if (res.$metadata.httpStatusCode == 200) {
          onSuccess(res, file)
          //if success, process the file data, then add the dataset to the dataset state.
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (res) => {
              setDatasets(prevState => [...prevState, {
                name: file.name,
                data: processData(res.data),
                color: colorAssignment[prevState.length]
              }])
              setAvailableDatasetNames(prevState => [...prevState, {
                name: file.name,
                color: colorAssignment[prevState.length]
              }]);
              setDataLibrary((prevState) => [
                ...prevState,
                {
                  name: file.name,
                  data: processData(res.data),
                  color: colorAssignment[availableDatasetNames.length],
                },
              ]);
            }
          })
        } else {
          onError()
          console.log('failed')
        }
      })

    }

  }

  return (
      <div className={styles["data-selector"]}>
        <div className={styles["data-row"]}>
          <p className={styles["data-title"]}>Data</p>
          <Upload {...props} accept='text/csv'>
            <Button icon={<UploadOutlined/>}>Upload</Button>
          </Upload>
        </div>
        <div className={styles["data-content-line"]}>
          <FormControl sx={{m: 1, maxWidth: "100%"}}>
            <div>
              <TableContainer
                  component={Paper}
                  sx={{maxHeight: 300, minWidth: 200}}
              >
                <Table stickyHeader aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableDatasetNames.map((dataset, index) => (
                        <Row key={dataset.name} dataset={dataset} index={index}/>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </FormControl>
        </div>
      </div>
  );
};

export default Pairwise_DataSelector;