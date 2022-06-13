# Twitch-Wallet Analyze
  

It's a simple tool to analyze your Twitch-Wallet and get some information   
about your money waste for Twitch.

For the Configuration you need your oauth, twitchID and the sha256hash of your account.

To get these tokens you need to request [TwitchWallet](https://twitch.tv/wallet) and  
get the values 
``oauth``, ``sha256hash`` and ``twitchID`` of the ``gql`` request   
with the operationName ``TransactionHistoryTab_UserPaymentTransactions``

You can get your TwitchID by requesting e.g. [here](https://api.ivr.fi/twitch/resolve/<YourUserName>)

## Installation

Install [Node.js](https://nodejs.org/), if you don't have it already.

**Clone** the repository:
```bash
git clone https://github.com/Florian2807/TwitchWalletAnalyze.git | cd TwitchWalletAnalyze
```
**Install** the dependencies:
```bash
npm install
```
To **Run** the server:
```bash
node index.js
```



## Configuration

Use the provided config.json file to set configuration options:

```js
{
    "oauth": "<your-oauth-token>", 
    "id": "<your-twitch-id>",
    "sha256Hash": "<your-sha256-hash>"
}
```