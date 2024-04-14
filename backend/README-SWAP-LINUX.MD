# Configure Swap Space
If increasing RAM is not feasible or if you need a temporary solution, configuring swap space could help. Swap acts as an overflow area that your system can use when RAM is fully utilized. To set up swap space, follow these steps:

## Create Swap File: Use the following commands to create a 1GB swap file (adjust size as needed):
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile


## Add to /etc/fstab:
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab


## Optimize Your Application
Based on the memory usage patterns, it's important to assess whether ord (and possibly other applications like postgres) can be optimized:

Check for Memory Leaks: Ensure that ord does not have memory leaks, which could progressively consume more memory over time.
Reduce Memory Usage: If possible, modify the application's configuration or its codebase to use less memory. This might involve optimizing data handling, caching mechanisms, or adjusting how much data is loaded into memory at once.