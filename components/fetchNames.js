import { ListObjectsCommand } from "@aws-sdk/client-s3";
import s3Client from "@/pages/api/aws";
import { colorAssignment } from "@/util/constants";

export async function fetchNames() {
    let fetchedNames = []
    const listObjectCommand = new ListObjectsCommand({
        Bucket: 'ideal-dataset-1',
        // cacheControl: "no-cache",
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
        fetchedNames: fetchedNames
    }
}