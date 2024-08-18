resource "aws_amplify_app" "main" {
  name       = "restaking-dashboard"
  repository = "https://github.com/NethermindEth/restaking-dashboard"

  environment_variables = {
    "ENV" = "prod"
  }

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }
    custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = var.main_branch
  stage       = "PRODUCTION"

  enable_auto_build = false
}

resource "aws_amplify_branch" "dev" {
  app_id = aws_amplify_app.main.id
  branch_name = var.dev_branch
  stage       = "DEVELOPMENT"

  environment_variables = {
    NODE_ENV = "development"
  }

  enable_auto_build = true
}

resource "aws_amplify_domain_association" "main" {
  app_id      = aws_amplify_app.main.id
  domain_name = "restaking.info"

  wait_for_verification = false

  # https://stage.restaking.info
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "stage"
  }

  # https://prod.restaking.info
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "prod"
  }

  # https://dev.restaking.info
  sub_domain {
    branch_name = aws_amplify_branch.dev.branch_name
    prefix      = "dev"
  }
}

resource "aws_amplify_webhook" "stage" {
  app_id      = aws_amplify_app.main.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "stage"
}

resource "aws_amplify_webhook" "dev" {
  app_id      = aws_amplify_app.main.id
  branch_name = aws_amplify_branch.dev.branch_name
  description = "development"
}



output "amplify_app_id" {
  value = aws_amplify_app.main.id
}

output "amplify_app_url" {
  value = aws_amplify_domain_association.main.sub_domain
}

output "aws_amplify_webhook_stage" {
  value = aws_amplify_webhook.stage
}


output "aws_amplify_webhook_dev" {
  value = aws_amplify_webhook.dev
}
