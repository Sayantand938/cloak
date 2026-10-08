# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] — 2025-03-19

### Added

- `set` command — add or update environment variables directly inside an encrypted `.env.enc` file without manual decrypt/re-encrypt.
- `reveal` command — print decrypted secrets to the terminal.
- `forget` command — delete the local master key configuration file.

### Changed

- Project fully restructured for npm publishing:
  - Source code moved to `src/` with modular command files.
  - CLI entry point is now `bin/cloak.js`.
  - Renamed CLI binary from `env-encrypter` to `cloak` to match the package name.
- Upgraded `commander` to v15, `@inquirer/prompts` to v8.
- Improved error messaging and exit codes.

### Fixed

- Resolved edge case where `seal` would write empty payloads if the source file was empty.
- `set` command now properly escapes double-quotes in values.

### Security

- PBKDF2 iteration count remains at 100,000 with SHA-256.
- AES-256-GCM with random 12-byte IV and 16-byte salt on every encryption.

## [1.0.0] — 2025-02-15

### Added

- `init` command — generate a 256-bit master key and save it locally.
- `seal` command — encrypt a `.env` file into `.env.enc` using AES-256-GCM.
- `run` command — decrypt `.env.enc` in-memory and spawn a child process with injected environment variables.
- Master key resolution from `~/.env-encrypter.yaml`, `~/.env-encrypter.json`, or `$ENV_KEY`.
- Interactive password prompt fallback.
