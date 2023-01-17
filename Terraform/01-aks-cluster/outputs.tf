output "kube_config" {
  value     = azurerm_kubernetes_cluster.example.kube_config
  sensitive = true
}