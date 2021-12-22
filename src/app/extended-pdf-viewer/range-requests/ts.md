```typescript
const http = require("http");
const port = process.env.PORT || 3000;

const { stat, createReadStream } = require("fs");
const { promisify } = require("util");
const { pipeline } = require("stream");
const samplePDF = "./demo.pdf";
const fileInfo = promisify(stat);

http
  .createServer(async (req, res) => {

    /** Calculate Size of file */
    const { size } = await fileInfo(samplePDF);
    const range = req.headers.range;
    console.log(size)

    /** Check for Range header */
    if (range) {
      /** Extracting Start and End value from Range Hea der */
      let [start, end] = range.replace(/bytes=/, "").split("-");
      start = parseInt(start, 10);
      end = end ? parseInt(end, 10) : size - 1;

      if (!isNaN(start) && isNaN(end)) {
        start = start;
        end = size - 1;
      }
      if (isNaN(start) && !isNaN(end)) {
        start = size - end;
        end = size - 1;
      }

      // Handle unavailable range request
      if (start >= size || end >= size) {
        // Return the 416 Range Not Satisfiable.
        res.writeHead(416, {
          "Content-Range": `bytes */${size}`
        });
        return res.end();
      }

      /** Sending Partial Content With HTTP Code 206 */
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "application/psdf",
        "Access-Control-Allow-Origin": "http://localhost:4200"
      });

      const readable = createReadStream(samplePDF, { start, end });
      pipeline(readable, res, err => {
        console.log(err);
      });

    } else {

      res.writeHead(200, {
        "Access-Control-Expose-Headers": "Accept-Ranges",
        "Access-Control-Allow-Headers": "Accept-Ranges,range",
        "Accept-Ranges": "bytes",
        "Content-Length": size,
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "http://localhost:4200"
      });

      if (req.method === "GET") {
          const readable = createReadStream(samplePDF);
          pipeline(readable, res, err => {
            console.log(err);
          });	   
      } else {
        res.end();
      }

    }
  })
  .listen(port, () => console.log("Running on 3000 port"));
```
