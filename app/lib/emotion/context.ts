import * as React from "react"

export interface ServerStyleContextData {
  key: string
  ids: Array<string>
  css: string
}

export const ServerStyleContext = React.createContext<ServerStyleContextData[] | null>(null)

export interface ClientStyleContextData {
  reset: () => void
}

export const ClientStyleContext = React.createContext<ClientStyleContextData | null>(null)
