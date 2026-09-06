import * as Comlink from 'comlink'
import { solve } from './solve'

const api = { solve }
export type SolveWorkerApi = typeof api

Comlink.expose(api)
