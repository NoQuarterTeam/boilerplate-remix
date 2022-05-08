import * as React from "react"
import { CgClose, CgSearch } from "react-icons/cg"
import * as c from "@chakra-ui/react"
import { useSearchParams } from "@remix-run/react"

interface Props extends c.BoxProps {
  placeholder?: string
}

export function Search({ placeholder, ...props }: Props) {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = React.useState(params.get("search") || "")

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!search && !params.get("search")) return
    const existingParams = Object.fromEntries(params)
    if (!search) {
      delete existingParams.search
    } else {
      existingParams.search = search
    }
    setParams(existingParams)
  }
  const clearSearch = () => {
    const existingParams = Object.fromEntries(params)
    delete existingParams.search
    setParams(existingParams)
    setSearch("")
  }

  const isPendingSearch = !!search || !!params.get("search")

  return (
    <c.Box>
      <form onSubmit={handleSubmit}>
        <c.InputGroup>
          <c.InputLeftElement w={10}>
            <c.IconButton
              type="submit"
              size="sm"
              aria-label="search"
              variant="ghost"
              icon={<c.Box as={CgSearch} />}
            />
          </c.InputLeftElement>
          {params.forEach(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <c.Input
            name="search"
            px={10}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            minW={{ base: 200, xl: 300 }}
            {...props}
          />
          <c.InputRightElement w={10}>
            {!!isPendingSearch && (
              <c.IconButton
                onClick={clearSearch}
                size="sm"
                aria-label="clear search"
                variant="ghost"
                icon={<c.Box as={CgClose} />}
              />
            )}
          </c.InputRightElement>
        </c.InputGroup>
      </form>
    </c.Box>
  )
}
