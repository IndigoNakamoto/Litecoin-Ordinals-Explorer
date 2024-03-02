# Provider Controller API Documentation

## Overview

Litescribe, Unisat, Metamask extension wallet interface

The `ProviderController` class extends the `BaseController` to interact with cryptocurrency wallet functionalities. It manages account requests, network switches, transaction signing, and various wallet queries within a permissioned environment, leveraging the `permissionService`, `sessionService`, and the `wallet` object.

## API Endpoints

### `requestAccounts`

- **Description**: Requests the current account's address if the requester has the necessary permissions.
- **Parameters**:
  - `session`: An object containing the session's origin.
- **Returns**: An array containing the current account's address.
- **Errors**:
  - Throws an unauthorized error if the requester lacks permissions.

### `getAccounts`

- **Description**: Retrieves the current account's address if the requester has the necessary permissions. Marked as safe.
- **Parameters**:
  - `session`: An object containing the session's origin.
- **Returns**: An array containing the current account's address.

### `getNetwork`

- **Description**: Fetches the name of the current network. Marked as safe.
- **Returns**: The name of the current network.

### `switchNetwork`

- **Description**: Switches the current network if the requested network is valid and different from the current one.
- **Parameters**:
  - `req`: Request object containing the network type to switch to.
- **Returns**: The name of the newly switched network.

### `getPublicKey`

- **Description**: Retrieves the public key of the current account. Marked as safe.
- **Returns**: The public key of the current account.

### `getInscriptions`

- **Description**: Fetches inscriptions associated with the current account. Marked as safe.
- **Parameters**:
  - `req`: Request object containing pagination parameters `cursor` and `size`.
- **Returns**: An object containing a list of inscriptions and the total count.

### `getBalance`

- **Description**: Retrieves the balance of the current account. Marked as safe.
- **Returns**: An object containing confirmed, unconfirmed, and total balances in satoshis.

### `sendBitcoin`

- **Description**: Sends Bitcoin to a specified address.
- **Parameters**:
  - `approvalRes`: Object containing the PSBT hex string.
- **Returns**: Transaction ID of the pushed transaction.

### `sendInscription`

- **Description**: Sends an inscription transaction.
- **Parameters**:
  - `approvalRes`: Object containing the PSBT hex string.
- **Returns**: Transaction ID of the pushed transaction.

### `signMessage`

- **Description**: Signs a message with the current account's private key.
- **Parameters**:
  - `data`: Object containing the message text and type.
- **Returns**: The signed message.

### `pushTx`

- **Description**: Pushes a raw transaction to the network.
- **Parameters**:
  - `data`: Object containing the raw transaction hex.
- **Returns**: Transaction ID of the pushed transaction.

### `signPsbt`

- **Description**: Signs a PSBT with the current account's private key.
- **Parameters**:
  - `data`: Object containing the PSBT hex string and options.
- **Returns**: The signed PSBT hex string.

### `multiSignPsbt`

- **Description**: Signs multiple PSBTs.
- **Parameters**:
  - `data`: Object containing an array of PSBT hex strings and options.
- **Returns**: An array of signed PSBT hex strings.

### `pushPsbt`

- **Description**: Pushes a PSBT transaction to the network.
- **Parameters**:
  - `data`: Object containing the PSBT hex string.
- **Returns**: Transaction ID of the pushed transaction.

### `getVersion`

- **Description**: Retrieves the current version of the API. Marked as safe.
- **Returns**: The API version string.

### `isAtomicalsEnabled`

- **Description**: Checks if Atomicals feature is enabled. Marked as safe.
- **Returns**: Boolean indicating if Atomicals is enabled.

## Utilities

### `formatPsbtHex`

- **Description**: Formats a PSBT hex string for processing.
- **Parameters**:
  - `psbtHex`: The PSBT hex string.
- **Returns**: Formatted PSBT hex string.
- **Errors**:
  - Throws an error if the PSBT is invalid.

## Notes

- Methods marked with `@Reflect.metadata('SAFE', true)` are considered safe for access without explicit approval.
- Methods requiring approval have a corresponding `@Reflect.metadata('APPROVAL', [...])` decorator, detailing the type of approval required.
- Error handling is crucial for methods that interact with blockchain transactions to ensure user safety and data integrity.
- The API is designed to work within a permissioned environment, where access to certain functionalities is restricted based on the origin of the request and existing permissions.
