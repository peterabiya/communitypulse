# Build Provenance and Artifact Attestation

## Purpose

This document records the implementation and verification of build provenance for CommunityPulse Project 9, Phase 2B.

The objective is to establish that a real production build artifact can be cryptographically tied to the GitHub Actions workflow and source repository that produced it, and that the resulting provenance can be independently verified with GitHub CLI.

## Control Implemented

The `Security Checks` workflow in:

```text
.github/workflows/security.yml
```

was extended to:

1. Build the application with `npm run build`.
2. Package the generated `.next` production build into:
   `communitypulse-next-build.tar.gz`.
3. Generate a SHA-256 digest for the packaged artifact.
4. Create a GitHub Build Provenance attestation using `actions/attest@v4`.
5. Upload the production build artifact to GitHub Actions.
6. Verify the downloaded artifact using `gh attestation verify`.

The workflow uses the permissions required for GitHub artifact attestations:

```yaml
permissions:
  contents: read
  pull-requests: read
  id-token: write
  attestations: write
```

## Build Evidence

Successful Security Checks run:

```text
Run ID: 35194165090
Event: push
Branch: main
```

The production build completed successfully with:

```text
Next.js 14.2.35

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (8/8)
✓ Finalizing page optimization
✓ Collecting build traces
```

The generated routes were reported as dynamically server-rendered where applicable.

### Build Artifact

The `.next` directory was packaged with:

```bash
tar -czf communitypulse-next-build.tar.gz .next
sha256sum communitypulse-next-build.tar.gz
```

Recorded SHA-256 digest:

```text
91ca7225cb6fab3e9b059ff1ac42ba2553565e175743a528d066091a6068b98e
```

## GitHub Attestation

The workflow created a Build Provenance attestation for the exact artifact digest:

```text
communitypulse-next-build.tar.gz
@sha256:91ca7225cb6fab3e9b059ff1ac42ba2553565e175743a528d066091a6068b98e
```

GitHub reported:

```text
Attestation type: Build Provenance

Attestation signed using certificate from GitHub Sigstore instance

Attestation uploaded to repository
```

Attestation record:

```text
48191819
```

The attestation was created by the CommunityPulse `Security Checks` workflow.

## Artifact Publication

The production build artifact was uploaded successfully.

```text
Artifact name: communitypulse-next-build
Artifact ID: 10499100611
Artifact size: 13038601 bytes
```

The artifact was downloaded from GitHub Actions with:

```bash
gh run download 35194165090   --repo peterabiya/communitypulse   --name communitypulse-next-build   --dir ./provenance-evidence
```

The downloaded artifact was:

```text
provenance-evidence/communitypulse-next-build.tar.gz
```

The archive was successfully extracted and contained the generated `.next` production build.

## Independent Provenance Verification

The downloaded artifact was verified using:

```bash
gh attestation verify   provenance-evidence/communitypulse-next-build.tar.gz   --repo peterabiya/communitypulse
```

GitHub CLI loaded the artifact digest:

```text
sha256:91ca7225cb6fab3e9b059ff1ac42ba2553565e175743a528d066091a6068b98e
```

It then loaded one matching attestation from the GitHub API.

The verifier enforced these policy criteria:

```text
Predicate type:
https://slsa.dev/provenance/v1

Source Repository Owner URI:
https://github.com/peterabiya

Source Repository URI:
https://github.com/peterabiya/communitypulse

Subject Alternative Name:
(?i)^https://github.com/peterabiya/communitypulse/

OIDC Issuer:
https://token.actions.githubusercontent.com
```

Verification result:

```text
✓ Verification succeeded!
```

The verified attestation identified:

```text
Build repo:
peterabiya/communitypulse

Build workflow:
.github/workflows/security.yml@refs/heads/main

Signer repo:
peterabiya/communitypulse

Signer workflow:
.github/workflows/security.yml@refs/heads/main
```

## Evidence Chain

The completed provenance chain is:

```text
CommunityPulse source repository
        │
        ▼
GitHub Actions Security Checks
        │
        ▼
npm run build
        │
        ▼
.next production build
        │
        ▼
communitypulse-next-build.tar.gz
        │
        ▼
SHA-256 digest
91ca7225cb6fab3e9b059ff1ac42ba2553565e175743a528d066091a6068b98e
        │
        ▼
GitHub Build Provenance attestation
        │
        ▼
GitHub Sigstore signing
        │
        ▼
Downloaded artifact
        │
        ▼
gh attestation verify
        │
        ▼
✓ Verification succeeded
```

## Temporary Repository Visibility Constraint

The repository was temporarily made public so that GitHub artifact attestation could be created for the user-owned repository under the available GitHub plan.

The initial private-repository attempt failed at the attestation step with:

```text
Feature not available for user-owned private repositories.
To enable this feature, please make this repository public.
```

The workflow implementation itself was retained. After the repository was temporarily made public, the same provenance workflow completed successfully and the resulting artifact passed `gh attestation verify`.

This constraint is documented as an environment/platform limitation rather than a replacement of the provenance control with a custom checksum or signing mechanism.

## Observed Build Warnings

The successful build reported several non-blocking warnings:

- No Next.js build cache was configured.
- Next.js displayed its anonymous telemetry notice.
- Webpack reported large-string serialization performance warnings.
- `@upstash/redis/nodejs.mjs` uses `process.version`, which is not supported in the Edge Runtime.
- GitHub Actions reported that Node 20 is being deprecated on the hosted runner.
- `actions/upload-artifact` reported Node deprecation warnings for `punycode` and `url.parse()`.

None of these warnings prevented the production build, artifact packaging, attestation, artifact upload, or provenance verification from succeeding.

They are therefore treated as separate technical follow-up items and are not blockers for the Phase 2B provenance control.

## Phase 2B Result

**Status: COMPLETE**

Acceptance criteria:

- [x] Production build completed successfully.
- [x] Real production build artifact generated.
- [x] Artifact SHA-256 digest recorded.
- [x] GitHub Build Provenance attestation generated.
- [x] Attestation signed through GitHub Sigstore.
- [x] Attestation uploaded to GitHub.
- [x] Production build artifact uploaded.
- [x] Artifact downloaded from GitHub Actions.
- [x] Downloaded artifact matched the attested digest.
- [x] `gh attestation verify` succeeded.
- [x] Repository and workflow identity were verified by the attestation policy.

Phase 2B therefore provides evidence that the generated CommunityPulse production build can be tied to the expected GitHub Actions workflow and repository through verifiable SLSA Build Provenance.
