import * as React from "react"
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { LoaderFunction } from "remix"

import { Tile, TileBody, TileFooter, TileHeader, TileHeading } from "~/components/Tile"
import { requireUser } from "~/services/auth/auth.service"

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)
  return {}
}

export default function Settings() {
  const alertProps = useDisclosure()

  const cancelRef = React.useRef<HTMLButtonElement>(null)

  return (
    <Stack spacing={6}>
      <Tile>
        <TileHeader>
          <TileHeading>Danger zone</TileHeading>
        </TileHeader>
        <TileBody>
          <Text fontSize="sm">
            Permanently delete your account and all of its contents from the boilerplate. This action is not
            reversible – please continue with caution.
          </Text>
        </TileBody>
        <TileFooter>
          <Flex w="100%" justify="flex-end">
            <Button
              size="sm"
              colorScheme="red"
              // isDisabled={destroyLoading}
              // isLoading={destroyLoading}
              onClick={alertProps.onOpen}
            >
              Delete account
            </Button>
          </Flex>
          <AlertDialog
            {...alertProps}
            motionPreset="slideInBottom"
            isCentered
            leastDestructiveRef={cancelRef}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete account
                </AlertDialogHeader>
                <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={alertProps.onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    // onClick={handleDestroy}
                    // isLoading={destroyLoading}
                    // isDisabled={destroyLoading}
                    ml={3}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </TileFooter>
      </Tile>
    </Stack>
  )
}
