# Product Images - Source of Truth

This directory contains all product images for the Ecokart webshop.

## 🎯 Purpose

These images are the **single source of truth** for all product imagery in the system.

## 📦 Deployment

Images are automatically uploaded to S3 + CloudFront on every `terraform apply`:

1. Terraform calculates MD5 hash of all images
2. If hash changed → triggers upload via `aws s3 sync`
3. Images become available at: `https://{cloudfront-domain}/images/{filename}`

## 🔄 100% Reproducible

```bash
# Nuclear cleanup
terraform destroy  # Deletes S3 bucket (force_destroy enabled)

# Rebuild everything
terraform apply    # Creates S3, uploads images automatically
# → System is 100% functional again
```

## 📁 File Naming Convention

- Use descriptive names: `product-name-feature.jpg`
- Keep original dimensions (optimized by CloudFront)
- Supported formats: `.jpg`, `.png`, `.webp`

## ➕ Adding New Images

1. Add image file to this directory
2. Run `terraform apply`
3. Image is automatically uploaded to S3
4. Update `products.json` with CloudFront URL

## 🗑️ Removing Images

1. Delete image file from this directory
2. Run `terraform apply`
3. Image is automatically removed from S3 (via `--delete` flag)

## 📊 Current Images

- `nba-8176216_1280.png` - Court Legends Jersey
- `jordan-4657349_1280.jpg` - Air Jordan products
- `jordan-shoes-1777572_1280.jpg` - Jordan sneakers
- `nike-5418992_1280.jpg` - Nike products
- `sneakers-5578127_1280.jpg` - General sneakers

Total size: ~2.2 MB
