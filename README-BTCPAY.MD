ssh -i id_rsa_pro root@64.23.164.210


sudo apt update 
sudo apt upgrade 
sudo apt install screen
git clone https://github.com/btcpayserver/btcpayserver-docker 
cd btcpayserver-docker

export BTCPAY_HOST="payment.ordlite.com"
export BTCPAYGEN_CRYPTO1="LTC"
export NBITCOIN_NETWORK="mainnet"
export BTCPAYGEN_LIGHTNING="none"
export BTCPAYGEN_REVERSEPROXY="nginx"
export BTCPAYGEN_ENABLE_SSH="true"
export BTCPAYGEN_ADDITIONAL_FRAGMENTS="opt-save-storage-xs"

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

. ./btcpay-setup.sh -i
