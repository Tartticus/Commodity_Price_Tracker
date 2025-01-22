function updateSpreadsheet() {
  const SHEET_ID = "Your sheet ID"; // Replace with your Google Sheets ID
  const SHEET_NAME = "Price_Tracker"; // Replace with your desired sheet name
 const EMAIL_RECIPIENT = "Your email (optional)"; // Replace with your email address

  const now = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(now.getDate() - 3);
  const threeDaysAgoFormatted = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}`;

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  // Fetch Egg Prices
  const eggApiKey = "Your API Key";
  const eggSeriesId = "APU0000708111";
  const eggUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${eggSeriesId}&api_key=${eggApiKey}&file_type=json`;

  const eggResponse = UrlFetchApp.fetch(eggUrl);
  const eggData = JSON.parse(eggResponse.getContentText());
  const eggPrice = eggData.observations.length > 0 ? parseFloat(eggData.observations[eggData.observations.length - 1].value).toFixed(2) : null;

  // Fetch Gas Prices
  const gasApiKey = "Your API Key";
  const gasUrl = `https://api.eia.gov/v2/petroleum/pri/gnd/data/?frequency=weekly&data[0]=value&start=${threeDaysAgoFormatted}&sort[0][column]=period&sort[0][direction]=desc&api_key=${gasApiKey}&offset=0&length=5000`;

  const gasResponse = UrlFetchApp.fetch(gasUrl);
  const gasData = JSON.parse(gasResponse.getContentText()).response.data;
  const usPrices = gasData.filter(entry => entry["area-name"] === "U.S.").map(entry => parseFloat(entry.value));
  const averageGasPrice = usPrices.length > 0 ? (usPrices.reduce((a, b) => a + b) / usPrices.length).toFixed(2) : null;

  // Fetch Dow Jones
  const dowJonesUrl = "https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI?range=1d&interval=1d";
  const dowResponse = UrlFetchApp.fetch(dowJonesUrl);
  const dowData = JSON.parse(dowResponse.getContentText());
  const dowClose = dowData.chart.result[0].indicators.quote[0].close[0].toFixed(2);

  // Fetch Grocery Index
  const groceryUrl = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
  const groceryPayload = {
    "seriesid": ["CUUR0000SAF111"],
    "startyear": "2020",
    "endyear": "2025",
    "catalog": true,
    "calculations": true,
    "annualaverage": true
  };
  const groceryOptions = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(groceryPayload),
  };

  const groceryResponse = UrlFetchApp.fetch(groceryUrl, groceryOptions);
  const groceryData = JSON.parse(groceryResponse.getContentText());
  const groceryValue = parseFloat(groceryData.Results.series[0].data[0].value).toFixed(2);

  // Fetch Trump Approval Rating
  const approvalUrl = "https://projects.fivethirtyeight.com/trump-approval-ratings/approval.json";
  const approvalResponse = UrlFetchApp.fetch(approvalUrl);
  const approvalData = JSON.parse(approvalResponse.getContentText());
  const latestApproval = approvalData.length > 0 ? parseFloat(approvalData[approvalData.length - 1].approve_estimate).toFixed(2) : null;

    // Update the spreadsheet
  sheet.appendRow([
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    eggPrice,
    averageGasPrice,
    dowClose,
    groceryValue,
    latestApproval
  ]);

  // Send email with the fetched data
const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

const emailBody = `
  Date: ${formattedDate}
  Egg Price: ${eggPrice}
  Average Gas Price: ${averageGasPrice}
  Dow Jones Close: ${dowClose}
  Grocery Index: ${groceryValue}
  Trump Approval Rating: ${latestApproval}
`;

  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: "Trump Price Tracker",
    body: emailBody
  });
}

