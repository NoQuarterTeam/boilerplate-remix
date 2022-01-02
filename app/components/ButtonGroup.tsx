import * as c from "@chakra-ui/react"

export function ButtonGroup(props: c.ButtonGroupProps) {
  return (
    <c.ButtonGroup spacing={4} display="flex" justifyContent="flex-end" alignItems="center" {...props}>
      {props.children}
    </c.ButtonGroup>
  )
}
