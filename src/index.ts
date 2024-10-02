import { createDbWorker, WorkerHttpvfs } from "sql.js-httpvfs";

const HEADERS = [
  "id",
  "title",
  "author",
  "year",
  "lang",
  "size",
  "ext",
  "md5",
  "ipfs_cid",
];

async function runQuery() {
  const workerUrl = new URL(
    "sql.js-httpvfs/dist/sqlite.worker.js",
    import.meta.url,
  );
  const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

  let worker: WorkerHttpvfs | undefined;

  worker = await createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "chunked",
          requestChunkSize: 1024,
          databaseLengthBytes: 1421419520,
          serverChunkSize: 20971520,
          urlPrefix: "../db/db.sqlite3.",
          suffixLength: 3,
        },
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString(),
  );

  clear();
  const query = document.querySelector<HTMLTextAreaElement>("#query");
  if (query) {
    let result: object[];
    const spinner = document.querySelector<HTMLDivElement>("#spinner");
    try {
      spinner?.classList.remove("hidden");
      result = (await worker?.db.query(query.value)) as object[];
    } catch (error) {
      let message;
      if (error instanceof Error) message = error.message;
      else message = String(error);
      writeMessage("Error: " + message, true);
      return;
    } finally {
      spinner?.classList.add("hidden");
    }
    if (result?.length > 0) {
      createTable(result);
    } else {
      writeMessage("No rows found.");
    }
  }
}

function writeMessage(msg: string, isErr: boolean = false) {
  clear();
  const p = document.querySelector<HTMLParagraphElement>("#message");
  if (p) {
    if (p.classList.contains("alert")) p.classList.remove("alert");
    p.innerText = msg;
    p.classList.remove("hidden");
    if (isErr) p.classList.add("alert");
  }
}

function clear() {
  const p = document.querySelector<HTMLParagraphElement>("#message");
  const thead = document.querySelector("thead");
  const tbody = document.querySelector("tbody");
  p?.classList.remove("alert");
  p?.classList.add("hidden");
  if (p) p.innerText = "";
  if (thead) thead.innerHTML = "";
  if (tbody) tbody.innerHTML = "";
}

function createTable(result: object[]) {
  clear();
  const headers = Object.keys(result[0]);
  headers.sort((a, b) => HEADERS.indexOf(a) - HEADERS.indexOf(b)); // sort by HEADERS
  const thead = document.querySelector("thead");
  if (thead) {
    thead.innerHTML = "";
    const tr = document.createElement("tr");
    thead.appendChild(tr);
    for (const header of headers) {
      const th = document.createElement("th");
      th.innerHTML = header;
      tr.appendChild(th);
    }
  }
  const tbody = document.querySelector("tbody");
  if (tbody) {
    tbody.innerHTML = "";
    for (const row of result) {
      const tr = document.createElement("tr");
      tbody.appendChild(tr);
      const rowArr = Object.entries(row);
      rowArr.sort((a, b) => HEADERS.indexOf(a[0]) - HEADERS.indexOf(b[0])); // sort by HEADERS
      for (const [key, value] of rowArr) {
        const td = document.createElement("td");
        td.innerHTML = value;
        tr.appendChild(td);
      }
    }
  }
}

document.querySelector("button")?.addEventListener("click", runQuery);

document
  .querySelector<HTMLInputElement>("#query")
  ?.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && (e.metaKey || e.ctrlKey)) {
      runQuery();
    }
  });
