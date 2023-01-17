terraform {
  required_providers {
    helm = {
        source = "hashicorp/helm"
        version = "~>2.8.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "aymen-deployment"
    container_name       = "container"
    storage_account_name = "aymenstorageaccount"
    key                  = "infraterraform.tfstate"
  }
}