import * as React from "react"
import * as c from "@chakra-ui/react"
import { withEmotionCache } from "@emotion/react"
import { MetaFunction } from "@remix-run/node"
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "@remix-run/react"

import { ClientStyleContext, ServerStyleContext } from "~/lib/emotion/context"
import { theme } from "~/lib/theme"

export const meta: MetaFunction = () => {
  return { title: "Boilerplate" }
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error("Boundary:", error)
  return (
    <Document>
      <c.VStack h="100vh" justify="center" p={20}>
        <c.Heading>There was an error</c.Heading>
        <c.Text>{error.message}</c.Text>
        <hr />
        <c.Text>Hey, developer, you should replace this with what you want your users to see.</c.Text>
      </c.VStack>
    </Document>
  )
}

export function CatchBoundary() {
  let caught = useCatch()
  let message
  switch (caught.status) {
    case 401:
      message = <c.Text>Oops! Looks like you tried to visit a page that you do not have access to.</c.Text>
      break
    case 404:
      message = <c.Text>Oops! Looks like you tried to visit a page that does not exist.</c.Text>
      break

    default:
      throw new Error(caught.data || caught.statusText)
  }

  return (
    <Document>
      <c.VStack h="100vh" justify="center" p={20}>
        <c.Heading>
          {caught.status}: {caught.statusText}
        </c.Heading>
        {message}
      </c.VStack>
    </Document>
  )
}

interface DocumentProps {
  children: React.ReactNode
}

const Document = withEmotionCache(({ children }: DocumentProps, emotionCache) => {
  const serverSyleData = React.useContext(ServerStyleContext)
  const clientStyleData = React.useContext(ClientStyleContext)

  // Only executed on client
  React.useEffect(() => {
    // re-link sheet container
    emotionCache.sheet.container = document.head
    // re-inject tags
    const tags = emotionCache.sheet.tags
    emotionCache.sheet.flush()
    tags.forEach((tag) => {
      ;(emotionCache.sheet as any)._insertTag(tag)
    })
    // reset cache to reapply global styles
    clientStyleData?.reset()
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
        {serverSyleData?.map(({ key, ids, css }) => (
          <style
            key={key}
            data-emotion={`${key} ${ids.join(" ")}`}
            dangerouslySetInnerHTML={{ __html: css }}
          />
        ))}
      </head>
      <body>
        <c.ChakraProvider theme={theme}>{children}</c.ChakraProvider>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  )
})
