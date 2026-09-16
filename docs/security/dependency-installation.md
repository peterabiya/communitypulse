# Dependency Installation and Lockfile Reproducibility

## Purpose

CommunityPulse uses `npm ci` in CI to install dependencies from the committed npm lockfile. This provides a reproducible dependency installation process and prevents CI from silently resolving a different dependency tree.

## CI Installation Requirement

The security workflow installs Node.js dependencies with:

```yaml
- name: Install dependencies
  run: npm ci
```

`npm ci` is used instead of `npm install` for CI installation because the dependency tree is derived from the committed `package-lock.json`.

## Local Verification

The reproducibility check was performed from the repository root using:

```bash
npm ci
```

The installation completed successfully.

Observed result:

```text
added 134 packages, and audited 135 packages
```

The installation also executed the project's Prisma postinstall step and successfully generated Prisma Client version `5.22.0`.

## Lockfile Drift Check

After installation, the repository state and lockfile were checked with:

```bash
git status --short
git diff -- package-lock.json
```

Both commands produced no output related to `package-lock.json`.

This confirms that `npm ci` completed without modifying the committed lockfile.

## Security Significance

The lockfile is treated as part of the repository's dependency-security boundary.

The expected workflow is:

```text
package.json
      +
package-lock.json
      ↓
    npm ci
      ↓
reproducible dependency tree
```

If `package.json` and `package-lock.json` become inconsistent, `npm ci` is expected to fail rather than silently regenerate the lockfile.

This makes dependency changes explicit and reviewable through version-control changes.

## Dependency Audit Observation

The installation reported:

```text
2 vulnerabilities (1 high, 1 critical)
```

These findings are not hidden by the installation process. They are also surfaced by the CI dependency-audit step.

The current project contains a documented Next.js dependency risk that requires separate upgrade evaluation. It is therefore tracked as a known dependency-security issue rather than being silently resolved through an automatic breaking upgrade.

## Installation-Script Warning

The npm installation also reported pending package install scripts for several dependencies, including Clerk and Prisma packages.

These warnings were observed during the reproducibility check and did not prevent installation or Prisma Client generation.

No dependency changes were made as part of this Phase 1 verification.

## Verification Result

| Check                                    | Result                 |
| ---------------------------------------- | ---------------------- |
| `npm ci`                                 | Passed                 |
| Prisma Client generation                 | Passed                 |
| `package-lock.json` modified by `npm ci` | No                     |
| Lockfile drift detected                  | No                     |
| Dependency vulnerabilities reported      | 2 (1 high, 1 critical) |
| Installation completed                   | Yes                    |

## Evidence

The Phase 1 verification consists of:

* Successful local `npm ci`
* Successful Prisma Client generation
* Clean `package-lock.json` diff after installation
* GitHub Actions `npm ci` execution
* GitHub Actions dependency-audit output

## Phase 1 Status

The reproducible dependency-installation portion of Phase 1 is complete.

The remaining Phase 1 evidence is the custom Semgrep authorization control and its regression test.

