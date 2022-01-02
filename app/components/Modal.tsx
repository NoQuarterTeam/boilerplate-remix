import * as c from "@chakra-ui/react"

interface Props extends c.ModalProps {
  title?: string
}
export function Modal(props: Props) {
  return (
    <c.Modal {...props}>
      <c.ModalOverlay />
      <c.ModalContent borderRadius="md">
        <c.ModalCloseButton />
        {props.title && <c.ModalHeader pb={3}>{props.title}</c.ModalHeader>}
        <c.ModalBody mb={4}>{props.children}</c.ModalBody>
      </c.ModalContent>
    </c.Modal>
  )
}
