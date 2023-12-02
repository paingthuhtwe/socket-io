const express = require("express");
const app = express();
const cors = require("cors");
const fileUplaod = require("express-fileupload");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const BWIP = require("bwip-js");
const font2base64 = require('node-font2base64')

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUplaod());

app.get("/", (req, res, next) => {
  res.status(200).send({message: 'Welcome to generate eticket!'})
});
// for frotend image
app.get("/ticket/:lottery_type/:ticket_name", (req, res, next) => {
  res
    .status(200)
    .sendFile(
      __dirname +
        `/assets/images/${req.params.lottery_type}/${req.params.ticket_name}.png`
    );
});

// Barcode generation route
app.get("/barcode/:barcode_number", async (req, res, next) => {
  try {
    const barcodeValue = req.params.barcode_number;
    const barcodeImageBuffer = await generateBarcode(barcodeValue);

    res.end(barcodeImageBuffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Function to generate barcode image
function generateBarcode(value) {
  return new Promise((resolve, reject) => {
    BWIP.toBuffer(
      {
        bcid: "code2of5",
        text: value,
        scale: 16,
        height: 10,
        includetext: true,
        textxalign: "center",
      },
      (err, png) => {
        if (err) {
          reject(err);
        } else {
          resolve(png);
        }
      }
    );
  });
}

app.get(
  "/download/:lottery_num/:bet_name/:lottery_date/:bet_date/:barcode/:lottery_type/:ticket_name",
  async (req, res, next) => {
    try {
      const lottery_nums = req.params.lottery_num;
      const lottery_date = req.params.lottery_date;
      const bet_name = req.params.bet_name;
      const bet_date = req.params.bet_date;
      const barcode = req.params.barcode;
      const lottery_type = req.params.lottery_type;
      const ticket_name = req.params.ticket_name;
      const file_name = `${bet_name}_${lottery_nums}_${barcode}_E-Ticket.png`;

      const ticket_names = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      const lottery_labels = [
        { 0: "ZER" },
        { 1: "ONE" },
        { 2: "TWO" },
        { 3: "THR" },
        { 4: "FOU" },
        { 5: "FIV" },
        { 6: "SIX" },
        { 7: "SEV" },
        { 8: "EIG" },
        { 9: "NIN" },
      ];

      if (
        !lottery_nums ||
        !lottery_date ||
        !bet_name ||
        !bet_date ||
        !barcode ||
        !lottery_type ||
        !ticket_name
      ) {
        res.status(400).send("Missing required parameters");
        return;
      }
      if (!lottery_nums.length === 6) {
        res.status(400).send("Invalid lottery numbers");
        return;
      }
      if (!ticket_names.includes(ticket_name)) {
        res.status(400).send("Invalid ticket name");
        return;
      }
      if (lottery_type !== "one" && lottery_type !== "seven") {
        res.status(400).send("Invalid lottery type");
        return;
      }
      const convertNumberToString = (number) => {
        let result = [];
        number?.map((digit) => {
          const find = lottery_labels.find((num) => num[digit]);
          if (find) result.push({ num: digit, label: find[digit] });
        });
        return result;
      };
      const lottery_nums_html = convertNumberToString([...lottery_nums])
        .map((el) => {
          return `<div>
        <p class="text-[21px] text-slate-700">${el.num}</p>
        <p class="text-[14px] translate-y-[-7.5px] text-slate-600">${el.label}</p>
      </div>`;
        })
        .join("");

      const selector = ".capture";
      const _octin_font = font2base64.encodeToDataUrlSync('./assets/fonts/OctinSportsRg.otf')
      const _yati_regular_font = font2base64.encodeToDataUrlSync('./assets/fonts/YatiRegular.ttf')
      const _yati_variable_font = font2base64.encodeToDataUrlSync('./assets/fonts/YatiVariable.ttf')
      const image = fs.readFileSync(`./assets/images/${lottery_type}/${ticket_name}.png`);
      const base64Image = new Buffer.from(image).toString('base64');
      const imageURL = 'data:image/png;base64,' + base64Image;
      const base64Barcode = await generateBarcode(barcode).then(img => {return new Buffer.from(img).toString('base64')})
      const barcodeURL = 'data:image/png;base64,' + base64Barcode;
      nodeHtmlToImage({
        output: file_name,
        quality: 10,
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
              src: url("${_octin_font}") format("woff");
            }
            @font-face {
              font-family: "YatiFont";
              src: url("${_yati_regular_font}") format("woff"),
                url("${_yati_variable_font}") format("woff");
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
          <div class="w-[500px] mx-auto bg-white p-2 rounded-lg shadow-md capture">
            <div class="w-full relative">
              <img class="w-full" src="${imageURL}" alt="${ticket_name}" />
              <div
                class="w-[205px] absolute top-[13px] flex justify-center gap-[6px] right-[45px] text-center octin-font"
              id='lottery_nums' > 
               ${lottery_nums_html}
              </div>
              <!-- end for number and label -->
              <div
                class="w-[180px] absolute top-[35%] translate-y-[-35%] flex justify-center gap-[6px] right-[59px] text-center octin-font"
              >
                <div class="text-slate-700 text-[18px]">${lottery_date}</div>
              </div>
              <!-- end for lottery date  -->
              <div
                class="w-[180px] absolute top-[50%] translate-y-[-50%] flex justify-center gap-[6px] right-[59px] text-center yati-font ${
                  lottery_type === "one"
                    ? "text-blue-600"
                    : "bg-blue-600 text-white"
                }"
              >
                <div class="py-[3px] ${
                  bet_name.length > 16 ? "text-[13px]" : "text-[18px]"
                }">
                  ${bet_name}
                </div>
              </div>
              <!-- end for name  -->
              <div
                class="w-[180px] absolute top-[64%] translate-y-[-64%] flex justify-center gap-[6px] right-[59px] text-center octin-font"
              >
                <div class="text-slate-700 text-[15px]">${bet_date}</div>
              </div>
              <!-- end for bet date  -->
              <div
                class="w-[180px] absolute ${lottery_type === 'one' ? 'top-[99%] translate-y-[-99%]' : 'top-[95%] translate-y-[-95%]'} flex justify-center gap-[6px] right-[59px] text-center octin-font"
              >
                <img src="${barcodeURL}" alt="Barcode">
              </div>
              <!-- end for barcode  -->
            </div>
          </div>
        </body>
      </html>
      `,
        selector: selector,
      }).then(() =>
        res.status(200).download(`./${file_name}`, () => {
          fs.unlinkSync(`./${file_name}`);
        })
      );
    } catch (error) {
      res.status(500).send("Internal Server Error " + error.message);
    }
  }
);
// Start the server
const PORT = 4444;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
