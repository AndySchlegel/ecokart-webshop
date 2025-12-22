# ============================================================================
# Assets Module - S3 + CloudFront für Produktbilder
# ============================================================================
# Purpose: 100% reproduzierbare Lösung für Produktbilder
#
# Features:
# - S3 Bucket für Bilder (private)
# - CloudFront CDN für schnelle Auslieferung (public)
# - Funktioniert ÜBERALL (Frontend, Emails, etc.)
# - Lifecycle Policy für alte Versionen
# - Terraform-managed → 100% reproduzierbar
# ============================================================================

# ----------------------------------------------------------------------------
# S3 Bucket für Assets (Produktbilder, etc.)
# ----------------------------------------------------------------------------

resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-${var.environment}-assets"

  # CRITICAL: Enable force_destroy for Nuclear Cleanup
  # Allows terraform destroy to delete bucket even if it contains objects
  # Required for 100% reproducible infrastructure
  force_destroy = true

  tags = merge(
    var.tags,
    {
      Name        = "${var.project_name}-${var.environment}-assets"
      Description = "Product images and static assets"
    }
  )
}

# Bucket Versioning aktivieren (für Lifecycle Management)
resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-Side Encryption aktivieren
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Public Access blockieren (Zugriff nur über CloudFront)
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle Policy: Alte Versionen nach 30 Tagen löschen
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# ----------------------------------------------------------------------------
# CloudFront Origin Access Identity (für privaten S3-Zugriff)
# ----------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_identity" "assets" {
  comment = "OAI for ${var.project_name}-${var.environment}-assets"
}

# S3 Bucket Policy: Nur CloudFront darf lesen
resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.assets.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.assets.arn}/*"
      }
    ]
  })
}

# ----------------------------------------------------------------------------
# CloudFront Distribution für Assets
# ----------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "assets" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name}-${var.environment} Assets CDN"
  default_root_object = "index.html"
  price_class         = var.cloudfront_price_class

  # Origin: S3 Bucket
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.assets.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.assets.cloudfront_access_identity_path
    }
  }

  # Default Cache Behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.assets.id}"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400   # 1 day
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  # Cache Policy: Optimized for images
  ordered_cache_behavior {
    path_pattern     = "/images/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.assets.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 2592000  # 30 days
    max_ttl                = 31536000 # 1 year
    compress               = true
  }

  # Geo Restriction (none)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate (CloudFront default)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.tags
}

# ----------------------------------------------------------------------------
# Automatic Image Upload to S3 (100% Reproducible)
# ----------------------------------------------------------------------------
# Uploads all product images from ./images/ to S3 bucket
# Runs automatically on terraform apply
# Re-runs when images change (based on directory hash)

resource "null_resource" "upload_images" {
  # Trigger re-upload when images directory changes
  triggers = {
    # This will re-run if any file in images/ changes
    images_dir = md5(join("", [for f in fileset("${path.module}/images", "*") : filemd5("${path.module}/images/${f}")]))
    bucket_id  = aws_s3_bucket.assets.id
  }

  # Upload all images to S3
  provisioner "local-exec" {
    command = <<-EOT
      echo "📸 Uploading product images to S3..."
      aws s3 sync ${path.module}/images s3://${aws_s3_bucket.assets.id}/images/ \
        --region ${data.aws_region.current.name} \
        --delete \
        --exclude ".*" \
        --exclude "*.md"
      echo "✅ Images uploaded successfully!"
    EOT
  }

  depends_on = [
    aws_s3_bucket.assets,
    aws_s3_bucket_public_access_block.assets,
    aws_s3_bucket_policy.assets
  ]
}

# Get current AWS region
data "aws_region" "current" {}

