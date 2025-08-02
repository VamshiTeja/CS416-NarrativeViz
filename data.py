import pandas as pd
import urllib.request
import json

urls = {
    "confirmed": "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv",
    "deaths": "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv"
}

for name, url in urls.items():
    urllib.request.urlretrieve(url, f"{name}.csv")

confirmed = pd.read_csv('confirmed.csv')
deaths = pd.read_csv('deaths.csv')
date_cols = confirmed.columns[4:]

# Global aggregated data
global_confirmed = confirmed[date_cols].sum(axis=0)
global_deaths = deaths[date_cols].sum(axis=0)

df = pd.DataFrame({
    'date': pd.to_datetime(date_cols),
    'confirmed': global_confirmed.values,
    'deaths': global_deaths.values
})

df.to_json('covid_global_timeseries.json', orient='records', date_format='iso')
print("Saved covid_global_timeseries.json")

# Country-level data processing
def process_country_data(df, metric):
    """Process country-level data and return top countries by total cases"""
    # Group by country and sum all dates
    country_totals = df.groupby('Country/Region')[date_cols].sum()
    
    # Get top 10 countries by total cases
    top_countries = country_totals.sum(axis=1).sort_values(ascending=False).head(10).index.tolist()
    
    # Process data for top countries
    country_data = []
    for country in top_countries:
        country_series = country_totals.loc[country]
        for date, value in zip(date_cols, country_series):
            country_data.append({
                'country': country,
                'date': pd.to_datetime(date).isoformat(),
                metric: int(value)
            })
    
    return country_data

# Process confirmed cases by country
confirmed_country_data = process_country_data(confirmed, 'confirmed')
deaths_country_data = process_country_data(deaths, 'deaths')

# Merge confirmed and deaths data by country and date
country_data = {}
for item in confirmed_country_data:
    key = (item['country'], item['date'])
    if key not in country_data:
        country_data[key] = {'country': item['country'], 'date': item['date'], 'confirmed': item['confirmed'], 'deaths': 0}
    else:
        country_data[key]['confirmed'] = item['confirmed']

for item in deaths_country_data:
    key = (item['country'], item['date'])
    if key in country_data:
        country_data[key]['deaths'] = item['deaths']

# Convert to list and save
country_list = list(country_data.values())
with open('covid_country_timeseries.json', 'w') as f:
    json.dump(country_list, f, indent=2)

print("Saved covid_country_timeseries.json")

# Create a summary of top countries
country_summary = {}
for item in country_list:
    country = item['country']
    if country not in country_summary:
        country_summary[country] = {'max_confirmed': 0, 'max_deaths': 0, 'total_confirmed': 0, 'total_deaths': 0}
    
    country_summary[country]['max_confirmed'] = max(country_summary[country]['max_confirmed'], item['confirmed'])
    country_summary[country]['max_deaths'] = max(country_summary[country]['max_deaths'], item['deaths'])
    country_summary[country]['total_confirmed'] = item['confirmed']  # Last value is total
    country_summary[country]['total_deaths'] = item['deaths']  # Last value is total

# Save country summary
with open('covid_country_summary.json', 'w') as f:
    json.dump(country_summary, f, indent=2)

print("Saved covid_country_summary.json")
print(f"Processed data for {len(country_summary)} countries")