# ============================================================================
# Seed Data Resource - Populate Database with Demo Data
# ============================================================================
# Purpose: Automatically seed the database with realistic demo data after deployment
#
# TWO-STEP PROCESS (für 100% Reproduzierbarkeit):
# 1. FIRST: Load Products from products.json (migrate-to-dynamodb-single.js)
# 2. THEN: Generate Orders/Customers (seed-data.js)
#
# Features:
# - 31 products from products.json with correct imageUrls
# - 30 days of order history
# - 40 customers with various registration dates
# - Updated product stock levels (high/medium/low/critical mix)
# - Realistic revenue patterns and sales distribution
#
# WICHTIG - 100% Reproduzierbarkeit nach Nuclear Cleanup:
# - replace_triggered_by koppelt Seeding an Table-IDs
# - Wenn Tables neu erstellt werden (neue IDs) → Seeding läuft automatisch
# - Keine manuellen Trigger-Bumps mehr nötig!
# ============================================================================

# Step 1: Load Products from products.json
resource "null_resource" "seed_products" {
  # Dependencies: Wait for all tables to be created
  depends_on = [
    aws_dynamodb_table.products,
    aws_dynamodb_table.users,
    aws_dynamodb_table.orders,
    aws_dynamodb_table.carts
  ]

  # Lifecycle: Automatically replace when tables are recreated
  # → Ensures seeding ALWAYS runs after nuclear cleanup + deploy
  lifecycle {
    replace_triggered_by = [
      aws_dynamodb_table.products.id,
      aws_dynamodb_table.users.id,
      aws_dynamodb_table.orders.id,
      aws_dynamodb_table.carts.id
    ]
  }

  # Triggers: Re-run if products.json changes
  triggers = {
    products_hash = filemd5("${path.root}/../backend/src/data/products.json")
  }

  provisioner "local-exec" {
    command = <<-EOT
      echo "📦 Step 1/2: Loading Products from products.json..."
      cd ${path.root}/../backend

      # Install backend dependencies (needed for migrate script)
      echo "   Installing dependencies..."
      npm ci --silent

      # Run product migration
      echo "   Migrating products to DynamoDB..."
      AWS_REGION=${var.aws_region} node scripts/migrate-to-dynamodb-single.js --region ${var.aws_region}

      echo "✅ Products loaded successfully!"
    EOT
  }
}

# Step 2: Generate Orders/Customers (depends on products being loaded)
resource "null_resource" "seed_demo_data" {
  # Dependencies: Wait for products to be loaded FIRST
  depends_on = [
    null_resource.seed_products
  ]

  # Lifecycle: Automatically replace when seed_products is replaced
  # → Ensures demo data seeding runs whenever products are seeded
  lifecycle {
    replace_triggered_by = [
      null_resource.seed_products.id
    ]
  }

  # Triggers: Re-run if seed script changes
  triggers = {
    seed_script_hash = filemd5("${path.root}/scripts/seed-data.js")
  }

  # Provisioner: Install dependencies and run seed script
  # Note: AWS credentials are automatically inherited from the environment
  # - In CI/CD: GitHub Actions provides AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
  # - Locally: AWS_PROFILE from terraform.tfvars or ~/.aws/credentials
  provisioner "local-exec" {
    command = <<-EOT
      echo "📦 Step 2/2: Generating Orders and Customers..."
      npm install --prefix ${path.root}/scripts --silent

      echo "🌱 Running seed data script..."
      AWS_REGION=${var.aws_region} \
      ORDERS_TABLE=${aws_dynamodb_table.orders.name} \
      CUSTOMERS_TABLE=${aws_dynamodb_table.users.name} \
      PRODUCTS_TABLE=${aws_dynamodb_table.products.name} \
      node ${path.root}/scripts/seed-data.js

      echo "✅ Demo data generated successfully!"
    EOT
  }
}

# ============================================================================
# Outputs
# ============================================================================

output "seed_status" {
  description = "Seed data resource status"
  value = {
    enabled = true
    auto_trigger = "replace_triggered_by table IDs (100% reproduzierbar)"
    tables = {
      products = aws_dynamodb_table.products.name
      users = aws_dynamodb_table.users.name
      orders = aws_dynamodb_table.orders.name
      carts = aws_dynamodb_table.carts.name
    }
  }
}
