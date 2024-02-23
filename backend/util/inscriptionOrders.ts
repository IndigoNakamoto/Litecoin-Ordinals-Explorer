// backend/util/inscriptionOrders.ts

import { Pool } from 'pg';

// Initialize the pool with your database connection details
const pool = new Pool({
    user: 'ord_lite_user',  // Use the actual username from docker-compose.yml
    password: 'ord_lite_pass',  // Use the actual password from docker-compose.yml
    host: 'localhost',  // Use 'localhost' if running from the host machine
    port: 5432,  // Default PostgreSQL port
    database: 'ord_lite_db',  // Use the actual database name from docker-compose.yml
});



// Pseudo code, notes, and examples. 





// -- Encrypt sensitive data before inserting into the table
// INSERT INTO inscription_orders (customer_name, customer_email, encrypted_data)
// VALUES (
//     'John Doe', 
//     'john@example.com', 
//     pgp_sym_encrypt('Sensitive data', 'encryption_key')
// );

// -- Decrypt data when retrieving from the table
// SELECT order_id, customer_name, customer_email, pgp_sym_decrypt(encrypted_data, 'encryption_key') AS decrypted_data
// FROM inscription_orders;


/* 
~~~Description: Bash script example to programatically inscribe a file onto Litecoin~~~

# Specify the directory where the files are located.
dir="/Users/indigo/Dev/ord-litecoin/target/release/numbers"

# Iterate over all files in the directory.
for filepath in "$dir"*
do
    while true
    do
        # Get the base name of the file (i.e., the file name without the path).
        filename=$(basename "$filepath")

        echo "INSCRIBING: $filename"
        output=$(./ord --cookie-file "/Users/indigo/Library/Application Support/Litecoin/.cookie" --data-dir "/Users/indigo/Library/Application Support/Litecoin/" wallet inscribe "$filepath" --fee-rate 1.1 2>&1)
        
        if [[ $output == *"error:"* ]]  # Checking if the output contains "error:"
        then
            echo "Error occurred for $filename."
            echo "$output"
            sleep 75s
        else
            break
        fi
    done
done

echo "All done"
*/
