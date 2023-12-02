const express = require("express");
const app = express();
const cors = require("cors");
const fileUplaod = require("express-fileupload");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const BWIP = require("bwip-js");

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUplaod());

app.get("/", (req, res, next) => {
  res.status(200).sendFile(__dirname + "/public/");
});
// for frotend image
app.get("/october.png", (req, res, next) => {
  res.status(200).sendFile(__dirname + "/assets/images/october.png");
});
// for frotend font
app.get("/OctinSportsRg.otf", (req, res, next) => {
  res.status(200).sendFile(__dirname + "/assets/fonts/OctinSportsRg.otf");
});
app.get("/YatiNormal.ttf", (req, res, next) => {
  res.status(200).sendFile(__dirname + "/assets/fonts/YatiNormal.ttf");
});
app.get("/YatiVariable.ttf", (req, res, next) => {
  res.status(200).sendFile(__dirname + "/assets/fonts/YatiVariable.ttf");
});

// Barcode generation route
app.get("/barcode", async (req, res, next) => {
  try {
    const barcodeValue = "517744889550";
    const barcodeImageBuffer = await generateBarcode(barcodeValue);

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': barcodeImageBuffer.length
    });
    res.end(barcodeImageBuffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Function to generate barcode image
function generateBarcode(value) {
  return new Promise((resolve, reject) => {
    BWIP.toBuffer({
      bcid: "code2of5",       
      text: value,       
      scale: 16,           
      height: 10,           
      includetext: true,    
      textxalign: "center",
    }, (err, png) => {
      if (err) {
        reject(err);
      } else {
        resolve(png);
      }
    });
  });
}

app.get("/download", async (req, res, next) => {
  try {
    const lottery_labels = [
      { 1: "ONE" },
      { 2: "TWO" },
      { 3: "THR" },
      { 4: "FOU" },
      { 5: "FIV" },
      { 6: "SIX" },
      { 7: "SEV" },
      { 8: "EIG" },
      { 9: "NIN" },
      { 0: "ZER" },
    ];
    const lottery_nums = ['1','2','3','1','8','6']
    const selector = ".capture";
    nodeHtmlToImage({
      output: "./ticket.png",
      handlebarsHelpers: {
        equals: (a, b) => a === b,
      },
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <title>Thai 6D E-Ticket</title>
          <style>
            @font-face {
              font-family: "OctinFont";
              src: url("http://localhost:4444/OctinSportsRg.otf") format("woff");
            }
            @font-face {
              font-family: "YatiFont";
              src: url("http://localhost:4444/YatiRegular.ttf") format("woff"),
                url("http://localhost:4444/YatiVariable.ttf") format("woff");
            }
            .octin-font {
              font-family: "OctinFont", Times, serif;
            }
            .yati-font {
              font-family: "YatiFont", Times, serif;
            }
          </style>
        </head>
        <body>
          <div class="w-[500px] mx-auto bg-white p-3 rounded-lg shadow-md capture">
            <div class="w-full relative">
              <img class="w-full" src="http://localhost:4444/october.png" alt="october" />
              <div
                class="w-[205px] absolute top-[13px] flex justify-center gap-[6px] right-[45px] text-center octin-font"
              id='lottery_nums' > 
                <div>
                  <p class="text-[21px] text-slate-700">2</p>
                  <p class="text-[14px] translate-y-[-7.5px] text-slate-600">TWO</p>
                </div>
                <div>
                  <p class="text-[21px] text-slate-700">4</p>
                  <p class="text-[14px] translate-y-[-7.5px] text-slate-600">FOU</p>
                </div>
                <div>
                  <p class="text-[21px] text-slate-700">8</p>
                  <p class="text-[14px] translate-y-[-7.5px] text-slate-600">EIG</p>
                </div>
                <div>
                  <p class="text-[21px] text-slate-700">3</p>
                  <p class="text-[14px] translate-y-[-7.5px] text-slate-600">THR</p>
                </div>
                <div>
                  <p class="text-[21px] text-slate-700">2</p>
                  <p class="text-[14px] translate-y-[-7.5px] text-slate-600">TWO</p>
                </div>
              </div>
              <!-- end for number and label -->
              <div
                class="w-[180px] absolute top-[35%] translate-y-[-35%] flex justify-center gap-[6px] right-[59px] text-center octin-font"
              >
                <div class="text-slate-700 text-[18px]">01 DEC 2023</div>
              </div>
              <!-- end for lottery date  -->
              <div
                class="w-[180px] bg-blue-600 absolute top-[50%] translate-y-[-50%] flex justify-center gap-[6px] right-[59px] text-center yati-font"
              >
                <div class="text-white py-[3px] text-[13px]">
                  ဘတ်ခြောက်သန်းဆုကြီးပေါက်ပါစေ
                </div>
              </div>
              <!-- end for name  -->
              <div
                class="w-[180px] absolute top-[67%] translate-y-[-67%] flex justify-center gap-[6px] right-[59px] text-center octin-font"
              >
                <div class="text-slate-700 text-[15px]">01-12-2023, 12:37:56 PM</div>
              </div>
              <!-- end for bet date  -->
              <div
                class="w-[180px] absolute top-[90%] translate-y-[-90%] flex justify-center gap-[6px] right-[59px] text-center octin-font"
              >
                <img src="http://localhost:4444/barcode" alt="Barcode">
              </div>
              <!-- end for barcode  -->
            </div>
          </div>
        </body>
        <script
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
          crossorigin="anonymous"
        ></script>
        <script>
        </script>
      </html>
      `,
      selector: selector,
    }).then((output) => res.status(200).download("./ticket.png", () => {
      fs.unlinkSync("./ticket.png");
    }));
    
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
// Start the server
const PORT = 4444;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
