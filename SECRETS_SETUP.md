# GitHub Repository Secrets Setup Guide

This guide explains how to configure the required GitHub repository secrets for SparkTest deployment workflows.

## Required Secrets

The following secrets must be configured in your GitHub repository to enable automated deployment:

### 1. SERVER_HOST (Required)
- **Description**: IP address or hostname of your server
- **Format**: IPv4 address (e.g., `192.168.1.100`) or hostname (e.g., `myserver.example.com`)
- **Used by**: All deployment workflows

### 2. SSH_PRIVATE_KEY (Required)
- **Description**: Private SSH key for accessing the server
- **Format**: Complete private key including headers
- **Used by**: All deployment workflows

**Example format:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEA2eVqwO5C6LQ9gJlJ2v7g4v7O0x7G8uFv8X7Y9d7H9f7P8w7Y9d7H
... (key content continues) ...
-----END OPENSSH PRIVATE KEY-----
```

### 3. GH_RUNNER_TOKEN (Required for runner deployment)
- **Description**: GitHub runner registration token
- **Format**: Alphanumeric token (typically 10+ characters)
- **Used by**: `deploy-runner.yml` workflow
- **Important**: Tokens expire after 1 hour and must be refreshed

### 4. DROPLET_USER (Optional)
- **Description**: Username for SSH access to the droplet
- **Format**: Username string (e.g., `ubuntu`, `admin`)
- **Default**: `root` (if not specified)
- **Used by**: `deploy.yml` workflow

## How to Set Up Secrets

### Step 1: Access Repository Secrets
1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Each Secret
For each required secret:
1. Enter the secret **Name** (exactly as shown above)
2. Enter the secret **Value**
3. Click **Add secret**

### Step 3: Verify Setup
Use the validation script to check your local environment matches what you'll set as secrets:

```bash
# Set environment variables locally to test
export SERVER_HOST="your.server.ip.address"
export SSH_PRIVATE_KEY="-----BEGIN OPENSSH PRIVATE KEY-----
your-private-key-content
-----END OPENSSH PRIVATE KEY-----"
export GH_RUNNER_TOKEN="your_github_runner_token"

# Run validation
./scripts/validate-secrets.sh
```

## Getting Required Values

### Getting SERVER_HOST
Your server IP address or hostname can be found:
- In your server provider's control panel
- By running `curl ifconfig.me` on the server
- In the server details page
- From your DNS configuration if using a hostname

### Getting SSH_PRIVATE_KEY
This is the private key that corresponds to the public key added to your server:

1. **If you have the key locally:**
   ```bash
   cat ~/.ssh/id_rsa  # or your key file
   ```

2. **If you need to create a new key:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   cat ~/.ssh/id_rsa  # Copy this content
   ```

3. **Add the public key to your server:**
   ```bash
   cat ~/.ssh/id_rsa.pub  # Copy this to server's ~/.ssh/authorized_keys
   ```

### Getting GH_RUNNER_TOKEN
1. Go to: `https://github.com/kevintatou/sparktest/settings/actions/runners/new`
2. Copy the token from the configuration command
3. **Important**: Tokens expire after 1 hour

Example token location in the GitHub UI:
```bash
./config.sh --url https://github.com/kevintatou/sparktest --token ABCDEF123456789
                                                                  ^^^^^^^^^^^^^^
                                                                  This is your token
```

## Workflows That Use These Secrets

### deploy-runner.yml (Deploy Self-Hosted Runner)
- **Secrets used**: `SERVER_HOST`, `SSH_PRIVATE_KEY`, `GH_RUNNER_TOKEN`
- **Trigger**: Push to main (runner files changed) or manual dispatch
- **Purpose**: Deploys GitHub Actions runner to your server

### deploy.yml (Deploy Application)
- **Secrets used**: `SERVER_HOST`, `SSH_PRIVATE_KEY`, `DROPLET_USER` (optional)
- **Trigger**: Release published
- **Purpose**: Deploys the SparkTest application to your server

## Troubleshooting

### Secret Not Found Errors
- Verify secret names match exactly (case-sensitive)
- Check that secrets are set at repository level, not environment level
- Ensure you're in the correct repository

### SSH Connection Failures
- Verify SERVER_HOST is correct and reachable
- Test SSH connection manually: `ssh root@your-server-host`
- Check that the private key corresponds to a public key on the server
- Ensure the private key includes the complete content with headers

### GitHub Token Issues
- Tokens expire after 1 hour - get a fresh token
- Ensure the token is for the correct repository
- Verify the token hasn't been used already (tokens are single-use)

### Permission Errors
- Ensure the SSH user has Docker permissions
- Check that the user can write to the target directory
- Verify Docker and Docker Compose are installed on the server

## Security Best Practices

1. **Rotate secrets regularly**
   - Change SSH keys periodically
   - Refresh GitHub tokens as needed

2. **Use minimal permissions**
   - Create dedicated SSH keys for deployment
   - Use non-root users when possible

3. **Monitor secret usage**
   - Check workflow logs for unexpected access
   - Review deployment history regularly

4. **Secure your server**
   - Disable password authentication
   - Use SSH key authentication only
   - Keep the system updated

## Testing Your Setup

1. **Validate locally:**
   ```bash
   ./scripts/validate-secrets.sh
   ```

2. **Test deployment:**
   - Trigger the runner deployment workflow manually
   - Check that the runner appears in GitHub Actions settings
   - Verify the application deployment on release

3. **Monitor workflow execution:**
   - Check Actions tab for workflow status
   - Review logs for any errors
   - Verify services are running on the droplet

## Getting Help

If you encounter issues:

1. **Check the validation script output**
2. **Review GitHub Actions logs**
3. **Test SSH connection manually**
4. **Verify Docker is running on the server**
5. **Check server resources (disk space, memory)**

For more detailed troubleshooting, see the workflow-specific error messages in the GitHub Actions logs.