import { ActionArgs, json } from "@remix-run/node"
import { z } from "zod"

import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { createSignedUrl } from "~/services/s3/s3.server"

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const creatSignedUrlSchema = z.object({ key: z.string(), contentType: z.string() })
  const { data, fieldErrors } = await validateFormData(creatSignedUrlSchema, formData)
  if (fieldErrors) return badRequest({ fieldErrors, data })
  return json(createSignedUrl(data))
}
