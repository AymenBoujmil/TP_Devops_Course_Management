resource "helm_release" "infra" {
  name = var.release_name
  chart = var.chart
}