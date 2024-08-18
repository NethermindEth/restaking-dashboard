variable "main_branch" {
  description = "The branch name for the AWS Amplify stage environment"
  type        = string
  default     = "main"  # You can set a default value or leave it empty
}


variable "dev_branch" {
  description = "The branch name for the AWS Amplify deployment"
  type        = string
  default     = "dev"  # You can set a default value or leave it empty
}
