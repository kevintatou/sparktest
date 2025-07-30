---
name: Deployment Issue
about: Report problems with GitHub Actions deployment workflows
title: "[DEPLOYMENT] "
labels: ["deployment", "bug"]
assignees: []
---

## Deployment Issue Description

**Which workflow is failing?**
- [ ] Deploy Self-Hosted Runner (`deploy-runner.yml`)
- [ ] Deploy to Droplet (`deploy.yml`)
- [ ] Other: ___________

**What happened?**
A clear description of what went wrong.

**What did you expect to happen?**
A clear description of what you expected.

## Environment Information

**Droplet Information:**
- Operating System: [e.g., Ubuntu 22.04]
- Docker Version: [run `docker --version` on droplet]
- Available Disk Space: [run `df -h` on droplet]
- Available Memory: [run `free -h` on droplet]

**GitHub Secrets Status:**
- [ ] DROPLET_IP is set
- [ ] SSH_PRIVATE_KEY is set  
- [ ] GH_RUNNER_TOKEN is set (for runner deployment)
- [ ] DROPLET_USER is set (optional, for app deployment)

## Troubleshooting Steps Completed

**Please check off the steps you've already tried:**

- [ ] Ran the validation script: `./scripts/validate-secrets.sh`
- [ ] Verified secrets are set in repository settings
- [ ] Tested SSH connection manually: `ssh user@droplet-ip`
- [ ] Checked that Docker is running on the droplet
- [ ] Verified droplet has sufficient resources (disk/memory)
- [ ] Refreshed GitHub runner token (if applicable)
- [ ] Reviewed GitHub Actions workflow logs

## Error Details

**GitHub Actions Error Log:**
```
[Paste the error from the GitHub Actions workflow log here]
```

**Droplet Error Log (if applicable):**
```
[If you have access to the droplet, paste any relevant logs here]
```

**Local Validation Output:**
```bash
# Run this command locally and paste the output:
# ./scripts/validate-secrets.sh
[Paste output here]
```

## Workflow Run Information

**Workflow Run URL:**
[Link to the failed GitHub Actions run]

**Trigger:**
- [ ] Manual dispatch
- [ ] Push to main
- [ ] Release published
- [ ] Other: ___________

## SSH Connection Test

**Can you connect to the droplet manually?**
```bash
# Try this command and paste the result:
ssh user@your-droplet-ip "echo 'Connection successful' && docker --version"
```

**SSH Connection Result:**
```
[Paste result here]
```

## Additional Context

Add any other context about the problem here, including:
- Recent changes to the repository
- Changes to the droplet configuration
- Network or firewall changes
- When the deployment last worked successfully

## Checklist

- [ ] I have read the [Secrets Setup Guide](../SECRETS_SETUP.md)
- [ ] I have run the validation script locally
- [ ] I have tested SSH connection manually
- [ ] I have checked the GitHub Actions logs
- [ ] I have verified my secrets are correctly configured