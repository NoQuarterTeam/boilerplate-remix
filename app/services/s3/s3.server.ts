import { s3 } from "~/lib/config.server"
import { s3Bucket, s3Url } from "~/lib/s3"

interface S3SignedUrlData {
  key: string
  contentType: string
}
export function createSignedUrl({ key, contentType }: S3SignedUrlData) {
  const s3Params = {
    Bucket: s3Bucket,
    Key: key,
    Expires: 60,
    ContentType: contentType,
    ACL: "public-read",
  }
  return { uploadUrl: s3.getSignedUrl("putObject", s3Params), key, url: s3Url + key }
}
