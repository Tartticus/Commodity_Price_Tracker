import requests
import datetime
from datetime import date, timedelta
import pandas as pd
import csv
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import yfinance as yf

today_date = date.today()
yesterday = (date.today() - timedelta(days=3)).strftime("%Y-%m-%d")

#%% Egg URL

##api key from st louis fed
api_key_eggs = "Your Api key"
series_id = "APU0000708111"
url = f"https://api.stlouisfed.org/fred/series/observations?series_id={series_id}&api_key={api_key_eggs}&file_type=json"


response = requests.get(url)
data = response.json()


if data['observations']:
    observation = data['observations'][-1]
   
else:
    print("No data available for the specified date range.")

egg_price = round(float(observation['value']),2)
#%% gas 

api_key_gas = 'Your API Key'
  # Example series ID, you need to verify this

url = f"https://api.eia.gov/v2/petroleum/pri/gnd/data/?frequency=weekly&data[0]=value&start={yesterday}&sort[0][column]=period&sort[0][direction]=desc&api_key={api_key_gas}&offset=0&length=5000"

response = requests.get(url)
data = response.json()

gas_data = data['response']['data']
# Check if 'data' is in the response
US_prices = []
for entry in gas_data:
    
    # Check if the 'area-name' is USA
    if entry['area-name'] == 'U.S.':
        US_prices.append(float(entry['value'])) 
        print(f"Date: {entry['period']}, Gas Price: {entry['value']}")
    
    

average_gas_price = round(sum(US_prices) / len(US_prices),2)
print(f"\nAverage Gas Price: {average_gas_price:.2f}")
    


#%% dow jones



# Fetch Dow Jones data
dow_jones = yf.Ticker("^DJI")
dow_data = dow_jones.history(period="1d")  # Get today's data

# Print the latest price
dow_jones = round(float(dow_data['Close'].iloc[-1]),2)
print(f"Dow Jones Industrial Average (DJIA) latest price: ${dow_jones}")
    

#%% grocery index

import requests

api_key = "YOUR_BLS_API_KEY"
series_id = "CUUR0000SAF111"  # This is for Food at home index

url = f"https://api.bls.gov/publicAPI/v2/timeseries/data/"
headers = {'Content-type': 'application/json'}
data = {
    "seriesid": [series_id],
    "startyear": "2020",
    "endyear": "2025",
    "catalog": True,
    "calculations": True,
    "annualaverage": True
}

response = requests.post(url, headers=headers, json=data)
result = response.json()


grocery_data = result['Results']['series'][-1]
latest_grocery = grocery_data['data'][0]

#Convert to float
grocery_index = round(float(latest_grocery['value']),2)


print(f"price or groceries for {today_date}: {grocery_index}")



#%% approval rating

# URL for the JSON data of Trump's approval ratings
url = "https://projects.fivethirtyeight.com/trump-approval-ratings/approval.json"

# Fetch the data
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    data = response.json()
    
    # The latest approval rating will be the first entry in the list
    latest_approval = round(float(data[-1]['approve_estimate']),2)
    
    # Assuming the structure where 'approve_estimate' is the key for approval rating
    print(f"Latest Approval Rating for Donald Trump: {latest_approval}%")
else:
    print("Failed to retrieve data. Status code:", response.status_code)
