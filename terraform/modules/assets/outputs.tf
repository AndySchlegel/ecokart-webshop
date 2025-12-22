# ============================================================================
# Assets Module Outputs
# ============================================================================

output "bucket_name" {
  description = "S3 Bucket Name für Assets"
  value       = aws_s3_bucket.assets.id
}

output "bucket_arn" {
  description = "S3 Bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "bucket_regional_domain_name" {
  description = "S3 Bucket Regional Domain Name"
  value       = aws_s3_bucket.assets.bucket_regional_domain_name
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution Domain Name (für product imageUrl)"
  value       = aws_cloudfront_distribution.assets.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.assets.id
}

output "cloudfront_arn" {
  description = "CloudFront Distribution ARN"
  value       = aws_cloudfront_distribution.assets.arn
}

output "assets_base_url" {
  description = "Base URL für Assets (https://cloudfront-domain)"
  value       = "https://${aws_cloudfront_distribution.assets.domain_name}"
}
