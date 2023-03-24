import React from "react";
import Sidebar from "./Sidebar";
import {ListObjectsCommand} from "@aws-sdk/client-s3";
import s3Client from "@/pages/api/aws";
import {colorAssignment} from "@/util/constants";

const Layout = ({ children, fetchedNames }) => {
    return (
        <div className="h-screen flex flex-row justify-start">
            <Sidebar
                fetchedNames={fetchedNames}
            />
            <div className="bg-primary flex-1 p-4 text-white">
                {children}
            </div>
        </div>
    );
};
export async function getStaticProps() {
    let fetchedNames = []
    const listObjectCommand = new ListObjectsCommand({
        Bucket: 'ideal-dataset-1'
    })
    await s3Client.send(listObjectCommand).then((res) => {
        const names = res.Contents.map(content => content.Key)
        for (let i = 0; i < names.length; i++) {
            fetchedNames.push({
                bucket_name: 'ideal-dataset-1',
                name: names[i],
                color: colorAssignment[i]
            })
        }
    })
    return {
        props: {
            fetchedNames: fetchedNames
        }
    }
}
export default Layout;