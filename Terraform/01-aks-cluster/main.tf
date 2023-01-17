# Pulling information about the resource group
data "azurerm_resource_group" "dev" {
  name = var.resource_group_name
}

resource "azurerm_kubernetes_cluster" "example" {
  name                = "devops-cluster-terraform"
  location            = data.azurerm_resource_group.dev.location
  resource_group_name = data.azurerm_resource_group.dev.name
  http_application_routing_enabled = true

  dns_prefix          = "devops"
  sku_tier            = "Free"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Development"
  }
}