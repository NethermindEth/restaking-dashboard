terraform {
  backend "s3" {
    bucket = "restaking-dashboard-terraform-state"
    key    = "frontend.tfstate"
    region = "us-east-2"
  }

}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "Restaking Dashboard"
    }
  }
}
