"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAX_DATA_POINTS_NUM = exports.nnColorAssignment = exports.requiredColumns = exports.colorAssignment = exports.s3BucketList = void 0;
var s3BucketList = [// {
//   name: "free form 2D", 
//   bucket_name: "ideal-dataset-1",
//   file_name: "freeform_2d.csv",
//   color: "#8A8BD0",
// },
{
  name: "lattice 2D",
  bucket_name: "ideal-dataset-1",
  file_name: "lattice_2d.csv",
  color: "#FFB347"
} // {
//   name: "larget dataset", 
//   bucket_name: "ideal-dataset-1",
//   file_name: "large_dataset_cleaned.csv",
//   color: "#FFC0CB"
// }
];
exports.s3BucketList = s3BucketList;
var colorAssignment = ["#FFB347", "#8A8BD0", "#FFC0CB", '#6FA8DC', '#8FCE00', '#CC0000', '#38761D', '#9FC5E8', '#2f3b45', '#e8c29f'];
exports.colorAssignment = colorAssignment;
var requiredColumns = ["symmetry", "unit_cell_x", "unit_cell_y", "geometry_full", 'C11', 'C12', 'C22', 'C16', 'C26', 'C66'];
exports.requiredColumns = requiredColumns;
var nnColorAssignment = ["#EA1A7F", "#FEC603", "#A8F387", "#16D6FA", '#6020a4'];
exports.nnColorAssignment = nnColorAssignment;
var MAX_DATA_POINTS_NUM = 1000;
exports.MAX_DATA_POINTS_NUM = MAX_DATA_POINTS_NUM;