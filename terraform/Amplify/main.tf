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
  branch_name = "main"
  stage       = "PRODUCTION"

  enable_auto_build = false
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
}


resource "aws_amplify_webhook" "stage" {
  app_id      = aws_amplify_app.main.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "stage"
}

