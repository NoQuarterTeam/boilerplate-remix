import * as React from "react"
import { Button, ButtonProps } from "@chakra-ui/react"
import { Link } from "@remix-run/react"

interface Props extends ButtonProps {
  to: string
}
export const LinkButton: React.FC<Props> = (props) => {
  return (
    <Button as={Link} textDecor="none !important" {...props}>
      {props.children}
    </Button>
  )
}
