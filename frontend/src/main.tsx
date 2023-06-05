import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";

import App from "./App.tsx";
import { AxiosClientProvider } from "./axiosContext.ts";
import "./index.css";

const queryClient = new QueryClient();
const axiosClient = axios.create();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AxiosClientProvider value={axiosClient}>
        <App />
      </AxiosClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
