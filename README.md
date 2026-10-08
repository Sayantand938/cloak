<div align="center">

  # 🧥 cloak

  **AES-256-GCM encrypted `.env` file manager**  
  *Seal secrets. Inject in RAM. Never touch disk.*

  [![npm version](https://img.shields.io/npm/v/cloak.svg)](https://www.npmjs.com/package/cloak)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/SayantanD938/cloak/pulls)

</div>

---

**cloak** is a lightweight CLI tool that encrypts your `.env` files into a secure `.env.enc` blob (using **AES-256-GCM**) and injects those secrets directly into your application's RAM — **without ever writing decrypted secrets back to disk**.

- ✅ **Zero-disk plaintext** — secrets are decrypted in-memory only.
- ✅ **Authenticated encryption** — AES-256-GCM detects tampering.
- ✅ **CI/CD ready** — provide a master key via `$ENV_KEY`.
- ✅ **Git-friendly** — commit `.env.enc` safely, delete `.env`.
- ✅ **No config server required** — works offline, single binary.

---

## 📦 Installation

```bash
npm install -g cloak
# or
pnpm add -g cloak
```

> **Requirements**: Node.js 18+

---

## 🚀 Quick Start

### 1. Initialize a Master Key

```bash
cloak init
```

This generates a secure 256-bit key and saves it to `~/.env-encrypter.json`.

> ⚠️ **Back up this key** somewhere safe (e.g., a password manager). If you lose it, your encrypted files **cannot** be recovered.

### 2. Seal (Encrypt) Your `.env` File

```bash
cloak seal
```

This reads `.env` and creates `.env.enc`. Now you can commit `.env.enc` and delete (or `.gitignore`) the plain `.env`.

Custom paths:

```bash
cloak seal -f .env.production -o .env.production.enc
```

### 3. Run Your App with Secrets Injected

```bash
cloak run -- node server.js
cloak run -- npm run dev
```

Secrets are decrypted **in RAM only** and injected into `process.env` for the child process.

### 4. View Secrets (Reveal)

```bash
cloak reveal
```

Prints the decrypted contents of `.env.enc` to your terminal.

### 5. Modify a Secret (Set)

```bash
cloak set PORT 3000
cloak set DATABASE_URL "postgres://user:pass@localhost:5432/db"
```

Add or update a variable directly inside the encrypted file without manual decrypt/re-encrypt cycles.

### 6. Forget the Local Key

```bash
cloak forget
```

Deletes the local master key configuration file. You'll need to provide the key via `$ENV_KEY` or interactive prompt going forward.

---

## 🔑 How Master Keys Are Loaded

cloak resolves the master key in this priority order:

| Priority | Source | Example |
|---------|--------|---------|
| 1 | `~/.env-encrypter.yaml` | `master_key: "your-key"` |
| 2 | `~/.env-encrypter.json` | `{"master_key": "your-key"}` (created by `init`) |
| 3 | `$ENV_KEY` environment variable | `export ENV_KEY="your-master-key-here"` |
| 4 | Interactive prompt | Falls back if none of the above are found |

The `$ENV_KEY` approach is ideal for CI/CD pipelines and production servers:

```bash
export ENV_KEY="your-key"
cloak run -- npm start
```

---

## 📋 Command Reference

| Command | Description |
|---------|-------------|
| `cloak init [--force]` | Generate a master key and save it locally |
| `cloak seal [-f <input>] [-o <output>]` | Encrypt a `.env` into `.env.enc` |
| `cloak run [-f <file>] -- <cmd>` | Inject secrets in-memory and execute a command |
| `cloak reveal [-f <file>]` | Print decrypted secrets to the console |
| `cloak set <KEY> <VALUE> [-f <file>]` | Add/update a secret directly in `.env.enc` |
| `cloak forget` | Delete the local saved key config |

---

## 🔒 Security

- **Algorithm**: AES-256-GCM (authenticated encryption with associated data).
- **Key derivation**: PBKDF2 with 100,000 iterations of SHA-256.
- **Per‑encryption salt & IV**: A random 16‑byte salt and 12‑byte IV are generated for every `seal` and `set` operation.
- **Auth tag**: GCM authentication tag verified on every `decrypt` — tampered ciphertexts are rejected.
- **In-memory only**: Decrypted secrets are never written to disk. They exist only in the child process's RAM.

---

## 🧪 Development

```bash
git clone https://github.com/SayantanD938/cloak.git
cd cloak
pnpm install
pnpm start --help
```

Run tests:

```bash
pnpm test
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/SayantanD938/cloak/issues).

---

## 📄 License

This project is [MIT](LICENSE) licensed.
