import s3Client from "./aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import zlib from "zlib";
import { Readable } from "stream";

export const config = {
    api: {
      responseLimit: '20mb',
    },
  }

export default async (req, res) => {
    try {
        const command = new GetObjectCommand({
			// Bucket: info.bucket_name,
			Bucket: "ideal-dataset-1",
			Key: req.query.name,
		});

		const s3Response = await s3Client.send(command);
        res.status(200).send(s3Response);
        // if (s3Response.Body instanceof Readable) {
        //     const gunzip = zlib.createGunzip();
        //     // Set the appropriate response headers
        //     res.setHeader("Content-Type",  "application/json");
        //     // Pipe the S3 response stream to the API response stream
        //     s3Response.Body.pipe(gunzip).pipe(res);
        //   } else {
        //     throw new Error("Invalid response body");
        //   }
      

		// const decompressedData = zlib.gunzipSync(Body.transformToByteArray());

		// const jsonData = JSON.parse(decompressedData.toString("utf8"));

		// console.log(jsonData);
        // res.setHeader("Content-Type", "text/csv");
        // res.status(200).send(decompressedData.toString());
    }
    catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }

}