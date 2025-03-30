import json
import uuid
import random
import os
from datetime import datetime, timedelta
from faker import Faker

fake = Faker()

def load_product_data(file_paths):
    """Load product data from multiple json files."""
    all_products = []
    
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    products = json.load(f)
                    print(f"Successfully loaded {len(products)} products from {file_path}")
                    all_products.extend(products)
            else:
                print(f"Warning: {file_path} not found. Skipping.")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
    
    return all_products

def extract_price(product):
    """Extract price from product data if available."""
    try:
        if "priceInfo" in product and "currentPrice" in product["priceInfo"]:
            return product["priceInfo"]["currentPrice"]["price"]
        return None
    except (KeyError, TypeError):
        return None

def generate_random_data(product_data, num_transactions=1, min_products=1, max_products=3):
    """Generate random customer transaction data."""
    
    # Create merchant data
    merchant = {
        "id": 45,
        "name": "Walmart"
    }
    
    # Generate transactions
    transactions = []
    for _ in range(num_transactions):
        # Generate a random date within the last year
        random_date = datetime.now() - timedelta(days=random.randint(0, 365))
        formatted_date = random_date.strftime("%Y-%m-%dT00:00:00+00:00")
        
        # Generate random order status
        order_status = random.choice(["ORDERED", "SHIPPED", "DELIVERED"])
        
        # Generate random product list
        num_products = random.randint(min_products, max_products)
        products = []
        
        # Calculate the total price based on products
        total_price = 0
        
        # Make sure we don"t exceed the number of available products
        num_products = min(num_products, len(product_data)) if product_data else num_products
        
        # Select random products without replacement if possible
        if product_data:
            selected_products = random.sample(product_data, num_products) if len(product_data) >= num_products else random.choices(product_data, k=num_products)
        else:
            selected_products = []
        
        for product in selected_products:
            product_name = product.get("name", "Unknown Product")
            product_id = product.get("usItemId", str(random.randint(10000000, 99999999)))
            
            # Try to extract the actual price from product data
            extracted_price = extract_price(product)
            # Use the extracted price or generate a random one if not available
            product_price = extracted_price
            
            # Ensure we have a numeric price
            product_price = float(product_price)
                
            product_price = round(product_price, 2)
            total_price += product_price
            
            product_obj = {
                "external_id": product_id,
                "name": product_name,
                "url": f"https://www.walmart.com/ip/{product_id}",
                "quantity": 1,
                "eligibility": [],
                "price": {
                    "sub_total": product_price,
                    "total": product_price,
                    "unit_price": product_price
                }
            }
            products.append(product_obj)
        
        # If no products were found in the files, create some dummy products
        if not products:
            for _ in range(num_products):
                product_name = f"Sample Product {random.randint(1, 1000)}"
                product_id = str(random.randint(10000000, 99999999))
                
                # Generate random product price between $5 and $100
                product_price = round(random.uniform(5.0, 100.0), 2)
                total_price += product_price
                
                product_obj = {
                    "external_id": product_id,
                    "name": product_name,
                    "url": f"https://www.walmart.com/ip/{product_id}",
                    "quantity": 1,
                    "eligibility": [],
                    "price": {
                        "sub_total": product_price,
                        "total": product_price,
                        "unit_price": product_price
                    }
                }
                products.append(product_obj)
        
        # Round total price to 2 decimal places
        total_price = round(total_price, 2)
        
        # Generate random card info
        card_brands = ["VISA", "MASTERCARD", "AMEX", "DISCOVER"]
        card_info = {
            "external_id": str(random.randint(100000, 999999)),
            "type": "CARD",
            "brand": random.choice(card_brands),
            "last_four": "".join(random.choices('0123456789', k=4)),
            "name": None,
            "transaction_amount": round(random.uniform(0.1, total_price), 2)
        }
        
        # Create transaction object
        transaction = {
            "id": str(uuid.uuid4()),
            "external_id": str(uuid.uuid4()),
            "datetime": formatted_date,
            "url": f"https://www.walmart.com/orders/{random.randint(10000, 99999)}",
            "order_status": order_status,
            "payment_methods": [card_info],
            "price": {
                "sub_total": total_price,
                "adjustments": [],
                "total": total_price,
                "currency": "USD"
            },
            "products": products
        }
        
        transactions.append(transaction)
    
    # Combine into final data structure
    data = {
        "merchant": merchant,
        "transactions": transactions
    }
    
    return data

def save_to_file(data, filename="customer_data.json"):
    """Save the generated data to a JSON file."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    print(f"Data saved to {filename}")

def main():
    # Define file paths for product data
    product_files = [
        "allergies.json",
        "products.json",
        "nutrition.json",
        "vitamins.json"
    ]
    
    # Load all product data from the different files
    all_products = load_product_data(product_files)
    
    # Print summary of loaded products
    print(f"Total products loaded: {len(all_products)}")
    
    
    # Generate random customer data with 1-3 transactions
    data = generate_random_data(all_products, num_transactions=random.randint(3, 6))
    
    # Save to file
    save_to_file(data)
    
    # Print a sample to console
    print("\nSample generated data:")
    print(json.dumps(data, indent=4))

if __name__ == "__main__":
    main()