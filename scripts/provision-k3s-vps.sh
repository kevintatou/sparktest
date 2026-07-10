#!/usr/bin/env bash
set -euo pipefail

# Turns a fresh Ubuntu/Debian VPS into a single-node Kubernetes cluster (k3s)
# that the SparkTest backend can submit test Jobs to.
#
# There's no "one-click" way to do this — every PaaS deploy button (Railway,
# Render, Fly) runs your containers on its own orchestration, not a real
# Kubernetes API you can point kubectl at. This script is the one-command
# equivalent: run it once against a fresh VPS, then paste the printed
# kubeconfig into the backend's KUBECONFIG/K8S_API_SERVER env vars
# (e.g. in Railway) so it can create Jobs on that cluster.
#
# Usage:
#   ssh root@<vps-ip> 'bash -s' < scripts/provision-k3s-vps.sh
# or, on the VPS itself:
#   curl -fsSL https://raw.githubusercontent.com/kevintatou/sparktest/main/scripts/provision-k3s-vps.sh | bash

echo "Installing k3s..."
curl -sfL https://get.k3s.io | sh -

echo "Waiting for k3s to be ready..."
until sudo k3s kubectl get nodes >/dev/null 2>&1; do
  sleep 2
done
sudo k3s kubectl wait --for=condition=Ready node --all --timeout=120s

SERVER_IP="$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')"

echo ""
echo "k3s is up. Node status:"
sudo k3s kubectl get nodes

# k3s writes its kubeconfig with an internal 127.0.0.1 server URL — rewrite it
# to the VPS's public IP so remote clients (e.g. Railway) can reach it.
KUBECONFIG_PATH="/tmp/sparktest-kubeconfig.yaml"
sudo cat /etc/rancher/k3s/k3s.yaml | sed "s/127.0.0.1/${SERVER_IP}/" >"${KUBECONFIG_PATH}"
chmod 600 "${KUBECONFIG_PATH}"

echo ""
echo "=================================================================="
echo "Cluster ready. Kubeconfig written to: ${KUBECONFIG_PATH}"
echo ""
echo "Next steps:"
echo "  1. Copy this file's contents into the backend's KUBECONFIG env var"
echo "     (as a file mount, e.g. Railway's 'variables from file' support),"
echo "     or set K8S_API_SERVER=https://${SERVER_IP}:6443 if you already"
echo "     have a kubeconfig loaded and just need the server URL overridden."
echo "  2. Make sure port 6443 is reachable from wherever the backend runs"
echo "     (open it in your VPS firewall / cloud security group)."
echo "  3. Restart the backend — /api/k8s/health should report"
echo "     kubernetes_connected: true."
echo "=================================================================="
