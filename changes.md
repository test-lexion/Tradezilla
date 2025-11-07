
 implementation to replace the static PnL page with a dynamic system that tracks user trade history using Supabase.
This solution will:
Define the necessary Supabase table structure.
Modify the trading logic to log every buy and sell transaction.
Completely overhaul the PnL page to fetch, calculate, and display dynamic PnL cards based on the user's actual trade history


Create the trade_history Table in Supabase
First, you need to set up the database table to store the transaction records.
Navigate to your Supabase project dashboard.
Go to the Table Editor section.
Click "New table".
Set the table name to trade_history.
Deselect "Enable Row Level Security (RLS)" for now to simplify development. You can enable it later and set up policies if needed.
Add the following columns:
Column Name	Type	Default Value	Is Nullable?
id	uuid	gen_random_uuid()	No
created_at	timestamptz	now()	No
user_wallet	text		No
trade_type	text		No
base_token_mint	text		No
base_token_symbol	text		Yes
base_token_amount	numeric		No
quote_token_symbol	text		Yes
quote_token_amount	numeric		No
transaction_value_usd	numeric		Yes
token_price_usd	numeric		Yes
