
output "aws_amplify_domain_association" {
  value =  aws_amplify_domain_association.main.sub_domain
}

output "aws_amplify_webhook"{
value =  aws_amplify_webhook.stage.url
}
