import * as React from "react"
import * as c from "@chakra-ui/react"
import { Form as RemixForm, FormProps as RemixFormProps } from "remix"

import { ActionData } from "~/lib/form"

interface FormProps extends RemixFormProps {
  form: ActionData<any> | undefined
}

export const FormContext = React.createContext<ActionData<any> | undefined>(undefined)

export const Form = React.forwardRef(function _Form(
  { form, ...props }: FormProps,
  ref: React.RefObject<HTMLFormElement>,
) {
  return (
    <FormContext.Provider value={form}>
      <RemixForm ref={ref} {...props}>
        {props.children}
      </RemixForm>
    </FormContext.Provider>
  )
})

interface FormFieldProps extends c.InputProps {
  name: string
  label: string
  input?: React.ReactElement
}

export function FormField({ label, input, ...props }: FormFieldProps) {
  const form = React.useContext(FormContext)
  const clonedInput =
    input &&
    React.cloneElement(input, { defaultValue: form?.data?.[props.name] || "", id: props.name, ...props })
  return (
    <c.FormControl isRequired={props.isRequired} isInvalid={!!form?.fieldErrors?.[props.name]}>
      <c.FormLabel htmlFor="email">{label}</c.FormLabel>
      {clonedInput || <c.Input defaultValue={form?.data?.[props.name] || ""} id={props.name} {...props} />}
      <c.FormErrorMessage>{form?.fieldErrors?.[props.name]?.[0]}</c.FormErrorMessage>
    </c.FormControl>
  )
}

export function FormError() {
  const form = React.useContext(FormContext)
  if (!form?.formError) return null
  return (
    <c.FormControl isInvalid={!!form?.formError}>
      <c.FormErrorMessage>{form?.formError}</c.FormErrorMessage>
    </c.FormControl>
  )
}
