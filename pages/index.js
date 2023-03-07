import Link from 'next/link';
import dynamic from "next/dynamic";
import Pairwise_page from "./pairwise_page";
import processData from '@/util/processData';
import { S3Client } from '@aws-sdk/client-s3';
import { s3BucketList } from '@/util/constants'
import { csvParse } from 'd3'
import { useState, useEffect } from 'react';

//   async function fetchData(info, allData) {
//     const command = new GetObjectCommand({
//         Bucket: info.bucket_name,
//         Key: info.file_name,
//       })
      
//       await s3Client.send(command).then((res) => {
//         let body = res.Body.transformToByteArray();
//         body.then((stream) => {
//           new Response(stream, { headers: { "Content-Type": "text/csv" } })
//             .text()
//             .then((data) => {
//              const processedData =  processData(csvParse(data))
//              allData.push(processedData)
//             });
//         });
//       });
//   }

export default function Home() {
    // useEffect(() => {
    //     const data = []
    //     s3BucketList.map(async(info, i) => await fetchData(info, data))
    //     setDatasets(data)
    // }, [])
    return (
        <div>
                <Pairwise_page />
        </div>
    );
}





