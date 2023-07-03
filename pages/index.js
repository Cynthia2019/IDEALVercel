import Link from 'next/link';
import dynamic from "next/dynamic";
import Pairwise from "./pairwise";
import processData from '@/util/processData';
import {ListObjectsCommand, S3Client} from '@aws-sdk/client-s3';
import {colorAssignment, s3BucketList} from '@/util/constants'
import { csvParse } from 'd3'
import { useState, useEffect } from 'react';
import s3Client from "@/pages/api/aws";


export default function Home({fetchedNames}) {
    // useEffect(() => {
    //     const data = []
    //     s3BucketList.map(async(info, i) => await fetchData(info, data))
    //     setDatasets(data)
    // }, [])
    return (
        <div>
            <Pairwise
                // fetchedNames={fetchedNames}
            />
        </div>
    );
}

// export async function fetchNames() {
//     let fetchedNames = []
//     const listObjectCommand = new ListObjectsCommand({
//         Bucket: 'ideal-dataset-1',
//         cacheControl: "no-cache",
//     })
//     await s3Client.send(listObjectCommand).then((res) => {
//         const names = res.Contents.map(content => content.Key)
//         for (let i = 0; i < names.length; i++) {
//             fetchedNames.push({
//                 bucket_name: 'ideal-dataset-1',
//                 name: names[i],
//                 color: colorAssignment[i]
//             })
//         }
//     })
//     return {
//         props: {
//             fetchedNames: fetchedNames
//         }
//     }
// }




