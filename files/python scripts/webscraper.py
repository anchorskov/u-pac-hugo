from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import csv
import time
import re

# Setup Selenium WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# Open the House of Representatives page
driver.get("https://www.house.gov/representatives")
time.sleep(5)  # Allow time for JavaScript to load

# Switch to 'By Last Name' tab
try:
    tab_element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "a.nav-link[href='#by-name']"))
    )
    tab_element.click()
    time.sleep(5)  # Allow time for content to load
except Exception as e:
    print("Error switching to 'By Last Name' tab:", e)

# Wait for table data to be fully loaded
try:
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//tbody/tr"))
    )
except Exception as e:
    print("Error: Table data did not load correctly.", e)
    driver.quit()
    exit()

# Step 1: Extract Full Representative Data in Raw Form
rows = driver.find_elements(By.XPATH, "//tbody/tr")
full_records = []
url_list = []

for row in rows:
    cells = row.find_elements(By.TAG_NAME, "td")
    row_data = [cell.text.strip() for cell in cells]  # Extract full raw row data
    name_element = row.find_element(By.TAG_NAME, "a")
    url = name_element.get_attribute("href") if name_element else ""
    
    if len(row_data) >= 6 and row_data[0]:  # Ensure the row contains all required fields and is not empty
        name = row_data[0].replace("(link is external)", "").strip()
        last_name = name.split(",")[0]  # Extract last name for matching
        district = row_data[1]
        party = row_data[2]
        phone = row_data[4]
        committees = row_data[5]
        
        # Extract State and District ID
        district_parts = district.rsplit(" ", 1)  # Split at last space
        if len(district_parts) > 1 and re.search(r'\d', district_parts[1]):
            state = " ".join(district_parts[:-1])  # Preserve full state name
            district_id = re.sub(r'[^0-9]', '', district_parts[-1]).zfill(2)  # Ensure 2-digit format
        else:
            state = district.replace("At Large", "").strip()  # Remove "At Large" from state name
            district_id = "At Large" if "At Large" in district or "Delegate" in district or "Resident Commissioner" in district else "Unknown"
        
        full_records.append([name, state, district_id, party, phone, committees, url])
        url_list.append((last_name, url))  # Store last name and URL separately

# Step 2: Write Cleaned Data to CSV
if full_records:
    with open("house_representatives_cleaned.csv", "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Name", "State", "District ID", "Party", "Phone", "Committee Assignments", "Website"])
        writer.writerows(full_records)
    print("Scraping complete! Cleaned data saved to house_representatives_cleaned.csv")
else:
    print("No valid data extracted. Check page structure or network issues.")

# Close the browser
driver.quit()
