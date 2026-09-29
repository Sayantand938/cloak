# cloak

A lightweight CLI tool to encrypt your `.env` files into a secure `.env.enc` file (using AES-256-GCM) and inject those secrets directly into your application's RAM—without ever writing decrypted secrets back to disk.

---

## 🚀 Quick Start Guide

### 1. Initialize your Master Key

Run this once on your machine to generate a secure master key. It will be saved automatically to `~/.env-encrypter.json`.

```bash
env-encrypter init
```

> ⚠️ **Important:** Back up this key somewhere safe (e.g., password manager). If you lose it, your encrypted files cannot be recovered.

---

### 2. Seal (Encrypt) Your `.env` File

Encrypt your existing `.env` file into a secure `.env.enc` file:

```bash
env-encrypter seal
```

* Defaults to reading `.env` and outputting `.env.enc`.
* Custom paths:
  ```bash
  env-encrypter seal -f .env.production -o .env.production.enc
  ```

Once encrypted, you can safely commit `.env.enc` to Git and delete or `.gitignore` your plain `.env`.

---

### 3. Run Your Application with Decrypted Secrets

Run any command or start your app. Secrets are decrypted **in RAM only** and injected into the process environment:

```bash
env-encrypter run -- node server.js
```

```bash
env-encrypter run -- npm run dev
```

* Custom encrypted file:
  ```bash
  env-encrypter run -f .env.production.enc -- npm start
  ```

---

### 4. View Secrets in Terminal (`reveal`)

Print the decrypted contents of `.env.enc` directly in your terminal:

```bash
env-encrypter reveal
```

* Custom file:
  ```bash
  env-encrypter reveal -f .env.staging.enc
  ```

---

### 5. Add or Update a Variable Directly (`set`)

Modify or add a variable inside the encrypted file without decrypting it manually:

```bash
env-encrypter set PORT 3000
env-encrypter set DATABASE_URL "postgres://user:pass@localhost:5432/db"
```

---

### 6. Forget / Remove Local Key

Remove the local master key configuration file (`~/.env-encrypter.json`):

```bash
env-encrypter forget
```

---

## 🔑 How Master Keys Are Loaded

When running commands that require decryption or encryption, `env-encrypter` looks for the master key in the following order:

1. **`~/.env-encrypter.yaml`** (if present)
2. **`~/.env-encrypter.json`** (created by `init`)
3. **`ENV_KEY` environment variable** (useful for CI/CD or production servers):
   ```bash
   export ENV_KEY="your_master_key_here"
   env-encrypter run -- npm start
   ```
4. **Interactive Prompt:** If no key is found automatically, it will prompt you to enter the key in the terminal.

---

## 📋 Command Summary

| Command | Description |
| :--- | :--- |
| `env-encrypter init` | Generate a master key and save it locally |
| `env-encrypter seal` | Encrypt a plain `.env` into `.env.enc` |
| `env-encrypter run -- <cmd>` | Inject secrets in-memory and execute a command |
| `env-encrypter reveal` | Print decrypted secrets to the console |
| `env-encrypter set <KEY> <VALUE>` | Add/update a secret directly in `.env.enc` |
| `env-encrypter forget` | Delete the local saved key config |
