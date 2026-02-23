#!/usr/bin/env python3
"""
Update hasFullData field for companies that have financial data.
Reads financials.json to get list of companyIds with financial data,
then updates companies.json to set hasFullData=true for matching companies.
"""
import json
from pathlib import Path

# Define data paths
DATA_DIR = Path(__file__).parent.parent / "data"
FINANCIALS_PATH = DATA_DIR / "financials.json"
COMPANIES_PATH = DATA_DIR / "companies.json"

def load_json(filepath):
    """Load JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filepath):
    """Save JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("Loading financials.json...")
    financials = load_json(FINANCIALS_PATH)

    # Extract company IDs from financials
    company_ids_with_financials = {entry['companyId'] for entry in financials}
    print(f"Found {len(company_ids_with_financials)} companies with financial data")
    print(f"Company IDs: {sorted(company_ids_with_financials)}")

    print("\nLoading companies.json...")
    companies = load_json(COMPANIES_PATH)

    # Update hasFullData for companies with financial data
    updated_count = 0
    for company in companies:
        if company['id'] in company_ids_with_financials:
            if company.get('hasFullData') != True:
                company['hasFullData'] = True
                updated_count += 1

    print(f"\nUpdated {updated_count} companies with hasFullData=true")

    print("\nSaving companies.json...")
    save_json(companies, COMPANIES_PATH)

    print("\n=== Summary ===")
    print(f"Total companies with financial data: {len(company_ids_with_financials)}")
    print(f"Companies updated: {updated_count}")
    print("Done!")

if __name__ == "__main__":
    main()
