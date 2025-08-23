variable "APP_NAME" {
  default = "assessment-platform"
}

variable "REGISTRY_REPO" {
  default = "srajasimman"
}

variable "VERSION" {
  default = "latest"
}

variable "REACT_APP_API_URL" {
  default = "http://${APP_NAME}-server:5000/api"
}

variable "MONGODB_URI" {
    default = "mongodb://mongodb:27017/${APP_NAME}"
}

group "default" {
  targets = ["server", "client"]
}

target "server" {
  context = "./server"
  dockerfile = "Dockerfile"
  tags = [
    "${REGISTRY_REPO}/${APP_NAME}-server:${VERSION}",
    "${REGISTRY_REPO}/${APP_NAME}-server:latest",
  ]
  args = {
    MONGODB_URI = "${MONGODB_URI}"
  } 
}

target "client" {
  context = "./client"
  dockerfile = "Dockerfile"
  tags = [
    "${REGISTRY_REPO}/${APP_NAME}-client:${VERSION}",
    "${REGISTRY_REPO}/${APP_NAME}-client:latest",
  ]
  args = {
    REACT_APP_API_URL = "${REACT_APP_API_URL}"
  }
}