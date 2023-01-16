# Pulling information about the resource group
data "azurerm_resource_group" "dev" {
  name = var.resource_group_name
}

resource "azurerm_kubernetes_cluster" "example" {
  name                = "devops-cluster"
  location            = data.azurerm_resource_group.dev.location
  resource_group_name = data.azurerm_resource_group.dev.name
  dns_prefix          = "devops"
  sku_tier            = "Free"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "standard_ds2_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Development"
  }
}