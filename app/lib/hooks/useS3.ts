import * as React from "react"
import dayjs from "dayjs"

export const formatFileName = (filename: string): string => {
  const type = filename.split(".").pop()
  let name = filename
    .split(".")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
  name = dayjs().format("YYYYMMDDHHmmss") + "-" + name
  if (type) {
    name = name + "." + type.toLowerCase()
  }
  return name
}

interface Props {
  path?: string
}

export type UploadFile = {
  fileUrl: string
  fileKey: string
  fileName: string
  fileType: string | null
}
export function useS3Upload(
  props?: Props,
): [(file: File, lazyProps?: Props) => Promise<UploadFile>, { isLoading: boolean }] {
  const [isLoading, setIsLoading] = React.useState(false)

  async function upload(file: File, lazyProps?: Props) {
    try {
      setIsLoading(true)
      let parsedKey = props?.path || lazyProps?.path || "/unknown"
      if (parsedKey[parsedKey.length - 1] === "/") {
        parsedKey = parsedKey.slice(0, -1)
      }
      if (parsedKey[0] === "/") {
        parsedKey = parsedKey.substring(1)
      }
      const formattedName = formatFileName(file.name)
      const key = parsedKey + "/" + formattedName

      const formData = new FormData()
      formData.append("key", key)
      formData.append("contentType", file.type)
      const res = await fetch("/api/s3/createSignedUrl", {
        method: "post",
        body: formData,
      })
      const signedUrl = await res.json()
      if (!signedUrl) throw new Error("Error fetching signed url")
      await fetch(signedUrl.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      setIsLoading(false)
      return {
        fileUrl: signedUrl.url,
        fileKey: key,
        fileName: file.name,
        fileType: file.type || null,
      }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return [upload, { isLoading }]
}
