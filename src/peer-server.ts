import { PeerServer } from "peer";

PeerServer({ port: 443, path: "/", corsOptions: { origin: "*", credentials: true } });
