data "terraform_remote_state" "aks" {
  backend = "azurerm"
  config = {
    resource_group_name  = "aymen-deployment"
    container_name       = "container"
    storage_account_name = "aymenstorageaccount"
    key                  = "aksclusterterraform.tfstate"
  }
}


locals {
  kube_config            = one(data.terraform_remote_state.aks.outputs.kube_config)
  host                   = local.kube_config.host
  username               = local.kube_config.username
  password               = local.kube_config.password
  client_certificate     = base64decode(local.kube_config.client_certificate)
  client_key             = base64decode(local.kube_config.client_key)
  cluster_ca_certificate = base64decode(local.kube_config.cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = local.host
    username               = local.username
    password               = local.password
    client_certificate     = local.client_certificate
    client_key             = local.client_key
    cluster_ca_certificate = local.cluster_ca_certificate
  }
}


resource "helm_release" "prometheus" {
  name       = "prometheus"
  chart      = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
}

resource "helm_release" "grafana" {
  name       = "grafana"
  chart      = "grafana"
  repository = "https://grafana.github.io/helm-charts"
}


resource "helm_release" "datadog" {
  name       = "datadog"
  chart      = "datadog"
  repository = "https://helm.datadoghq.com"

  set {
    name  = "datadog.apiKey"
    value = var.apiKey
    type  = "string"
  }
  values = [
    "${file("../../infrastructure/datadog-values.yaml")}"
  ]
}

